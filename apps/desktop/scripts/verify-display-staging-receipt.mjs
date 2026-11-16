import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'
import { DISPLAY_DSH_VERSION, DISPLAY_PATCHES } from './display-patch-spec.mjs'

const hash = bytes => createHash('sha256').update(bytes).digest('hex').toUpperCase()
const normalize = value => value.replaceAll('\\', '/').toLowerCase()
const inside = (root, candidate) => {
  const a = normalize(resolve(root))
  const b = normalize(resolve(candidate))
  return b === a || b.startsWith(a + '/')
}
const readJson = path => JSON.parse(readFileSync(path, 'utf8'))
const realInside = (root, candidate) => {
  try { return inside(root, realpathSync(candidate)) } catch { return false }
}

export function verifyDisplayStagingReceipt(pointerPath, desktopRoot) {
  if (!existsSync(pointerPath)) throw new Error(`Display staging pointer is missing: ${pointerPath}`)
  const pointer = readJson(pointerPath)
  const repositoryRoot = resolve(desktopRoot, '..', '..')
  const runsRoot = resolve(repositoryRoot, '.runs')
  if (lstatSync(pointerPath).isSymbolicLink()) throw new Error('Display staging pointer must be a regular file')
  if (pointer.schemaVersion !== 2 || pointer.dshVersion !== DISPLAY_DSH_VERSION || typeof pointer.stagingRoot !== 'string' || typeof pointer.receiptPath !== 'string') throw new Error('Display staging pointer schema/version mismatch')
  if (!inside(runsRoot, pointer.stagingRoot) || !inside(runsRoot, pointer.receiptPath) || !realInside(runsRoot, pointer.stagingRoot) || !realInside(runsRoot, pointer.receiptPath) || !existsSync(pointer.stagingRoot) || !existsSync(pointer.receiptPath)) throw new Error('Display staging pointer escapes .runs or points to missing data')
  const runRoot = resolve(pointer.stagingRoot, '..', '..')
  if (!inside(runsRoot, runRoot) || basename(runRoot) !== pointer.runId || !inside(runRoot, pointer.stagingRoot) || !inside(runRoot, pointer.receiptPath) || !realInside(runRoot, pointer.stagingRoot) || !realInside(runRoot, pointer.receiptPath)) throw new Error('Display staging run paths are inconsistent')
  const receipt = readJson(pointer.receiptPath)
  const expectedSource = resolve(desktopRoot, 'build', 'workdsh-runtime')
  if (receipt.schemaVersion !== 2 || receipt.runId !== pointer.runId || receipt.dshVersion !== pointer.dshVersion || resolve(receipt.sourceRoot) !== expectedSource || resolve(receipt.stagingRoot) !== resolve(pointer.stagingRoot)) throw new Error('Display staging receipt source/run mismatch')
  if (receipt.volumes?.source !== receipt.volumes?.staging || receipt.targetCopyCount !== DISPLAY_PATCHES.length || receipt.hardlinkCount <= 0 || !Number.isInteger(receipt.copyFallbackCount) || !Array.isArray(receipt.copyFallbacks) || receipt.copyFallbacks.length !== receipt.copyFallbackCount || !Array.isArray(receipt.junctionMappings)) throw new Error('Display staging receipt counts/volumes are incomplete')
  for (const mapping of receipt.junctionMappings) {
    if (!inside(pointer.stagingRoot, mapping.stagingTarget) || normalize(mapping.stagingTarget).includes(normalize(receipt.sourceRoot))) throw new Error(`Display staging link mapping is unsafe: ${mapping.path}`)
  }
  for (const patch of DISPLAY_PATCHES) {
    const changed = receipt.changedFiles?.find(item => item.id === patch.id)
    if (!changed || changed.after?.sha256 !== patch.patchedSha256 || changed.after?.bytes !== patch.patchedBytes || changed.before?.sha256 !== patch.originalSha256 || changed.physicalRelative === undefined) throw new Error(`Display staging receipt misses ${patch.id}`)
  }
  const manifests = {}
  for (const [name, manifest] of Object.entries({ source: receipt.sourceManifest, staging: receipt.stagingManifest })) {
    const manifestPath = manifest?.path ? join(runRoot, manifest.path) : ''
    if (!manifest?.path || !inside(runRoot, manifestPath) || !realInside(runRoot, manifestPath) || !existsSync(manifestPath)) throw new Error('Display staging manifest path is invalid')
    const entries = readJson(manifestPath)
    if (hash(Buffer.from(JSON.stringify(entries), 'utf8')) !== manifest.sha256) throw new Error(`Display staging manifest digest mismatch: ${manifest.path}`)
    manifests[name] = entries
  }
  const sourceEntries = new Map(manifests.source.map(item => [item.path, item]))
  const stagingEntries = new Map(manifests.staging.map(item => [item.path, item]))
  for (const changed of receipt.changedFiles) {
    const source = sourceEntries.get(changed.physicalRelative)
    const staged = stagingEntries.get(changed.physicalRelative)
    if (!source || !staged || source.type !== 'file' || staged.type !== 'file' || source.bytes !== String(changed.before.bytes) || staged.bytes !== String(changed.after.bytes) || (source.dev === staged.dev && source.ino === staged.ino)) throw new Error(`Display staging manifest target mismatch: ${changed.id}`)
  }
  for (const mapping of receipt.junctionMappings) {
    const source = sourceEntries.get(mapping.path)
    const staged = stagingEntries.get(mapping.path)
    const sourceRelative = normalize(relative(receipt.sourceRoot, mapping.sourceResolved))
    const stagingRelative = normalize(relative(receipt.stagingRoot, mapping.stagingTarget))
    if (!source || !staged || source.type !== 'symlink' || staged.type !== 'symlink' || staged.target !== mapping.stagingTarget || sourceRelative !== stagingRelative || inside(receipt.sourceRoot, mapping.stagingTarget)) throw new Error(`Display staging manifest link mismatch: ${mapping.path}`)
  }
  const targetRel = new Set(receipt.changedFiles.map(item => item.physicalRelative))
  const fallbackRel = new Set(receipt.copyFallbacks.map(item => item.path))
  let hardlinks = 0
  let fallbackCopies = 0
  for (const [path, source] of sourceEntries) {
    const staged = stagingEntries.get(path)
    if (source.type === 'file' && !targetRel.has(path) && staged?.dev === source.dev && staged?.ino === source.ino) hardlinks += 1
    if (source.type === 'file' && fallbackRel.has(path)) {
      if (staged?.dev === source.dev && staged?.ino === source.ino) throw new Error(`Display staging fallback still shares source inode: ${path}`)
      if (staged?.bytes !== source.bytes) throw new Error(`Display staging fallback size mismatch: ${path}`)
      fallbackCopies += 1
    }
  }
  if (hardlinks !== receipt.hardlinkCount) throw new Error(`Display staging hardlink count mismatch: ${hardlinks}/${receipt.hardlinkCount}`)
  if (fallbackCopies !== receipt.copyFallbackCount) throw new Error(`Display staging fallback count mismatch: ${fallbackCopies}/${receipt.copyFallbackCount}`)
  const nonTargetFiles = [...sourceEntries.values()].filter(item => item.type === 'file' && !targetRel.has(item.path)).length
  if (hardlinks + fallbackCopies !== nonTargetFiles) throw new Error(`Display staging non-target closure mismatch: ${hardlinks}+${fallbackCopies}/${nonTargetFiles}`)
  return { pointer, receipt, runRoot }
}
