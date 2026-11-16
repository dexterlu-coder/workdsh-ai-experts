/** Generate canonical Academy assets from the checked-in Heroicons SVG. */

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const desktopRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const sourceRoot = resolve(desktopRoot, '../../packages/ui/assets')
const outputRoot = join(desktopRoot, 'build')
const sourcePath = join(sourceRoot, 'academy-hall.svg')
const trayPath = join(sourceRoot, 'mark-blue.svg')
const expectedSourceSha256 = 'ba45aa06e36b357f0a92ca74498ff93267b12ed7b454b704ee649a0dd0f0c0df'
const sourceBlue = '#2458A6'
const nativeTrayBlue = '#176BFF'

const svg = await readFile(sourcePath)
const sourceSha256 = createHash('sha256').update(svg).digest('hex')
if (sourceSha256 !== expectedSourceSha256) throw new Error(`Academy SVG hash drift: ${sourceSha256}`)
await mkdir(outputRoot, { recursive: true })

await sharp(svg)
  .resize(1024, 1024)
  .ensureAlpha()
  .toColourspace('rgb16')
  .withIccProfile('srgb')
  .png({ compressionLevel: 9, progressive: false, adaptiveFiltering: false, palette: false })
  .toFile(join(outputRoot, 'app-icon.png'))

const traySource = (await readFile(trayPath, 'utf8')).replaceAll(sourceBlue, nativeTrayBlue)
if (!traySource.includes(`fill="${nativeTrayBlue}"`) && !traySource.includes(`stroke="${nativeTrayBlue}"`)) throw new Error('Academy tray asset did not produce the fixed native brand color')
await writeFile(join(outputRoot, 'tray-icon.svg'), traySource)
console.log(JSON.stringify({ sourceSha256, output: 'apps/desktop/build/app-icon.png', tray: 'apps/desktop/build/tray-icon.svg', nativeTrayBlue }))
