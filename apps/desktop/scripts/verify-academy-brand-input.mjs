/** Fail-closed checks for the pinned official display inputs and WorkDSH CSS seam. */

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const root = resolve(new URL('../..', import.meta.url).pathname)
const profileRoot = process.env.WORKDSH_BRANDING_PROFILE_ROOT ?? join(root, 'build', 'workdsh-runtime', 'profiles', 'workdsh')
const conversationPath = join(profileRoot, 'node_modules/@deepseek-ai/dsh-client-ui-conversation/lib/client.js')
const layoutPath = join(profileRoot, 'node_modules/@deepseek-ai/dsh-client-ui-layout/lib/client.js')
const expectedConversationSha256 = 'F7C22CFD56B2FFFB29FF9BC1B2D20B1B798FDF9D1C58FC39B3316BB01808DFC5'
const expectedLayoutSha256 = '686FB83C91C8FF8D03C365BB666EF34DACC3DD110EB768DEACBC7998B885C8C1'

const hash = bytes => createHash('sha256').update(bytes).digest('hex').toUpperCase()
const conversation = await readFile(conversationPath, 'utf8')
const layout = await readFile(layoutPath, 'utf8')
if (hash(Buffer.from(conversation)) !== expectedConversationSha256) throw new Error('Conversation rc.5 input hash drift')
if (hash(Buffer.from(layout)) !== expectedLayoutSha256) throw new Error('Layout rc.5 input hash drift')
for (const [label, value] of [['hero root', 'pXSMma_root'], ['preview badge', 'pXSMma_previewBadge'], ['hero slot', 'conversation.hero.brand.mark'], ['hero headline', '"hero.headline": "探索未至之境"']]) {
  if (conversation.split(value).length !== 2) throw new Error(`Unexpected ${label} anchor count`)
}
if (layout.split('const productTitle = "DeepSeek Harness";').length !== 2) throw new Error('Unexpected layout productTitle anchor count')
console.log(JSON.stringify({ conversationSha256: hash(Buffer.from(conversation)), layoutSha256: hash(Buffer.from(layout)), selector: '[class~="pXSMma_root"] [class~="pXSMma_previewBadge"]' }))
