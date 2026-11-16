#!/usr/bin/env node

/** Create a run-scoped, copy-on-write display-patched DSH Profile. */
import { createHash } from 'node:crypto'
import { copyFile, link, lstat, mkdir, readdir, readFile, readlink, realpath, rm, stat, symlink, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DISPLAY_DSH_VERSION as dshVersion, DISPLAY_PATCHES as patches } from './display-patch-spec.mjs'

const desktopRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = resolve(desktopRoot, '..', '..')
const sourceRoot = resolve(process.env.WORKDSH_DISPLAY_SOURCE ?? join(desktopRoot, 'build', 'workdsh-runtime'))
const runsRoot = resolve(join(repositoryRoot, '.runs'))
const pointerPath = join(desktopRoot, 'build', 'workdsh-display-staging.json')
const runId = process.env.WORKDSH_DISPLAY_RUN_ID ?? `r74-ai-expert-branding-staging-${new Date().toISOString().replaceAll(/[-:.TZ]/gu, '').slice(0, 14)}-${process.pid}`
const runRoot = resolve(process.env.WORKDSH_DISPLAY_RUN_DIR ?? join(runsRoot, runId))
const stagingRoot = resolve(join(runRoot, 'staging', 'workdsh-runtime'))
let targetPaths = new Set()
const hash = bytes => createHash('sha256').update(bytes).digest('hex').toUpperCase()
const normalize = value => value.replaceAll('\\', '/')
const inside = (root, candidate) => {
  const a = normalize(resolve(root)).toLowerCase()
  const b = normalize(resolve(candidate)).toLowerCase()
  return b === a || b.startsWith(a + '\\') || b.startsWith(a + '/')
}
const fail = message => { throw new Error(`Display staging refused: ${message}`) }
const exists = async path => { try { await lstat(path); return true } catch { return false } }

async function packageVersion(root, relativePath, expectedName) {
  let manifest
  try { manifest = JSON.parse(await readFile(join(root, relativePath), 'utf8')) } catch { fail(`missing package manifest: ${relativePath}`) }
  if (manifest.name !== expectedName || manifest.version !== dshVersion) fail(`package/version mismatch: ${expectedName}`)
}

async function targetHash(root, patch, relativePath = patch.relative) {
  const bytes = await readFile(join(root, relativePath))
  return { bytes: bytes.length, sha256: hash(bytes), text: bytes.toString('utf8') }
}

const junctionMappings = []
const pendingLinks = []
let hardlinkCount = 0
let copyFallbackCount = 0
const copyFallbacks = []
let targetCopyCount = 0
let symlinkCount = 0
let entryCount = 0

async function stageEntry(sourcePath, destinationPath, relativePath) {
  const info = await lstat(sourcePath)
  const normalizedRelative = normalize(relativePath)
  if (info.isSymbolicLink()) {
    const rawTarget = await readlink(sourcePath)
    const resolvedTarget = resolve(dirname(sourcePath), rawTarget)
    if (!inside(sourceRoot, resolvedTarget)) fail(`source link escapes runtime root: ${normalizedRelative} -> ${rawTarget}`)
    const mappedTarget = resolve(stagingRoot, relative(sourceRoot, resolvedTarget))
    const targetInfo = await stat(sourcePath)
    const type = targetInfo.isDirectory() ? 'junction' : 'file'
    if (type !== 'junction') fail(`file symlink is unsupported without an explicit permission fixture: ${normalizedRelative}`)
    pendingLinks.push({ sourcePath, destinationPath, path: normalizedRelative, rawTarget, resolvedTarget, mappedTarget, type })
    entryCount += 1
    return
  }
  if (info.isDirectory()) {
    await mkdir(destinationPath)
    const children = await readdir(sourcePath)
    for (const child of children) await stageEntry(join(sourcePath, child), join(destinationPath, child), relativePath ? `${relativePath}/${child}` : child)
    return
  }
  if (!info.isFile()) fail(`unsupported reparse or entry type: ${normalizedRelative}`)
  if (targetPaths.has(normalizedRelative)) {
    await copyFile(sourcePath, destinationPath)
    targetCopyCount += 1
  } else {
    try {
      await link(sourcePath, destinationPath)
      hardlinkCount += 1
    } catch (error) {
      if (error.code !== 'EPERM' || info.nlink <= 1) fail(`regular-file hardlink failed for ${normalizedRelative}: ${error.code ?? error.message}`)
      try { await copyFile(sourcePath, destinationPath) } catch (copyError) { fail(`read-only vendor copy fallback failed for ${normalizedRelative}: ${copyError.code ?? copyError.message}`) }
      copyFallbackCount += 1
      copyFallbacks.push({ path: normalizedRelative, reason: 'EPERM+nlink>1' })
    }
  }
  entryCount += 1
  if (entryCount % 10000 === 0) console.error(`[display-staging] staged ${entryCount} entries`)
}

async function structuralManifest(root, current = '') {
  const directory = join(root, current)
  const entries = (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))
  const result = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    const relativePath = normalize(current ? `${current}/${entry.name}` : entry.name)
    const info = await lstat(path)
    if (info.isSymbolicLink()) {
      const target = await readlink(path)
      result.push({ path: relativePath, type: 'symlink', target })
    } else if (info.isDirectory()) {
      result.push(...await structuralManifest(root, relativePath))
    } else if (info.isFile()) {
      const physical = await stat(path, { bigint: true })
      result.push({ path: relativePath, type: 'file', bytes: physical.size.toString(), dev: physical.dev.toString(), ino: physical.ino.toString(), nlink: physical.nlink.toString() })
    } else fail(`unknown reparse type in manifest: ${relativePath}`)
  }
  return result
}

const manifestDigest = value => hash(Buffer.from(JSON.stringify(value), 'utf8'))

async function verifyLocalFixture(fixtureRoot) {
  const source = join(fixtureRoot, 'source')
  const hardlink = join(fixtureRoot, 'hardlink')
  const junction = join(fixtureRoot, 'junction')
  await mkdir(source, { recursive: true })
  await writeFile(join(source, 'sentinel.txt'), 'fixture\n')
  try { await link(join(source, 'sentinel.txt'), hardlink) } catch (error) { fail(`same-volume hardlink fixture failed: ${error.code ?? error.message}`) }
  const sourceStat = await stat(join(source, 'sentinel.txt'), { bigint: true })
  const hardlinkStat = await stat(hardlink, { bigint: true })
  if (sourceStat.dev !== hardlinkStat.dev || sourceStat.ino !== hardlinkStat.ino) fail('hardlink fixture identity mismatch')
  try { await symlink(source, junction, 'junction') } catch (error) { fail(`directory Junction fixture failed without elevation: ${error.code ?? error.message}`) }
  const resolved = await realpath(junction)
  if (resolve(resolved) !== resolve(source)) fail('Junction fixture realpath mismatch')
  await rm(fixtureRoot, { recursive: true, force: true })
}

async function main() {
  const sourceNormalized = normalize(sourceRoot)
  if (!inside(runsRoot, runRoot) || !inside(runRoot, stagingRoot)) fail('run or staging path escapes .runs')
  if (!inside(repositoryRoot, sourceRoot) || !sourceNormalized.endsWith('/build/workdsh-runtime')) fail('source runtime is outside the registered build runtime')
  if (resolve(sourceRoot) === resolve(stagingRoot)) fail('source and staging paths must differ')
  if (await exists(pointerPath)) fail(`stale staging pointer exists: ${pointerPath}`)
  if (await exists(runRoot)) {
    try { JSON.parse(await readFile(join(runRoot, 'pre-snapshot.json'), 'utf8')) } catch { fail(`run already exists without pre-snapshot: ${runRoot}`) }
    if (await exists(stagingRoot) && (await readdir(stagingRoot)).length > 0) fail(`staging directory is not empty: ${stagingRoot}`)
  } else await mkdir(runRoot, { recursive: true })
  await mkdir(dirname(stagingRoot), { recursive: true })
  if (await exists(stagingRoot)) await rm(stagingRoot, { recursive: true, force: true })

  const sourceVolume = await stat(sourceRoot, { bigint: true })
  const stagingParent = dirname(stagingRoot)
  const stagingVolume = await stat(stagingParent, { bigint: true })
  if (sourceVolume.dev !== stagingVolume.dev) fail(`source/staging are on different volumes: ${sourceVolume.dev}/${stagingVolume.dev}`)
  for (const patch of patches) await packageVersion(sourceRoot, patch.packageRelative, patch.packageName)
  const patchTargets = new Map()
  targetPaths = new Set()
  for (const patch of patches) {
    const logicalPath = join(sourceRoot, patch.relative)
    const physicalPath = resolve(await realpath(logicalPath))
    if (!inside(sourceRoot, physicalPath)) fail(`display target resolves outside source runtime: ${patch.packageName}`)
    const physicalRelative = normalize(relative(sourceRoot, physicalPath))
    patchTargets.set(patch.id, { logicalRelative: patch.relative, physicalRelative })
    targetPaths.add(physicalRelative)
  }
  const sourceTargets = {}
  for (const patch of patches) {
    const physicalRelative = patchTargets.get(patch.id).physicalRelative
    const target = await targetHash(sourceRoot, patch, physicalRelative)
    if (target.bytes !== patch.originalBytes || target.sha256 !== patch.originalSha256 || target.text.split(patch.before).length !== 2) fail(`source target drift: ${patch.packageName}`)
    sourceTargets[patch.id] = { bytes: target.bytes, sha256: target.sha256 }
  }

  await verifyLocalFixture(join(runRoot, 'fixture'))
  console.error(`[display-staging] creating hardlink staging: ${stagingRoot}`)
  await stageEntry(sourceRoot, stagingRoot, '')
  for (const item of pendingLinks) {
    if (!inside(stagingRoot, item.mappedTarget) || inside(sourceRoot, item.mappedTarget)) fail(`mapped link target is unsafe: ${item.path}`)
    if (!await exists(item.mappedTarget)) fail(`mapped link target does not exist in staging: ${item.path}`)
    try { await symlink(item.mappedTarget, item.destinationPath, item.type) } catch (error) { fail(`cannot create mapped ${item.type} for ${item.path}: ${error.code ?? error.message}`) }
    const mappedInfo = await stat(item.destinationPath)
    if (item.type === 'junction' && !mappedInfo.isDirectory()) fail(`mapped Junction is not a directory: ${item.path}`)
    junctionMappings.push({ path: item.path, sourceTarget: item.rawTarget, sourceResolved: item.resolvedTarget, stagingTarget: item.mappedTarget, type: item.type })
    symlinkCount += 1
  }
  const sourceManifest = await structuralManifest(sourceRoot)
  let stagingManifest = await structuralManifest(stagingRoot)
  if (entryCount !== sourceManifest.length || sourceManifest.length !== stagingManifest.length) fail(`entry count mismatch: staged=${entryCount}, source=${sourceManifest.length}, staging=${stagingManifest.length}`)
  await writeFile(join(runRoot, 'source-structure-manifest.json'), JSON.stringify(sourceManifest, null, 2) + '\n', { flag: 'wx' })
  const sourceByPath = new Map(sourceManifest.map(item => [item.path, item]))
  const stagingByPath = new Map(stagingManifest.map(item => [item.path, item]))
  const copyFallbackPaths = new Set(copyFallbacks.map(item => item.path))
  if (sourceByPath.size !== stagingByPath.size) fail('source/staging entry count differs')
  for (const [path, source] of sourceByPath) {
    const staged = stagingByPath.get(path)
    if (!staged || staged.type !== source.type || staged.bytes !== source.bytes) fail(`structure mismatch: ${path}`)
    if (source.type === 'symlink') {
      const sourceResolved = resolve(dirname(sourceRoot + '/' + path), source.target)
      const stagingResolved = resolve(dirname(stagingRoot + '/' + path), staged.target)
      if (!inside(sourceRoot, sourceResolved) || !inside(stagingRoot, stagingResolved) || normalize(relative(sourceRoot, sourceResolved)) !== normalize(relative(stagingRoot, stagingResolved))) fail(`link mapping mismatch: ${path}`)
    } else if (!targetPaths.has(path) && !copyFallbackPaths.has(path) && (source.dev !== staged.dev || source.ino !== staged.ino)) fail(`non-target hardlink identity mismatch: ${path}`)
    else if (copyFallbackPaths.has(path) && source.dev === staged.dev && source.ino === staged.ino) fail(`copy fallback still shares source inode: ${path}`)
    else if (targetPaths.has(path) && (source.dev === staged.dev && source.ino === staged.ino)) fail(`target file still shares source inode: ${path}`)
  }

  const changed = []
  for (const patch of patches) {
    const physicalRelative = patchTargets.get(patch.id).physicalRelative
    const path = join(stagingRoot, physicalRelative)
    const source = await readFile(path, 'utf8')
    if (source.split(patch.before).length !== 2 || source.includes(patch.after)) fail(`staging anchor precondition failed: ${patch.packageName}`)
    const patched = source.replace(patch.before, patch.after)
    await writeFile(path, patched)
    const target = await targetHash(stagingRoot, patch, physicalRelative)
    if (target.bytes !== patch.patchedBytes || target.sha256 !== patch.patchedSha256 || target.text.includes(patch.before) || target.text.split(patch.after).length !== 2) fail(`patched target mismatch: ${patch.packageName}`)
    changed.push({ id: patch.id, logicalRelative: patch.relative, physicalRelative, package: patch.packageName, before: sourceTargets[patch.id], after: { bytes: target.bytes, sha256: target.sha256 }, replacement: { before: patch.before, after: patch.after } })
  }
  if (targetCopyCount !== patches.length) fail(`expected ${patches.length} independent target copies, created ${targetCopyCount}`)
  stagingManifest = await structuralManifest(stagingRoot)
  await writeFile(join(runRoot, 'staging-structure-manifest.json'), JSON.stringify(stagingManifest, null, 2) + '\n', { flag: 'wx' })
  const finalStagingByPath = new Map(stagingManifest.map(item => [item.path, item]))
  for (const patch of patches) {
    const physicalRelative = patchTargets.get(patch.id).physicalRelative
    const sourceEntry = sourceByPath.get(physicalRelative)
    const stagedEntry = finalStagingByPath.get(physicalRelative)
    if (!sourceEntry || !stagedEntry || sourceEntry.type !== 'file' || stagedEntry.type !== 'file' || (sourceEntry.dev === stagedEntry.dev && sourceEntry.ino === stagedEntry.ino)) fail(`final target inode is not independent: ${patch.packageName}`)
  }
  for (const patch of patches) {
    const physicalRelative = patchTargets.get(patch.id).physicalRelative
    const afterSource = await targetHash(sourceRoot, patch, physicalRelative)
    if (afterSource.sha256 !== patch.originalSha256 || afterSource.bytes !== patch.originalBytes) fail(`source changed during staging: ${patch.packageName}`)
  }
  const receipt = {
    schemaVersion: 2,
    runId,
    dshVersion,
    sourceRoot,
    stagingRoot,
    volumes: { source: sourceVolume.dev.toString(), staging: stagingVolume.dev.toString() },
    hardlinkCount,
    copyFallbackCount,
    copyFallbacks,
    targetCopyCount,
    symlinkCount,
    junctionMappings,
    sourceManifest: { entries: sourceManifest.length, sha256: manifestDigest(sourceManifest), path: 'source-structure-manifest.json' },
    stagingManifest: { entries: stagingManifest.length, sha256: manifestDigest(stagingManifest), path: 'staging-structure-manifest.json' },
    changedFiles: changed,
    rollback: { action: 'delete this run staging directory, manifests and pointer; source runtime is unchanged', sourceTargets },
  }
  const receiptPath = join(runRoot, 'display-patch-receipt.json')
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' })
  await writeFile(pointerPath, JSON.stringify({ schemaVersion: 2, runId, dshVersion, stagingRoot, receiptPath }, null, 2) + '\n', { flag: 'wx' })
  console.log(JSON.stringify({ runId, sourceRoot, stagingRoot, pointerPath, receiptPath, hardlinkCount, copyFallbackCount, targetCopyCount, symlinkCount, changedFiles: changed, sourceManifest: receipt.sourceManifest, stagingManifest: receipt.stagingManifest }, null, 2))
}

await main()
