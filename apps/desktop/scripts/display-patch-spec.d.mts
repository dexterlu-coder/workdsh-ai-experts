export const DISPLAY_DSH_VERSION: string
export const DISPLAY_PATCHES: readonly {
  id: string
  packageName: string
  relative: string
  packageRelative: string
  originalSha256: string
  originalBytes: number
  patchedSha256: string
  patchedBytes: number
  before: string
  after: string
}[]
