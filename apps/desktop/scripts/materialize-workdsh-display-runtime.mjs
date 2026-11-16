#!/usr/bin/env node

/** Expand verified Windows Junctions into a self-contained regular-file runtime for packaging. */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { copyFile, link, lstat, mkdir, readdir, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyDisplayStagingReceipt } from './verify-display-staging-receipt.mjs'
import { DISPLAY_DSH_VERSION, DISPLAY_PATCHES } from './display-patch-spec.mjs'

const desktopRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = resolve(desktopRoot, '..', '..')
const pointerPath = join(desktopRoot, 'build', 'workdsh-display-staging.json')
const runsRoot = resolve(join(repositoryRoot, '.runs'))
const materializeRunId = process.env.WORKDSH_DISPLAY_MATERIALIZE_RUN_ID ?? `r74-display-materialize-${new Date().toISOString().replaceAll(/[-:.TZ]/gu, '').slice(0, 14)}-${process.pid}`
const runRoot = resolve(process.env.WORKDSH_DISPLAY_MATERIALIZE_RUN_DIR ?? join(runsRoot, materializeRunId))
const outputRoot = resolve(join(runRoot, 'materialized', 'workdsh-runtime'))
const pointerOutput = join(desktopRoot, 'build', 'workdsh-display-materialized.json')
const normalize = value => value.replaceAll('\\', '/')
const inside = (root, candidate) => {
  const a = normalize(resolve(root)).toLowerCase()
  const b = normalize(resolve(candidate)).toLowerCase()
  return b === a || b.startsWith(a + '/')
}
const hash = bytes => createHash('sha256').update(bytes).digest('hex').toUpperCase()
const fail = message => { throw new Error(`Display materialization refused: ${message}`) }
const exists = async path => { try { await lstat(path); return true } catch { return false } }
async function safeCreateDirectory(path, boundary) {
  const missing = []
  let cursor = resolve(path)
  while (!(await exists(cursor))) {
    missing.push(cursor)
    const parent = dirname(cursor)
    if (parent === cursor) fail(`cannot find existing ancestor for ${path}`)
    cursor = parent
  }
  const info = await lstat(cursor)
  if (info.isSymbolicLink() || !inside(boundary, await realpath(cursor))) fail(`directory ancestor escapes boundary: ${path}`)
  for (const directory of missing.reverse()) await mkdir(directory)
}

let hardlinkCount = 0
let copyFallbackCount = 0
const copyFallbacks = []
let targetCopyCount = 0
const targetOutputPaths = []
const outputOrigins = []
let junctionExpansionCount = 0
const targetPaths = new Set()

async function materializeEntry(sourcePath, destinationPath, relativePath, activeRealpaths) {
  const info = await lstat(sourcePath)
  const normalizedRelative = normalize(relativePath)
  if (info.isSymbolicLink()) {
    const targetRealpath = resolve(await realpath(sourcePath))
    if (!inside(sourceRoot, targetRealpath)) fail(`Junction target escapes staging: ${normalizedRelative}`)
    if (activeRealpaths.has(targetRealpath.toLowerCase())) fail(`Junction cycle: ${normalizedRelative}`)
    const targetInfo = await stat(sourcePath)
    if (!targetInfo.isDirectory()) fail(`file symlink is unsupported in materialized runtime: ${normalizedRelative}`)
    junctionExpansionCount += 1
    await materializeEntry(targetRealpath, destinationPath, relativePath, new Set([...activeRealpaths, targetRealpath.toLowerCase()]))
    return
  }
  if (info.isDirectory()) {
    await mkdir(destinationPath)
    for (const child of await readdir(sourcePath)) await materializeEntry(join(sourcePath, child), join(destinationPath, child), relativePath ? `${relativePath}/${child}` : child, activeRealpaths)
    return
  }
  if (!info.isFile()) fail(`unknown reparse type: ${normalizedRelative}`)
  const physicalRelative = normalize(relative(sourceRoot, resolve(await realpath(sourcePath))))
  const sourcePhysical = await stat(sourcePath, { bigint: true })
  if (targetPaths.has(physicalRelative)) {
    await copyFile(sourcePath, destinationPath)
    targetCopyCount += 1
    targetOutputPaths.push({ output: normalizedRelative, physicalRelative })
    const outputPhysical = await stat(destinationPath, { bigint: true })
    outputOrigins.push({ output: normalizedRelative, source: physicalRelative, mode: 'target', sourceDev: sourcePhysical.dev.toString(), sourceIno: sourcePhysical.ino.toString(), sourceNlink: sourcePhysical.nlink.toString(), outputDev: outputPhysical.dev.toString(), outputIno: outputPhysical.ino.toString(), outputNlink: outputPhysical.nlink.toString(), sourceBytes: sourcePhysical.size.toString(), bytes: sourcePhysical.size.toString() })
    return
  }
  let materializeMode = 'hardlink'
  try {
    await link(sourcePath, destinationPath)
    hardlinkCount += 1
  } catch (error) {
    if (error.code !== 'EPERM' || info.nlink <= 1) fail(`materialized hardlink failed for ${normalizedRelative}: ${error.code ?? error.message}`)
    await copyFile(sourcePath, destinationPath)
    copyFallbackCount += 1
    copyFallbacks.push({ path: normalizedRelative, reason: 'EPERM+nlink>1' })
      materializeMode = 'fallback'
  }
    const outputPhysical = await stat(destinationPath, { bigint: true })
    outputOrigins.push({ output: normalizedRelative, source: physicalRelative, mode: materializeMode, sourceDev: sourcePhysical.dev.toString(), sourceIno: sourcePhysical.ino.toString(), sourceNlink: sourcePhysical.nlink.toString(), outputDev: outputPhysical.dev.toString(), outputIno: outputPhysical.ino.toString(), outputNlink: outputPhysical.nlink.toString(), sourceBytes: sourcePhysical.size.toString(), bytes: sourcePhysical.size.toString() })
}

async function structuralManifest(root, current = '') {
  const result = []
  const stack = [{ directory: join(root, current), current }]
  while (stack.length > 0) {
    const item = stack.pop()
    for (const entry of (await readdir(item.directory, { withFileTypes: true })).sort((a, b) => b.name.localeCompare(a.name))) {
      const path = join(item.directory, entry.name)
      const relativePath = normalize(item.current ? `${item.current}/${entry.name}` : entry.name)
      const info = await lstat(path)
      if (info.isSymbolicLink()) fail(`materialized output contains reparse point: ${relativePath}`)
      if (info.isDirectory()) stack.push({ directory: path, current: relativePath })
      else if (info.isFile()) {
        const physical = await stat(path, { bigint: true })
        result.push({ path: relativePath, type: 'file', bytes: physical.size.toString(), dev: physical.dev.toString(), ino: physical.ino.toString(), nlink: physical.nlink.toString() })
      } else fail(`materialized output contains unknown entry: ${relativePath}`)
    }
  }
  return result.sort((a, b) => a.path.localeCompare(b.path))
}

const sourceRoot = (() => {
  try { return JSON.parse(readFileSync(pointerPath, 'utf8')).stagingRoot } catch { return '' }
})()

async function main() {
  if (!sourceRoot || !inside(runsRoot, runRoot) || !inside(runRoot, outputRoot)) fail('materialized run path or source pointer is invalid')
  if (await exists(pointerOutput)) fail(`stale materialized pointer exists: ${pointerOutput}`)
  const receiptData = verifyDisplayStagingReceipt(pointerPath, desktopRoot)
  if (resolve(receiptData.receipt.stagingRoot) !== resolve(sourceRoot)) fail('staging pointer changed during materialization setup')
  const stagingManifestPath = join(resolve(receiptData.pointer.receiptPath, '..'), receiptData.receipt.stagingManifest.path)
  const stagingManifest = JSON.parse(await readFile(stagingManifestPath, 'utf8'))
  const stagingByPath = new Map(stagingManifest.map(item => [item.path, item]))
  if (basename(runRoot) !== materializeRunId) fail('materialized run basename does not match runId')
  await safeCreateDirectory(dirname(runRoot), runsRoot)
  if (await exists(runRoot) && (await lstat(runRoot)).isSymbolicLink()) fail('materialized run root is a reparse point')
  if (await exists(runRoot)) {
    if (await exists(outputRoot) && (await readdir(outputRoot)).length > 0) fail(`materialized output is not empty: ${outputRoot}`)
  } else await mkdir(runRoot, { recursive: true })
  const outputParent = dirname(outputRoot)
  await safeCreateDirectory(outputParent, runRoot)
  if (await exists(outputRoot)) {
    if ((await lstat(outputRoot)).isSymbolicLink()) fail('materialized output root is a reparse point')
    await rm(outputRoot, { recursive: true, force: true })
  }

  for (const changed of receiptData.receipt.changedFiles) targetPaths.add(changed.physicalRelative)
  await materializeEntry(sourceRoot, outputRoot, '', new Set([resolve(sourceRoot).toLowerCase()]))
  if (!inside(runRoot, await realpath(outputRoot))) fail('materialized output realpath escapes run')
  const targetSources = new Set(targetOutputPaths.map(item => item.physicalRelative))
  if (DISPLAY_PATCHES.some(patch => !targetSources.has(receiptData.receipt.changedFiles.find(item => item.id === patch.id)?.physicalRelative))) fail('one or more display targets did not reach materialized output')
  for (const target of targetOutputPaths) {
    const changed = receiptData.receipt.changedFiles.find(item => item.physicalRelative === target.physicalRelative)
    const bytes = await readFile(join(outputRoot, target.output))
    if (!changed || bytes.length !== changed.after.bytes || hash(bytes) !== changed.after.sha256) fail(`materialized target occurrence hash mismatch: ${target.output}`)
    target.bytes = bytes.length
    target.sha256 = hash(bytes)
    target.id = changed.id
    const origin = outputOrigins.find(item => item.output === target.output)
    if (origin) { origin.id = changed.id; origin.outputBytes = target.bytes; origin.outputSha256 = target.sha256 }
  }
  for (const origin of outputOrigins) {
    const finalPhysical = await stat(join(outputRoot, origin.output), { bigint: true })
    const sourceEntry = stagingByPath.get(origin.source)
    if (!sourceEntry || sourceEntry.type !== 'file') fail(`materialized origin source is missing from staging manifest: ${origin.source}`)
    origin.sourceDev = sourceEntry.dev
    origin.sourceIno = sourceEntry.ino
    origin.sourceNlink = sourceEntry.nlink
    origin.sourceBytes = sourceEntry.bytes
    origin.outputDev = finalPhysical.dev.toString()
    origin.outputIno = finalPhysical.ino.toString()
    origin.outputNlink = finalPhysical.nlink.toString()
    origin.outputBytes = finalPhysical.size.toString()
  }
  const manifest = await structuralManifest(outputRoot)
  const manifestPath = join(runRoot, 'materialized-structure-manifest.json')
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' })
  const receipt = {
    schemaVersion: 1,
    runId: materializeRunId,
    dshVersion: DISPLAY_DSH_VERSION,
    inputStagingRunId: receiptData.receipt.runId,
    inputReceiptPath: receiptData.pointer.receiptPath,
    sourceRoot,
    outputRoot,
    hardlinkCount,
    copyFallbackCount,
    copyFallbacks,
    junctionExpansionCount,
    targetCopyCount,
    targetOutputPaths,
    outputOrigins,
    fileCount: manifest.length,
    manifest: { entries: manifest.length, sha256: hash(Buffer.from(JSON.stringify(manifest), 'utf8')), path: 'materialized-structure-manifest.json' },
    rollback: { action: 'delete this materialization run; staging and source are unchanged' },
  }
  const receiptPath = join(runRoot, 'materialized-receipt.json')
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' })
  const pointer = { schemaVersion: 1, runId: materializeRunId, dshVersion: DISPLAY_DSH_VERSION, inputStagingRunId: receiptData.receipt.runId, inputReceiptPath: receiptData.pointer.receiptPath, outputRoot, receiptPath }
  if (await exists(pointerOutput)) fail(`stale materialized pointer exists: ${pointerOutput}`)
  await writeFile(pointerOutput, JSON.stringify(pointer, null, 2) + '\n', { flag: 'wx' })
  console.log(JSON.stringify({ ...pointer, hardlinkCount, copyFallbackCount, junctionExpansionCount, targetCopyCount, manifest: receipt.manifest }, null, 2))
}

await main()
