import { EventEmitter } from 'node:events'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, vi } from 'vitest'
import { enterpriseSpace } from '../src/local-runtime.ts'

const state = vi.hoisted(() => ({ loadGate: undefined as Promise<void> | undefined, startupGate: undefined as Promise<void> | undefined, windows: [] as any[], menu: [] as any[], handlers: {} as Record<string, (...args: any[]) => Promise<any>>, logins: [] as string[], userData: '', revoked: true, stop: vi.fn(async () => {}), clean: vi.fn(async () => {}), logout: vi.fn(async () => false), verify: vi.fn(async () => {}), closed: vi.fn(async () => {}) }))
const actor = { id: 'a', organizationId: 'org-a', organizationName: 'Company', displayName: 'A', email: 'a@test', role: 'MEMBER' as const, mustChangePassword: false }
vi.mock('../src/enterprise-auth.ts', () => ({
  EnterpriseLogin: { login: async (origin: string) => { state.logins.push(origin); return { backendUrl: origin, actor, verify: state.verify, logout: state.logout, cancelRequests() {} } } },
  startEnterpriseAuthority: async () => ({ url: 'http://127.0.0.1:19898', key: 'a'.repeat(64), close: state.closed }),
}))
vi.mock('../src/enterprise-plugins.ts',()=>({installedEnterprisePlugins:vi.fn(()=>['workdsh-provider-identity-enterprise','workdsh-plugin-enterprise-collaboration']),composeInstalledEnterprisePlugins:vi.fn(async()=>['workdsh-provider-identity-enterprise','workdsh-plugin-enterprise-collaboration'])}))
vi.mock('../src/owned-process.ts', () => ({ trackOwnedProcess: vi.fn(), stopOwnedProcess: state.stop, cleanOwnedProcessTree: state.clean }))
vi.mock('node:child_process', () => ({ spawn: vi.fn() }))
vi.mock('electron', async () => {
  const { EventEmitter } = await import('node:events')
  class Window extends EventEmitter {
    destroyed = false; url = ''
    webContents = Object.assign(new EventEmitter(), {
      getURL: () => this.url, setWindowOpenHandler: vi.fn(),
      session: { closeAllConnections: vi.fn(async () => {}), clearStorageData: vi.fn(async () => {}), clearCache: vi.fn(async () => {}) },
    })
    constructor(readonly options: any) { super(); state.windows.push(this) }
    async loadURL(url: string) { this.url = url; if (url.startsWith('http://127.0.0.1:19999')) await state.loadGate; if (url.startsWith('data:') && decodeURIComponent(url).includes('正在启动个人工作区')) await state.startupGate }
    show = vi.fn(); setTitle() {} isDestroyed() { return this.destroyed }
    destroy() { this.destroyed = true; this.emit('closed') }
  }
  return {
    BrowserWindow: Window,
    ipcMain: { handle: (name: string, fn: any) => { state.handlers[name] = fn } },
    app: Object.assign(new EventEmitter(), { setActivationPolicy: vi.fn(), setName: vi.fn(), requestSingleInstanceLock: () => true, whenReady: async () => {}, quit: vi.fn(), relaunch: vi.fn(), getPath: () => state.userData, getAppPath: () => '/tmp/WorkDSH development/app' }),
    shell: { openExternal: vi.fn() }, dialog: { showErrorBox: vi.fn(), showOpenDialog: vi.fn(async () => ({ canceled: true, filePaths: [] })) },
    Menu: { buildFromTemplate: (menu: any[]) => { state.menu = menu; return menu }, setApplicationMenu: vi.fn() },
  }
})

it('enforces the packaged backend, uses explicitly installed enterprise identity, and clears locally despite remote logout failure', async () => {
  const root = mkdtempSync(join(tmpdir(), 'workdsh-lifecycle-')); state.userData = join(root, 'desktop')
  const resourcesDescriptor = Object.getOwnPropertyDescriptor(process, 'resourcesPath')
  Object.defineProperty(process, 'resourcesPath', { value: join(root, 'resources'), configurable: true })
  mkdirSync(join(root, 'resources')); mkdirSync(state.userData)
  writeFileSync(join(root, 'resources/workdsh-config.json'), JSON.stringify({ enterprise: { backendUrl: 'https://company.test' } }))
  const savedBackend = JSON.stringify({ backend: 'https://other.test' })
  writeFileSync(join(state.userData, 'enterprise-backend.json'), savedBackend)
  const source = join(root, 'bundle/profiles/workdsh'), home = join(root, 'personal')
  for (const path of ['@deepseek-ai/dsh/lib', '@deepseek-ai/dsh-app-boot/lib', 'pnpm/bin']) mkdirSync(join(source, 'node_modules', path), { recursive: true })
  writeFileSync(join(source, 'node_modules/@deepseek-ai/dsh/package.json'), JSON.stringify({ version: '0.2.0-rc.2' }))
  writeFileSync(join(source, 'node_modules/@deepseek-ai/dsh/lib/bin.js'), '')
  writeFileSync(join(source, 'node_modules/@deepseek-ai/dsh/lib/profile-boot.js'), '')
  writeFileSync(join(source, 'node_modules/@deepseek-ai/dsh-app-boot/lib/index.js'), '')
  writeFileSync(join(source, 'node_modules/pnpm/bin/pnpm.cjs'), '')
  writeFileSync(join(source, 'node_modules/pnpm/package.json'), JSON.stringify({ name: 'pnpm', version: '11.28.5' }))
  mkdirSync(join(root, 'dependencies/pnpm/bin'), { recursive: true })
  writeFileSync(join(root, 'dependencies/pnpm/bin/pnpm.cjs'), '')
  writeFileSync(join(root, 'dependencies/pnpm/package.json'), JSON.stringify({ name: 'pnpm', version: '11.28.5' }))
  writeFileSync(join(source, 'package.json'), JSON.stringify({ dependencies: {}, dsh: { profile: { bundles: ['@deepseek-ai/dsh-base'] } } }))
  writeFileSync(join(source, 'profile-installation.json'), readFileSync(join(source, 'package.json')))
  mkdirSync(home); writeFileSync(join(home, 'retained'), 'personal data')
  const enterprise = enterpriseSpace(state.userData, 'https://company.test', actor)
  const builtIn = join(source, 'node_modules/workdsh-provider-identity-enterprise')
  mkdirSync(builtIn, { recursive: true })
  writeFileSync(join(builtIn, 'package.json'), JSON.stringify({ exports: { './desktop': './dist/desktop.js' }, peerDependencies: { '@deepseek-ai/dsh': '0.2.0-rc.2' } }))
  const collaboration = join(source, 'node_modules/workdsh-plugin-enterprise-collaboration')
  mkdirSync(collaboration, {recursive:true})
  writeFileSync(join(collaboration, 'package.json'), JSON.stringify({exports:{'./desktop':'./dist/desktop.js'},peerDependencies:{'@deepseek-ai/dsh':'0.2.0-rc.2'}}))
  vi.stubEnv('WORKDSH_BUNDLED_PROFILE', source); vi.stubEnv('WORKDSH_DSH_HOME', home)
  vi.stubEnv('WORKDSH_NODE_EXECUTABLE', process.execPath); vi.stubEnv('WORKDSH_PRIMARY_RUNTIME', root)
  const { spawn } = await import('node:child_process')
  const children: any[] = []
  vi.mocked(spawn).mockImplementation(() => {
    const child = Object.assign(new EventEmitter(), { stdout: new EventEmitter(), stderr: new EventEmitter(), exitCode: null, signalCode: null, kill: vi.fn(() => { queueMicrotask(() => child.emit('exit', 0)); return true }) })
    children.push(child); return child as any
  })
  try {
    await import('../src/workdsh-main.ts')
    const { app: startupApp } = await import('electron')
    if (process.platform === 'darwin') expect(startupApp.setActivationPolicy).toHaveBeenCalledWith('regular')
    else expect(startupApp.setActivationPolicy).not.toHaveBeenCalled()
    await vi.waitFor(() => expect(state.windows).toHaveLength(1))
    const entry = state.windows[0]
    expect(decodeURIComponent(entry.url)).toContain('<p>https://company.test</p>')
    expect(decodeURIComponent(entry.url)).not.toContain('name="portal"')
    entry.webContents.emit('will-navigate', { preventDefault: vi.fn() }, 'workdsh://enterprise?portal=https%3A%2F%2Fevil.test')
    await vi.waitFor(() => expect(state.windows).toHaveLength(2))
    const loginPage = state.windows[1]
    expect(loginPage.url).toMatch(/^data:text\/html/)
    expect(vi.mocked(spawn)).not.toHaveBeenCalled()
    const signIn = state.handlers['workdsh:enterprise-login']!
    expect(await signIn({ sender: {} }, { account: 'a', password: 'secret' })).toEqual({ error: '此页面不能发起企业登录' })
    expect(await signIn({ sender: loginPage.webContents }, { account: 'a', password: 'secret' })).toEqual({})
    expect(state.logins).toEqual(['https://company.test'])
    expect(readFileSync(join(state.userData, 'enterprise-backend.json'), 'utf8')).toBe(savedBackend)
    expect(spawn).toHaveBeenCalledOnce()
    expect(state.handlers['workdsh:enterprise-install']).toBeUndefined()
    expect(existsSync(join(enterprise.home, 'profiles/workdsh/node_modules/workdsh-provider-identity-enterprise'))).toBe(false)
    const launch = vi.mocked(spawn).mock.calls[0]!
    expect(launch[2]?.env?.DSH_HOME).toBe(enterprise.home)
    expect(launch[2]?.env?.DSH_AGENTS_HOME).toBe(join(enterprise.root, 'agents'))
    expect(launch[1]?.join(' ')).not.toContain('secret')
    expect(launch[1]).toEqual([join(enterprise.home, '.workdsh-host.mjs'), '--no-open'])
    const { app } = await import('electron')
    app.emit('activate')
    expect(app.relaunch).not.toHaveBeenCalled()
    expect(app.quit).not.toHaveBeenCalled()
    expect(children[0].kill).not.toHaveBeenCalled()
    let finishLoad!: () => void
    state.loadGate = new Promise<void>(resolve => { finishLoad = resolve })
    const loadingPage = state.windows[1]
    children[0].stdout.emit('data', Buffer.from('dsh web: http://127.0.0.1:19999/?token=local-token'))
    const workspace = state.windows[2]
    expect(workspace.url).toContain('127.0.0.1:19999')
    expect(loadingPage.destroyed).toBe(false)
    expect(decodeURIComponent(loadingPage.url)).toContain('正在')
    finishLoad()
    await vi.waitFor(() => expect(loadingPage.destroyed).toBe(true))
    state.loadGate = undefined
    expect(workspace.options.webPreferences.partition).toMatch(/^workdsh-enterprise-/)
    expect(workspace.options.webPreferences.preload).toBeUndefined()
    expect(workspace.options.webPreferences.sandbox).toBe(true)
    expect(await signIn({ sender: workspace.webContents }, { account: 'b', password: 'secret' })).toHaveProperty('error')
    state.menu.find(item => item.label === '工作区').submenu[0].click()
    await vi.waitFor(() => expect(state.windows).toHaveLength(4))
    expect(state.stop).toHaveBeenCalledWith(children[0])
    expect(state.logout).toHaveBeenCalledOnce(); expect(state.closed).toHaveBeenCalledOnce()
    expect(workspace.webContents.session.clearStorageData).toHaveBeenCalledOnce()
    const { dialog } = await import('electron')
    expect(dialog.showErrorBox).toHaveBeenCalledWith('本机已退出', expect.stringContaining('远端撤销尚未确认'))
    expect(readFileSync(join(home, 'retained'), 'utf8')).toBe('personal data')
    const personalEntry = state.windows[3]
    personalEntry.webContents.emit('will-navigate', { preventDefault() {} }, 'workdsh://personal')
    await vi.waitFor(() => expect(spawn).toHaveBeenCalledTimes(2))
    expect(vi.mocked(spawn).mock.calls[1]?.[2]?.env?.DSH_HOME).toBe(home)
    app.emit('activate')
    expect(app.relaunch).not.toHaveBeenCalled()
    expect(app.quit).not.toHaveBeenCalled()
    let finishStop!: () => void
    state.stop.mockImplementationOnce(() => new Promise<void>(resolve => { finishStop = resolve }))
    state.menu.find(item => item.label === '工作区').submenu[0].click()
    await vi.waitFor(() => expect(state.stop).toHaveBeenCalledWith(children[1]))
    children[1].stdout.emit('data', Buffer.from('dsh web: http://127.0.0.1:19998/?token=personal-token'))
    expect(state.windows).toHaveLength(4)
    finishStop()
    await vi.waitFor(() => expect(state.windows).toHaveLength(5))
    expect(state.stop).toHaveBeenCalledWith(children[1])
    // A failed patch write happens after authority startup; it must leave no credential file/bridge.
    rmSync(join(enterprise.home, '.enterprise-desktop.patch.yml'))
    mkdirSync(join(enterprise.home, '.enterprise-desktop.patch.yml'))
    state.windows[4].webContents.emit('will-navigate', { preventDefault() {} }, 'workdsh://enterprise?portal=https%3A%2F%2Fcompany.test')
    await vi.waitFor(() => expect(state.windows).toHaveLength(6))
    expect(await signIn({ sender: state.windows[5].webContents }, { account: 'a', password: 'secret' })).toHaveProperty('error')
    expect(state.closed).toHaveBeenCalledTimes(2); expect(state.logout).toHaveBeenCalledTimes(2)
    expect(existsSync(join(enterprise.home, 'enterprise-auth.json'))).toBe(false)
    expect(spawn).toHaveBeenCalledTimes(2)
    expect(state.windows[6].url).toMatch(/^data:text\/html/)
    // A bad local device record fails before enterprise owns the login; revoke that newly admitted session too.
    writeFileSync(join(enterprise.root, 'device.json'), JSON.stringify({ deviceId: false }))
    state.windows[6].webContents.emit('will-navigate', { preventDefault() {} }, 'workdsh://enterprise?portal=https%3A%2F%2Fcompany.test')
    await vi.waitFor(() => expect(state.windows).toHaveLength(8))
    expect(await signIn({ sender: state.windows[7].webContents }, { account: 'a', password: 'secret' })).toHaveProperty('error')
    expect(state.logout).toHaveBeenCalledTimes(3); expect(state.closed).toHaveBeenCalledTimes(2)
    expect(spawn).toHaveBeenCalledTimes(2)
    // An incompatible installed plugin fails before authority startup, and revokes the new login.
    writeFileSync(join(enterprise.root, 'device.json'), JSON.stringify({ deviceId: enterprise.deviceId }))
    const {composeInstalledEnterprisePlugins}=await import('../src/enterprise-plugins.ts')
    vi.mocked(composeInstalledEnterprisePlugins).mockRejectedValueOnce(new Error('企业插件与当前 DSH 不兼容'))
    expect(await signIn({ sender: state.windows[7].webContents }, { account: 'a', password: 'secret' })).toEqual({ error: expect.stringContaining('不兼容') })
    expect(state.logout).toHaveBeenCalledTimes(4); expect(state.closed).toHaveBeenCalledTimes(2)
    expect(spawn).toHaveBeenCalledTimes(2)

    // A delayed workspace load and verification belong to the session that started them.
    rmSync(join(enterprise.home, '.enterprise-desktop.patch.yml'), { recursive: true })
    const intervalSpy = vi.spyOn(globalThis, 'setInterval')
    const restoredEntry = state.windows.at(-1)
    restoredEntry.webContents.emit('will-navigate', { preventDefault() {} }, 'workdsh://enterprise')
    await vi.waitFor(() => expect(state.windows.at(-1)).not.toBe(restoredEntry))
    expect(await signIn({ sender: state.windows.at(-1).webContents }, { account: 'a', password: 'secret' })).toEqual({})
    const oldTimer = intervalSpy.mock.calls.at(-1)![0] as () => void
    let rejectOldVerify!: (reason: Error) => void
    state.verify.mockImplementationOnce(() => new Promise<void>((_resolve, reject) => { rejectOldVerify = reject }))
    oldTimer()
    let rejectLoad!: (reason: Error) => void
    state.loadGate = new Promise<void>((_resolve, reject) => { rejectLoad = reject })
    children[2].stdout.emit('data', Buffer.from('dsh web: http://127.0.0.1:19999/?token=old'))
    state.menu.find(item => item.label === '工作区').submenu[0].click()
    await vi.waitFor(() => expect(state.windows.at(-1).url).toContain('data:'))
    await vi.waitFor(() => expect(state.stop).toHaveBeenCalledWith(children[2]))
    const newEntry = state.windows.at(-1)
    newEntry.webContents.emit('will-navigate', { preventDefault() {} }, 'workdsh://enterprise')
    await vi.waitFor(() => expect(state.windows.at(-1)).not.toBe(newEntry))
    const nextLogin = state.windows.at(-1)
    expect(await signIn({ sender: nextLogin.webContents }, { account: 'a', password: 'secret' })).toEqual({})
    const currentTimer = intervalSpy.mock.calls.at(-1)![0] as () => void
    const errorCount = vi.mocked(dialog.showErrorBox).mock.calls.length
    rejectLoad(new Error('old load failed'))
    rejectOldVerify(new Error('old verify failed'))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(vi.mocked(dialog.showErrorBox).mock.calls.length).toBe(errorCount)
    expect(state.stop).not.toHaveBeenCalledWith(children[3])
    state.loadGate = undefined
    state.verify.mockRejectedValueOnce(new Error('current verify failed'))
    currentTimer()
    await vi.waitFor(() => expect(dialog.showErrorBox).toHaveBeenCalledWith('企业认证不可用', expect.any(String)))
    await vi.waitFor(() => expect(state.stop).toHaveBeenCalledWith(children[3]))
    // Verification may reject while explicit stop is still awaiting its process.
    const pendingEntry = state.windows.at(-1)
    pendingEntry.webContents.emit('will-navigate', { preventDefault() {} }, 'workdsh://enterprise')
    await vi.waitFor(() => expect(state.windows.at(-1)).not.toBe(pendingEntry))
    const pendingLogin = state.windows.at(-1)
    expect(await signIn({ sender: pendingLogin.webContents }, { account: 'a', password: 'secret' })).toEqual({})
    const pendingTimer = intervalSpy.mock.calls.at(-1)![0] as () => void
    let rejectPendingVerify!: (reason: Error) => void
    state.verify.mockImplementationOnce(() => new Promise<void>((_resolve, reject) => { rejectPendingVerify = reject }))
    pendingTimer()
    let finishPendingStop!: () => void
    state.stop.mockImplementationOnce(() => new Promise<void>(resolve => { finishPendingStop = resolve }))
    const beforePendingVerify = vi.mocked(dialog.showErrorBox).mock.calls.length
    state.menu.find(item => item.label === '工作区').submenu[0].click()
    await vi.waitFor(() => expect(state.stop).toHaveBeenCalledWith(children[4]))
    rejectPendingVerify(new Error('verify cancelled during stop'))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(vi.mocked(dialog.showErrorBox).mock.calls.slice(beforePendingVerify).some(call => call[0] === '企业认证不可用')).toBe(false)
    finishPendingStop()
    await vi.waitFor(() => expect(state.windows.at(-1)).not.toBe(pendingLogin))
    await vi.waitFor(() => expect(state.logout).toHaveBeenCalledTimes(7))
    intervalSpy.mockRestore()

    // A successful late load cannot replace the new entry surface.
    const entryAfterVerify = state.windows.at(-1)
    entryAfterVerify.webContents.emit('will-navigate', { preventDefault() {} }, 'workdsh://personal')
    await vi.waitFor(() => expect(spawn).toHaveBeenCalledTimes(6))
    let finishOldLoad!: () => void
    state.loadGate = new Promise<void>(resolve => { finishOldLoad = resolve })
    children[5].stdout.emit('data', Buffer.from('dsh web: http://127.0.0.1:19999/?token=old-success'))
    const stalePage = state.windows.at(-1)
    stalePage.destroy = vi.fn() // Model a still-live superseded window.
    state.menu.find(item => item.label === '工作区').submenu[0].click()
    await vi.waitFor(() => expect(state.windows.at(-1)).not.toBe(stalePage))
    const entryAfterLateLoad = state.windows.at(-1)
    finishOldLoad()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(entryAfterLateLoad.destroyed).toBe(false)
    expect(stalePage.show).not.toHaveBeenCalled()
    state.loadGate = undefined

    // Child error followed by exit reports the originating failure once.
    entryAfterLateLoad.webContents.emit('will-navigate', { preventDefault() {} }, 'workdsh://personal')
    await vi.waitFor(() => expect(spawn).toHaveBeenCalledTimes(7))
    // Explicit stop owns cleanup failure reporting, even if exit cleanup fails too.
    let rejectStop!: (reason: Error) => void
    state.stop.mockImplementationOnce(() => new Promise<void>((_resolve, reject) => { rejectStop = reject }))
    state.clean.mockRejectedValueOnce(new Error('cleanup failed'))
    const beforeCleanup = vi.mocked(dialog.showErrorBox).mock.calls.length
    state.menu.find(item => item.label === '工作区').submenu[0].click()
    await vi.waitFor(() => expect(state.stop).toHaveBeenCalledWith(children[6]))
    children[6].emit('exit', 1)
    rejectStop(new Error('cleanup failed'))
    await vi.waitFor(() => expect(dialog.showErrorBox).toHaveBeenCalledWith('暂时无法切换', 'cleanup failed'))
    expect(vi.mocked(dialog.showErrorBox).mock.calls.slice(beforeCleanup).filter(call => call[0] === '暂时无法切换' || call[0] === '本机运行失败，进程清理未确认')).toHaveLength(1)
    state.menu.find(item => item.label === '工作区').submenu[0].click()
    await vi.waitFor(() => expect(state.windows.at(-1)).not.toBe(entryAfterLateLoad))
    const recoveredEntry = state.windows.at(-1)
    recoveredEntry.webContents.emit('will-navigate', { preventDefault() {} }, 'workdsh://personal')
    await vi.waitFor(() => expect(spawn).toHaveBeenCalledTimes(8))
    const beforeError = vi.mocked(dialog.showErrorBox).mock.calls.length
    children[7].emit('error', new Error('host failed'))
    children[7].emit('exit', 1)
    await vi.waitFor(() => expect(state.stop).toHaveBeenCalledWith(children[7]))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(vi.mocked(dialog.showErrorBox).mock.calls.slice(beforeError).filter(call => call[0] === '启动失败' || call[0] === '本机运行已停止')).toHaveLength(1)

    // Cancellation during an awaited startup operation must not be shown as entry failure.
    await vi.waitFor(() => expect(state.windows.at(-1)).not.toBe(recoveredEntry))
    // The current page may finish loading while quit waits on a child.
    for (const loadFails of [false, true]) {
      const quitEntry = state.windows.at(-1)
      const spawnCount = vi.mocked(spawn).mock.calls.length
      quitEntry.webContents.emit('will-navigate', { preventDefault() {} }, 'workdsh://personal')
      await vi.waitFor(() => expect(spawn).toHaveBeenCalledTimes(spawnCount + 1))
      let finishQuitLoad!: () => void
      let rejectQuitLoad!: (reason: Error) => void
      state.loadGate = new Promise<void>((resolve, reject) => { finishQuitLoad = resolve; rejectQuitLoad = reject })
      const quitChild = children.at(-1)
      quitChild.stdout.emit('data', Buffer.from('dsh web: http://127.0.0.1:19999/?token=quit'))
      const quitPage = state.windows.at(-1)
      let failQuitStop!: (reason: Error) => void
      state.stop.mockImplementationOnce(() => new Promise<void>((_resolve, reject) => { failQuitStop = reject }))
      const beforeQuitLoad = vi.mocked(dialog.showErrorBox).mock.calls.length
      app.emit('before-quit', { preventDefault() {} })
      await vi.waitFor(() => expect(state.stop).toHaveBeenCalledWith(quitChild))
      if (loadFails) rejectQuitLoad(new Error('load cancelled'))
      else finishQuitLoad()
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(quitPage.show).not.toHaveBeenCalled()
      expect(vi.mocked(dialog.showErrorBox).mock.calls.slice(beforeQuitLoad).some(call => call[0] === '无法打开工作区')).toBe(false)
      failQuitStop(new Error('stop failed'))
      await vi.waitFor(() => expect(vi.mocked(dialog.showErrorBox).mock.calls.slice(beforeQuitLoad).some(call => call[0] === '暂时无法退出' && call[1] === 'stop failed')).toBe(true))
      await new Promise(resolve => setTimeout(resolve, 0))
      state.loadGate = undefined
      state.menu.find(item => item.label === '工作区').submenu[0].click()
      await vi.waitFor(() => expect(state.windows.at(-1)).not.toBe(quitPage))
    }
    const cancelEntry = state.windows.at(-1)
    let rejectStartup!: (reason: Error) => void
    state.startupGate = new Promise<void>((_resolve, reject) => { rejectStartup = reject })
    cancelEntry.webContents.emit('will-navigate', { preventDefault() {} }, 'workdsh://personal')
    const beforeCancel = vi.mocked(dialog.showErrorBox).mock.calls.length
    app.emit('before-quit', { preventDefault() {} })
    rejectStartup(new Error('启动已取消'))
    await vi.waitFor(() => expect(app.quit).toHaveBeenCalled())
    expect(vi.mocked(dialog.showErrorBox).mock.calls.slice(beforeCancel).some(call => call[0] === '无法进入')).toBe(false)
  } finally {
    if (resourcesDescriptor) Object.defineProperty(process, 'resourcesPath', resourcesDescriptor)
    else Reflect.deleteProperty(process, 'resourcesPath')
    vi.unstubAllEnvs(); rmSync(root, { recursive: true, force: true })
  }
})
