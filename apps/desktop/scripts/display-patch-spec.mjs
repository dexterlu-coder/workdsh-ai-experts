export const DISPLAY_DSH_VERSION = '0.2.1-rc.5'

export const DISPLAY_PATCHES = Object.freeze([
  Object.freeze({
    id: 'layout-product-title',
    packageName: '@deepseek-ai/dsh-client-ui-layout',
    relative: 'profiles/workdsh/node_modules/@deepseek-ai/dsh-client-ui-layout/lib/client.js',
    packageRelative: 'profiles/workdsh/node_modules/@deepseek-ai/dsh-client-ui-layout/package.json',
    originalSha256: '686FB83C91C8FF8D03C365BB666EF34DACC3DD110EB768DEACBC7998B885C8C1',
    originalBytes: 32825,
    patchedSha256: '5B08B2924B7514DAE944EA48730F67AB3479489BD0DFD3B7DD82AB0DF8CF9383',
    patchedBytes: 32829,
    before: 'const productTitle = "DeepSeek Harness";',
    after: 'const productTitle = "AI专家办事大厅";',
  }),
  Object.freeze({
    id: 'conversation-hero-headline',
    packageName: '@deepseek-ai/dsh-client-ui-conversation',
    relative: 'profiles/workdsh/node_modules/@deepseek-ai/dsh-client-ui-conversation/lib/client.js',
    packageRelative: 'profiles/workdsh/node_modules/@deepseek-ai/dsh-client-ui-conversation/package.json',
    originalSha256: 'F7C22CFD56B2FFFB29FF9BC1B2D20B1B798FDF9D1C58FC39B3316BB01808DFC5',
    originalBytes: 783097,
    patchedSha256: 'E0C7DCF2C8B65F8FC07E820BB4DD5FBDEFF4591D097C6620EF2B26614AE0B727',
    patchedBytes: 783099,
    before: '"hero.headline": "探索未至之境"',
    after: '"hero.headline": "AI专家办事大厅"',
  }),
])
