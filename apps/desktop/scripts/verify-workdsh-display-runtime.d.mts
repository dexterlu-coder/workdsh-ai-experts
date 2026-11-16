export function verifyWorkdshDisplayRuntime(runtimeRoot: string): {
  version: string
  links: number
  files: readonly {
    package: string
    relative: string
    sha256: string
    bytes: number
  }[]
}
