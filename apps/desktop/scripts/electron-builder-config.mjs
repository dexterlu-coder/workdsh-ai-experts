/** Electron Builder configuration with a verified, run-scoped display runtime. */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyDisplayStagingReceipt } from './verify-display-staging-receipt.mjs'
import { verifyDisplayMaterializedReceipt } from './verify-display-materialized-receipt.mjs'

const desktopRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(readFileSync(resolve(desktopRoot, 'package.json'), 'utf8'))
const pointerPath = resolve(desktopRoot, 'build', 'workdsh-display-staging.json')
verifyDisplayStagingReceipt(pointerPath, desktopRoot)
const materialized = verifyDisplayMaterializedReceipt(resolve(desktopRoot, 'build', 'workdsh-display-materialized.json'), desktopRoot)

const build = structuredClone(packageJson.build)
const resources = Array.isArray(build.extraResources) ? build.extraResources : []
const runtimeResource = resources.find(item => item?.to === 'workdsh-runtime')
if (!runtimeResource || runtimeResource.from !== 'build/workdsh-runtime') {
  throw new Error('Unexpected WorkDSH runtime resource declaration')
}
build.extraResources = resources.map(item => item === runtimeResource ? { ...item, from: materialized.pointer.outputRoot } : item)
export default build
