import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readdirSync, readFileSync, readlinkSync, realpathSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { DISPLAY_DSH_VERSION, DISPLAY_PATCHES } from './display-patch-spec.mjs'

const hash = bytes => createHash('sha256').update(bytes).digest('hex').toUpperCase()

function inside(root, candidate) {
  const a = resolve(root).replaceAll('\\', '/').toLowerCase()
  const b = resolve(candidate).replaceAll('\\', '/').toLowerCase()
  return b === a || b.startsWith(a + '\\') || b.startsWith(a + '/')
}

function verifyReparseTargets(runtimeRoot) {
  const sourceRoot = resolve(runtimeRoot)
  const stack = [sourceRoot]
  let links = 0
  while (stack.length > 0) {
    const directory = stack.pop()
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      const info = lstatSync(path)
      if (info.isSymbolicLink()) {
        links += 1
        const target = readlinkSync(path)
        const resolvedTarget = resolve(dirname(path), target)
        if (!inside(sourceRoot, resolvedTarget)) throw new Error(`Packaged runtime link escapes resources: ${path} -> ${target}`)
        realpathSync(path)
      } else if (info.isDirectory()) stack.push(path)
    }
  }
  for (const relative of [
    'profiles/workdsh/node_modules/@deepseek-ai/dsh',
    'profiles/workdsh/node_modules/@deepseek-ai/dsh-client-ui-layout',
    'profiles/workdsh/node_modules/@deepseek-ai/dsh-client-ui-conversation',
    'profiles/workdsh/node_modules/.pnpm',
  ]) if (!inside(sourceRoot, realpathSync(join(sourceRoot, relative)))) throw new Error(`Packaged runtime realpath escaped resources: ${relative}`)
  return links
}

export function verifyWorkdshDisplayRuntime(runtimeRoot) {
  for (const patch of DISPLAY_PATCHES) {
    const packagePath = join(runtimeRoot, patch.packageRelative)
    const filePath = join(runtimeRoot, patch.relative)
    if (!existsSync(packagePath) || !existsSync(filePath)) throw new Error(`Display patch target is missing: ${patch.packageName}`)
    const manifest = JSON.parse(readFileSync(packagePath, 'utf8'))
    if (manifest.name !== patch.packageName || manifest.version !== DISPLAY_DSH_VERSION) throw new Error(`Display patch package mismatch: ${patch.packageName}`)
    const bytes = readFileSync(filePath)
    if (bytes.length !== patch.patchedBytes || hash(bytes) !== patch.patchedSha256) throw new Error(`Display patch hash mismatch: ${patch.packageName}`)
    const source = bytes.toString('utf8')
    if (!source.includes(patch.after) || source.includes(patch.before)) throw new Error(`Display patch target text mismatch: ${patch.packageName}`)
  }
  const links = verifyReparseTargets(runtimeRoot)
  return { version: DISPLAY_DSH_VERSION, links, files: DISPLAY_PATCHES.map(patch => ({ package: patch.packageName, relative: patch.relative, sha256: patch.patchedSha256, bytes: patch.patchedBytes })) }
}
