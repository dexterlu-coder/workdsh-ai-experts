import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isWindowsHardlinkLimit } from './materialize-workdsh-display-runtime.mjs'
import { verifyHardlinkLimitFallback } from './verify-display-materialized-receipt.mjs'

test('hardlink limit eligibility is narrowly scoped', () => {
  const before = { dev: 1n, ino: 2n }
  const after = { ...before, nlink: 1024n, isFile: () => true }
  for (const code of ['UNKNOWN', 'EMLINK']) assert.equal(isWindowsHardlinkLimit('win32', code, before, after), true)
  for (const [platform, code, value] of [['linux', 'UNKNOWN', after], ['win32', 'EPERM', after], ['win32', 'UNKNOWN', { ...after, nlink: 1023n }], ['win32', 'UNKNOWN', { ...after, ino: 3n }], ['win32', 'UNKNOWN', { ...after, isFile: () => false }]]) assert.equal(isWindowsHardlinkLimit(platform, code, before, value), false)
})

test('hardlink limit evidence requires independent identical content', t => {
  const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
  const root = resolve(process.env.WORKDSH_TEST_RUN_ROOT ?? join(dirname(repositoryRoot), `${basename(repositoryRoot)}-runs`))
  mkdirSync(root, { recursive: true })
  const dir = mkdtempSync(join(root, 'materialize-hardlink-limit-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const a = join(dir, 'a'); const b = join(dir, 'b')
  writeFileSync(a, 'abc'); writeFileSync(b, 'abc')
  const fallback = { platform: 'win32', errorCode: 'UNKNOWN', sourceNlinkAtFailure: '1024', sourceDev: '1', sourceIno: '2', bytes: '3', sha256: createHash('sha256').update('abc').digest('hex').toUpperCase() }
  const origin = { sourceDev: '1', sourceIno: '2', outputDev: '1', outputIno: '3' }
  const source = { bytes: '3' }
  verifyHardlinkLimitFallback(fallback, origin, source, a, b)
  assert.throws(() => verifyHardlinkLimitFallback(fallback, { ...origin, outputIno: '2' }, source, a, b))
  assert.throws(() => verifyHardlinkLimitFallback({ ...fallback, sourceIno: '4' }, origin, source, a, b))
  writeFileSync(b, 'xyz')
  assert.throws(() => verifyHardlinkLimitFallback(fallback, origin, source, a, b))
})
