import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { DISPLAY_DSH_VERSION, DISPLAY_PATCHES } from './display-patch-spec.mjs'
import { verifyDisplayStagingReceipt } from './verify-display-staging-receipt.mjs'

const hash = bytes => createHash('sha256').update(bytes).digest('hex').toUpperCase()
const normalize = value => value.replaceAll('\\', '/').toLowerCase()
const inside = (root, candidate) => {
  const a = normalize(resolve(root)); const b = normalize(resolve(candidate))
  return b === a || b.startsWith(a + '/')
}
const readJson = path => JSON.parse(readFileSync(path, 'utf8'))
const scanNoReparse = root => {
  const stack = [root]
  while (stack.length > 0) {
    const directory = stack.pop()
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`Materialized runtime contains reparse point: ${path}`)
    if (entry.isDirectory()) stack.push(path)
    }
  }
}
const actualManifest = root => {
  const stack = [{ directory: root, current: '' }]
  const entries = []
  while (stack.length > 0) {
    const { directory, current } = stack.pop()
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(directory, entry.name)
      const relativePath = current ? `${current}/${entry.name}` : entry.name
      const info = lstatSync(path)
      if (info.isSymbolicLink()) throw new Error(`Materialized runtime contains reparse point: ${path}`)
      if (info.isDirectory()) stack.push({ directory: path, current: relativePath })
      else if (info.isFile()) {
        const physical = statSync(path, { bigint: true })
        entries.push({ path: relativePath.replaceAll('\\', '/'), type: 'file', bytes: physical.size.toString(), dev: physical.dev.toString(), ino: physical.ino.toString(), nlink: physical.nlink.toString() })
      } else throw new Error(`Materialized runtime contains unknown entry: ${path}`)
    }
  }
  return entries.sort((a, b) => a.path.localeCompare(b.path))
}

export function verifyDisplayMaterializedReceipt(pointerPath, desktopRoot) {
  if (!existsSync(pointerPath) || lstatSync(pointerPath).isSymbolicLink()) throw new Error('Materialized runtime pointer is missing or not a regular file')
  const pointer = readJson(pointerPath)
  const repositoryRoot = resolve(desktopRoot, '..', '..')
  const runsRoot = resolve(repositoryRoot, '.runs')
  if (pointer.schemaVersion !== 1 || pointer.dshVersion !== DISPLAY_DSH_VERSION || typeof pointer.outputRoot !== 'string' || typeof pointer.receiptPath !== 'string' || !inside(runsRoot, pointer.outputRoot) || !inside(runsRoot, pointer.receiptPath) || basename(resolve(pointer.outputRoot, '..', '..')) !== pointer.runId) throw new Error('Materialized runtime pointer is invalid')
  if (!existsSync(pointer.outputRoot) || !existsSync(pointer.receiptPath) || lstatSync(pointer.outputRoot).isSymbolicLink() || lstatSync(pointer.receiptPath).isSymbolicLink() || !inside(runsRoot, realpathSync(pointer.outputRoot)) || !inside(runsRoot, realpathSync(pointer.receiptPath))) throw new Error('Materialized runtime pointer escapes .runs')
  const receipt = readJson(pointer.receiptPath)
  if (receipt.schemaVersion !== 1 || receipt.runId !== pointer.runId || receipt.outputRoot !== pointer.outputRoot || receipt.dshVersion !== pointer.dshVersion || !Array.isArray(receipt.targetOutputPaths) || receipt.targetCopyCount !== receipt.targetOutputPaths.length || !Number.isInteger(receipt.fileCount) || !Number.isInteger(receipt.copyFallbackCount) || !Array.isArray(receipt.copyFallbacks)) throw new Error('Materialized runtime receipt mismatch')
  const staging = verifyDisplayStagingReceipt(join(desktopRoot, 'build', 'workdsh-display-staging.json'), desktopRoot)
  if ((receipt.inputStagingRunId ?? receipt.inputRunId) !== staging.receipt.runId || receipt.inputReceiptPath !== staging.pointer.receiptPath) throw new Error('Materialized runtime input staging mismatch')
  const manifestRoot = resolve(pointer.outputRoot, '..', '..')
  const manifestPath = join(manifestRoot, receipt.manifest.path)
  if (!existsSync(manifestPath) || lstatSync(manifestPath).isSymbolicLink() || !inside(manifestRoot, realpathSync(manifestPath)) || hash(Buffer.from(JSON.stringify(readJson(manifestPath)), 'utf8')) !== receipt.manifest.sha256) throw new Error('Materialized runtime manifest mismatch')
  const manifest = readJson(manifestPath)
  if (manifest.length !== receipt.fileCount) throw new Error('Materialized runtime file count mismatch')
  const actual = actualManifest(pointer.outputRoot)
  if (JSON.stringify(actual) !== JSON.stringify(manifest)) throw new Error('Materialized runtime actual tree differs from receipt manifest')
  const manifestByPath = new Map(manifest.map(item => [item.path, item]))
  if (!Array.isArray(receipt.outputOrigins) || receipt.outputOrigins.length !== manifest.length || new Set(receipt.outputOrigins.map(item => item.output)).size !== manifest.length) throw new Error('Materialized output origin manifest is incomplete or duplicated')
  const stagingRunRoot = resolve(staging.pointer.receiptPath, '..')
  const stagingManifestPath = join(stagingRunRoot, staging.receipt.stagingManifest.path)
  const stagingManifest = readJson(stagingManifestPath)
  const stagingByPath = new Map(stagingManifest.map(item => [item.path, item]))
  for (const origin of receipt.outputOrigins) {
    const output = manifestByPath.get(origin.output)
    const source = stagingByPath.get(origin.source)
    if (!output || !source || output.type !== 'file' || source.type !== 'file' || output.bytes !== String(origin.outputBytes ?? origin.bytes) || output.dev !== origin.outputDev || output.ino !== origin.outputIno || output.nlink !== origin.outputNlink || source.bytes !== String(origin.sourceBytes ?? origin.bytes) || source.dev !== origin.sourceDev || source.ino !== origin.sourceIno || source.nlink !== origin.sourceNlink) throw new Error(`Materialized output origin mismatch: ${origin.output}`)
    if (origin.mode !== 'target' && output.bytes !== source.bytes) throw new Error(`Materialized non-target bytes changed: ${origin.output}`)
    if (origin.mode === 'hardlink' && (origin.sourceDev !== origin.outputDev || origin.sourceIno !== origin.outputIno)) throw new Error(`Materialized hardlink identity mismatch: ${origin.output}`)
    if (origin.mode === 'fallback' && (origin.sourceDev === origin.outputDev && origin.sourceIno === origin.outputIno || Number(origin.sourceNlink) <= 1 || !receipt.copyFallbacks.some(item => item.path === origin.output && item.reason === 'EPERM+nlink>1'))) throw new Error(`Materialized fallback identity mismatch: ${origin.output}`)
    if (origin.mode === 'target' && origin.sourceDev === origin.outputDev && origin.sourceIno === origin.outputIno) throw new Error(`Materialized target shares source inode: ${origin.output}`)
  }
  const stagingByPhysical = new Map(staging.receipt.changedFiles.map(item => [item.physicalRelative, item]))
  const seenTargets = new Set()
  const seenTargetOutputs = new Set()
  for (const target of receipt.targetOutputPaths) {
    const changed = stagingByPhysical.get(target.physicalRelative)
    const entry = manifestByPath.get(target.output)
    const origin = receipt.outputOrigins.find(item => item.output === target.output)
    if (!changed || !entry || entry.type !== 'file' || !origin || origin.mode !== 'target' || origin.source !== target.physicalRelative || seenTargetOutputs.has(target.output) || !inside(pointer.outputRoot, join(pointer.outputRoot, target.output))) throw new Error(`Materialized target occurrence is invalid: ${target.output}`)
    const bytes = readFileSync(join(pointer.outputRoot, target.output))
    const patch = DISPLAY_PATCHES.find(item => item.id === changed.id)
    if (!patch || origin.id !== patch.id || Number(origin.outputBytes) !== bytes.length || origin.outputSha256 !== hash(bytes) || target.bytes !== patch.patchedBytes || target.sha256 !== patch.patchedSha256 || bytes.length !== patch.patchedBytes || hash(bytes) !== patch.patchedSha256) throw new Error(`Materialized target occurrence hash mismatch: ${target.output}`)
    seenTargets.add(target.physicalRelative)
    seenTargetOutputs.add(target.output)
  }
  if (seenTargets.size !== DISPLAY_PATCHES.length) throw new Error('Materialized output is missing a display target source')
  const fallbackSet = new Set(receipt.copyFallbacks.map(item => item.path))
  const targetPaths = new Set(receipt.targetOutputPaths.map(item => item.output))
  const originFallbackSet = new Set(receipt.outputOrigins.filter(item => item.mode === 'fallback').map(item => item.output))
  if (fallbackSet.size !== originFallbackSet.size || [...fallbackSet].some(path => !originFallbackSet.has(path)) || [...originFallbackSet].some(path => targetPaths.has(path))) throw new Error('Materialized fallback/output target sets overlap or differ')
  const fallbackFiles = receipt.outputOrigins.filter(item => item.mode === 'fallback').length
  const hardlinkFiles = receipt.outputOrigins.filter(item => item.mode === 'hardlink').length
  if (fallbackFiles !== fallbackSet.size || [...fallbackSet].some(path => !manifestByPath.has(path) || targetPaths.has(path))) throw new Error('Materialized fallback path closure mismatch')
  if (hardlinkFiles !== receipt.hardlinkCount || fallbackFiles !== receipt.copyFallbackCount || hardlinkFiles + fallbackFiles + receipt.targetCopyCount !== manifest.length) throw new Error('Materialized regular-file closure counts mismatch')
  scanNoReparse(pointer.outputRoot)
  return { pointer, receipt, staging }
}
