# 二次开发前原版的 Windows、macOS、Linux 差异处理基线

日期：2026-11-17；性质：本机来源校验、原版源码静态事实及明确标注的分析判断。runId：`r111-original-three-platform-audit-20261117-001`。状态：`research-complete / no-product-change`。

本报告回答：**我们开始二次开发前的那个 WorkDSH 版本，已经怎样处理三平台差异，哪些能力实际有代码链路，哪些只是配置或尚未完成的支持。** 本轮不修改产品源码，不构建、不启动或关闭应用，也不执行平台适配。与当前分支的初步差异另见[比较报告](2026-11-17-original-baseline-platform-comparison.md)。

## 1. 原版身份、调查方法和证据边界

### 1.1 固定基线

| 项目 | 本次确认值 |
| --- | --- |
| 原始材料 | `D:\project\codex\workdsh-main.zip` |
| 归档大小 | 53,268,823 字节 |
| 归档 SHA-256 | `4ab764957cffbc9c52dfc36cea0429af46033163e9087bd21a986a9c1bcbec37` |
| ZIP 注释中的提交 | `e94c99d5f9e143fb67fec84a74978eb8218daf32` |
| 对应仓库/提交时间 | `techflag/workdsh`；2026-10-31 20:55:58 +08:00 |
| 提交标题 | `docs: feature DSH Friends on repository home (#77)` |
| Desktop 产品版本 | `3.0.0-alpha.4` |
| Electron / electron-builder | `43.3.0` / `26.15.7` |
| DSH Host、Client、SDK 的锁定版本 | `0.2.1-rc.5` |
| 原始许可证 | MIT；Copyright (c) 2026 Anywhere Labs |

ZIP 身份由归档注释与邻近 `D:\project\codex\workdsh` 中现存的对应 Git 对象交叉核对；未把邻近仓库当前的、有未提交修改的工作树当成原版。当前项目自己的最早提交已经包含新增专家整合，也不能充当这个原版。

本轮选取 57 个与平台处理直接相关的文件，全部与该提交逐文件核对通过。内容比较只归一化换行；保存的快照及 SHA-256 对应 ZIP 中原始字节。稳定材料位于[参考快照](../references/original-platform-baseline-e94c99d5/README.md)，逐文件证据位于[源文件清单](../references/original-platform-baseline-e94c99d5/source-manifest.json)。这里只保存约 335 KB 的必要源码，不复制运行时。

### 1.2 本报告可以和不可以证明什么

- **本机核验事实：**归档哈希、所选文件与历史提交的一致性、具体源码分支、配置和测试内容。
- **原版源码事实：**下面引用的入口、平台条件、资源路径和校验逻辑确实存在于固定提交。
- **静态推导：**按这些入口和显式阻断条件，可以判断标准链路支持哪些目标；推导不等于实机运行结果。
- **本轮未执行：**原版 Windows/macOS/Linux 构建、安装、签名、公证、GUI 和模型调用；也没有查询历史 CI 执行记录。因此“有 CI 任务”不写成“历史 CI 一定成功”。

“原版”在这里指找到并核验的**二次开发前 WorkDSH 快照**，不是声称找到了项目历史最早提交，更不是直接审计 DeepSeek 官方 Electron 应用的完整源代码。该 WorkDSH 版本本身已经有 carrier、自有 Profile、构建工具补丁和明确的官方资源提取策略。

## 2. 三平台支持范围总表

| 维度 | Windows | macOS | Linux |
| --- | --- | --- | --- |
| 标准 Desktop 打包主机 | 原生 Windows，要求 x64 Node | 原生 macOS，主机 x64/arm64；目标可分别选 x64/arm64 | 根 release 入口明确拒绝 |
| 已锁定官方工具资源 | `win-x64` | `mac-arm64`、`mac-x64` | 没有 Linux 归档条目 |
| 主要制品 | unsigned x64 NSIS `.exe`；另有 portable `.zip` | unsigned DMG smoke；另有签名、公证 DMG release | carrier 中残留 `dir` 配置，但完整链路不成立 |
| Electron 资源目录 | `<app>/resources` | `<app>.app/Contents/Resources` | 通用辅助代码识别 `<app>/resources`，不足以形成产品支持 |
| Node / Python 名称 | `node.exe` / `python.exe` | `node` / `bin/python3` | 有通用 POSIX 命名分支，但没有相应 primary runtime 输入 |
| 平台命令 | `cmd.exe`、PowerShell、7-Zip | shell、ditto、hdiutil、lipo、codesign 等 | 无头源码检查和 Web 检查；没有 Desktop 制品任务 |
| CI 声明 | `windows-latest` 构建安装包 | `macos-latest`，目标架构矩阵 x64/arm64 | `ubuntu-latest` 做公共源码/Web/插件检查和发布协调 |
| 本轮实机结论 | 未运行原版验证 | 未运行原版验证 | 未运行原版验证；静态确认标准 Desktop 链路受阻 |

**核心结论：原版不是“三平台各维护一整套代码”，也不是“只有 macOS/Linux 路径”。它采用共享 carrier/Profile 加 Windows/macOS 专属入口和少量平台分支；Linux 的通用配置与无头检查，不构成完整 Linux Desktop 支持。**

证据：[根发布入口 18 行](../references/original-platform-baseline-e94c99d5/source/scripts/package-desktop-release.mjs#L18)、[官方资源目标白名单 10 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/official-runtime-provenance.mjs#L10)、[primary runtime 平台选择 12 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/prepare-workdsh-primary-runtime.mjs#L12)、[carrier 平台验收 74 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/verify-workdsh-carrier.ts#L74)。

## 3. 原版的共用架构与构建链路

### 3.1 代码如何分层

| 层 | 共用职责 | 差异落点 |
| --- | --- | --- |
| WorkDSH 产品功能 | 同一组自有包、Profile 组合、官方 npm DSH 版本 | 不按操作系统复制专家、技能、连接器等业务源码 |
| Desktop carrier | Electron 窗口、入口页、个人/企业空间、官方 Host 启停 | 可执行文件名、菜单/生命周期、进程清理等处判断平台 |
| 资源准备 | 检查归档版本/大小/SHA-512，提取 Node/pnpm/Python/Office/CLI | 根据目标选归档、解压器和二进制架构 |
| 打包 | 同一 `apps/desktop/package.json` 和共用 afterPack 校验 | `package-win.ts`、`package-mac.ts`、`release-mac.ts` 负责平台入口 |
| CI | 公共门禁、源码来源、默认分支/版本约束 | Windows runner 与 macOS 目标架构矩阵 |

### 3.2 开发启动和发布打包是不同入口

原版 `dev` 顺序为：

```text
Desktop build
  → prepare-workdsh-runtime（安装官方 npm DSH + WorkDSH Profile）
  → prepare-workdsh-primary-runtime（官方归档的工具资源）
  → prepare-workdsh-command（命令辅助工具及启动器）
  → start-workdsh（显式启动 Electron）
```

原版 `package:dir` 复用前三个准备阶段，最后执行 unsigned 目录打包。`dist:win`、`dist:mac-smoke`、`dist:mac` 等分别进入自己的平台打包脚本。根 `release:pack` 还负责同提交的 Web 构建/归档、Desktop Profile 组合与检查，最终选择 Windows 或 macOS 打包入口。

**原版这条链路没有后来新增的 display-staging/materialized-runtime 阶段，也没有将整个运行树“无链接化”的公共前置要求。** 这不意味着原版完全不复制文件：官方归档解压、提取到校验缓存、准备工具目录，以及 electron-builder 组装制品，本来就会产生必要的复制。

证据：[原版脚本定义 32 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/package.json#L32)、[根 release 编排](../references/original-platform-baseline-e94c99d5/source/scripts/package-desktop-release.mjs)、[开发启动器](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/start-workdsh.mjs)。

## 4. Node、包管理器与主机/目标架构

### 4.1 三种版本不能混为一谈

| 用途 | 原版固定值/约束 |
| --- | --- |
| 构建用 Node 的 package engines | `^22.19.0 || >=24.0.0` |
| Windows/macOS 打包脚本实际门禁 | Node 22 且 minor ≥19，或 Node 24.x；不是任意 ≥24 的版本 |
| CI Node | `22.23.2` |
| 根 Desktop 工作区 | Yarn `4.18.0`，immutable install，`nodeLinker: node-modules` |
| 嵌套 Web 工作区 | pnpm `10.34.5`，独立 frozen lockfile |
| 制品中的官方工具 | Node `24.21.0`、pnpm `11.28.5`、Python `3.12.14` |

这意味着：电脑上用来编译的 Node、Web 的包管理器、应用随包带的 Node/pnpm，原版就允许承担不同角色；不能因为版本不同便推定混入了错误运行时。

证据：[根清单](../references/original-platform-baseline-e94c99d5/source/package.json)、[Web 清单](../references/original-platform-baseline-e94c99d5/source/apps/web/package.json#L7)、[Windows 门禁 104 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/package-win.ts#L104)、[macOS 门禁 93 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/package-mac.ts#L93)、[工具版本锁](../references/original-platform-baseline-e94c99d5/source/upstream.json)。

### 4.2 macOS 双架构怎样处理

`runtimeArchitecture()` 同时记录 `platform`、`hostArch`、`targetArch`，macOS 目标通过 `WORKDSH_MAC_ARCH` 指定；安装所需 CPU 集合为主机和目标架构的去重并集，写进 Profile 的 `supportedArchitectures`。根 Yarn 配置也包含 current、x64、arm64。

macOS 打包对每次选定的架构分别构建；CI 的 x64/arm64 是**目标矩阵**，不是证据证明同时使用了两种 CPU 的物理 runner。afterPack 的 CLI smoke 对 arm64 主机上的 x64 macOS 目标将超时放宽到 120 秒，注释明确描述 Rosetta 情形。

Windows 打包入口要求 x64；虽然架构辅助函数接受 x64/arm64 字符串，不能由此推导 Windows arm64 产品已支持。根 Yarn 注释写着 macOS universal，但实际入口和制品验证是分别指定目标架构；不能只靠注释认定产物是 universal binary。

证据：[架构策略](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/runtime-architecture.mjs)、[Yarn 架构配置](../references/original-platform-baseline-e94c99d5/source/.yarnrc.yml#L20)、[跨架构测试 203 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/verify-profile-release.test.mjs#L203)、[Rosetta smoke 48 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/verify-electron-fuses.ts#L48)。

## 5. 官方运行时资源：版本、解压、缓存和目录

### 5.1 每个目标单独锁定，不自动猜测或回退

| 目标 | 官方工具归档版本 | 格式 | 字节数 |
| --- | --- | --- | --- |
| `win-x64` | `0.2.1-rc.5` | `.exe` | 289,408,544 |
| `mac-arm64` | `0.2.1-rc.5` | `.zip` | 347,767,892 |
| `mac-x64` | `0.2.1-rc.4` | `.zip` | 369,524,912 |
| Linux | 无条目 | — | — |

原版 `upstream.json` 为每个归档锁定 URL、大小和 SHA-512。Intel macOS 的 rc.4 是**工具归档来源的显式差异**，不允许把 Host/Client/SDK npm 包降为 rc.4，也不把原始 `runtime.json` 改写成 rc.5。自有 provenance 另存 npm DSH 版本、目标、归档身份及原始 metadata 的 SHA-256。

证据：[完整归档锁及 SHA-512](../references/original-platform-baseline-e94c99d5/source/upstream.json)、[来源校验及独立回执](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/official-runtime-provenance.mjs#L18)。

### 5.2 平台解压策略

- macOS：调用 `/usr/bin/ditto -x -k` 解开 ZIP。
- Windows：使用 `WORKDSH_7ZIP`，否则定位 `ProgramFiles/7-Zip/7z.exe`；先解外层安装包，发现 `app-*.7z` 时再解内层。
- 两者：从解压结果定位含 `runtime/primary-runtime/runtime.json` 的资源目录，检查元数据，再提取 `primary-runtime`、`office-skills`、`cli`。没有把官方另一个 Electron 应用整体作为 WorkDSH 产品带入。
- 缓存：`build/official-release-cache/<target>-<artifact.version>`；命中条件包含 copyFormat、npm DSH 版本、目标、完整归档身份及必要可执行资源。命中后直接复用；未命中才下载/提取，下载先写 `.partial` 并验哈希。

缓存不是每次都重新下载，但从缓存准备到工作运行时仍存在复制；原版这里没有以 hardlink 代替所有拷贝的通用优化。后续评估耗时时，应区分下载、解压、资源准备、额外物化和最终打包，不能都叫“复制 Electron”。

证据：[缓存、下载与解压 58 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/official-desktop-release.mjs#L58)、[primary 准备入口](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/prepare-workdsh-primary-runtime.mjs)。

## 6. 路径、可执行文件与资源寻址

### 6.1 共享逻辑通过路径 API 表达本机路径

源码大量使用 `node:path` 的 `join/resolve/dirname`、`fileURLToPath(import.meta.url)` 和 Electron `process.resourcesPath`。脚本自身目录来自模块 URL；打包制品目录来自 Electron/builder 上下文，而不是统一硬编码 `C:\...` 或 `/Applications/...`。

例如 carrier 的打包后 Profile 是 `resourcesPath/workdsh-runtime/profiles/workdsh`，primary 是 `resourcesPath/workdsh-runtime/primary-runtime`；最后一个文件名按平台选择 `node.exe` 或 `node`。开发启动器则明确使用本项目 `build/workdsh-runtime`，并向 Electron 传入 Profile、Node 和 primary 的覆盖变量。

这些代码共享的是“路径组成规则”，不是要求各平台最终字符串完全相同。**主机路径的分隔符由运行该脚本的主机决定；制品目标的文件名、资源层级和二进制架构由目标决定。** 原版两者并非处处用同一个 platform 值处理。

证据：[carrier 资源定位 46 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/src/workdsh-main.ts#L46)、[开发启动路径 9 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/start-workdsh.mjs#L9)、[按制品目标定位可执行文件 27 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/verify-electron-fuses.ts#L27)。

### 6.2 环境变量和用户数据

| 对象 | 原版处理 |
| --- | --- |
| Desktop user-data | 默认交给 Electron `app.getPath('userData')`；支持绝对路径 `WORKDSH_DESKTOP_USER_DATA` |
| 个人 DSH Home | 默认 `userData/dsh-home`，支持 `WORKDSH_DSH_HOME` |
| 企业状态 | 在 user-data 下按 backend/组织/成员形成独立命名空间，分开 home、dsh、agents、workspace、tmp 等 |
| 企业子进程 PATH | Node 所在目录优先；Windows 用 `;`，其余用 `:` |
| 通用 smoke PATH | 使用 `node:path.delimiter` |
| 临时/用户环境 | 同时设置 HOME、USERPROFILE、TMPDIR、TMP、TEMP、APPDATA、LOCALAPPDATA；保留必要系统字段 |
| Web preview 命令 | Windows 选 `pnpm.cmd`，其余选 `pnpm`；只修改子进程 PATH |

**原版已有局限：**`command-cli.ts` 在缺少覆盖变量时，Windows 读 `APPDATA/WorkDSH`，所有非 Windows 都读 `~/Library/Application Support/WorkDSH`。这实际上沿用了 macOS 路径，没有 Linux 专属默认目录。不要把这一点归因于我们后续的 Windows 修改；也不要声称 carrier 和 CLI 的 Linux 默认数据路径已经一致。

证据：[Home/资源定位](../references/original-platform-baseline-e94c99d5/source/apps/desktop/src/workdsh-main.ts#L52)、[user-data 覆盖和单实例 476 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/src/workdsh-main.ts#L476)、[企业环境 127 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/src/local-runtime.ts#L127)、[CLI 默认路径 19 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/src/command-cli.ts#L19)、[Web 子进程 PATH](../references/original-platform-baseline-e94c99d5/source/apps/web/scripts/preview-process-environment.mjs)。

## 7. 文件系统语义：链接、可写状态与权限

### 7.1 相对链接是原版明确维护的契约

官方资源复制使用：

```js
cpSync(source, destination, {
  recursive: true, force: true,
  dereference: false, verbatimSymlinks: true,
})
```

其含义是保留链接及其原始目标文本，不把相对链接重写成指向临时解压目录的绝对链接。源码 `COPY_FORMAT = 3` 的注释明确解释，旧格式曾把相对链接改坏，所以需要使旧缓存失效。

非 Windows 测试构造 `python3 -> python3.12`，经过 source→cache→prepared 两次复制，再删除原始来源，仍要求 prepared 中保持相对目标且可读。该测试在 Windows 跳过。因此：

1. 原版明确允许**文件符号链接**，不限于目录链接。
2. 原版不要求所有平台将整个资源树转为普通文件。
3. “复制后链接仍有效”与“所有文件内容看起来一样”是不同验收条件。
4. Windows 跳过这一测试不等于证明 Windows 链接完全不需要处理；本轮没有执行实际归档链接清点。

证据：[复制及 copyFormat 10 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/official-desktop-release.mjs#L10)、[相对链接回归测试 10 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/official-desktop-release.test.mjs#L10)。

### 7.2 安装输入与用户状态分开

原版将已安装产品依赖保留在安装包内的不可变 Profile，用户 Home 下只生成可写 Profile 配置、明确的用户增量和缓存。若用户可写 Profile 的 `node_modules` 是旧的共享 symlink，会直接拒绝启动，避免插件写入反向修改安装输入。

这与“官方工具目录里保留合法相对 symlink”并不矛盾：前者保护**可写用户空间的所有权边界**，后者保留**只读工具输入的加载语义**。不能把两个检查合成“一切链接都不允许”。

原版对目录/敏感配置使用 `0o700`/`0o600`，POSIX CLI 使用 `0o755`；但仅凭这些 Node mode 字段，不能声称 Windows NTFS DACL 或 Chromium 沙箱权限已经被验证。本轮没有执行 ACL 修复或权限放宽。

证据：[Profile 物化及拒绝旧共享链接 55 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/src/local-runtime.ts#L55)、[独立 Profile 无头验收](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/verify-installation-anchor.mjs)、[命令启动器权限](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/prepare-workdsh-command.mjs)。

## 8. Shell、CLI 与命令安装

| 场景 | Windows 原版 | macOS / POSIX 原版 |
| --- | --- | --- |
| 根 release 调 corepack | `corepack.cmd`，仅相应调用启用 shell | `corepack` |
| Windows 包前置检查 | 从 SystemRoot/WINDIR 定位 `System32/cmd.exe`，`/d /s /c` 执行 | macOS 直接执行 corepack 参数数组 |
| pnpm 准备 | `npx.cmd` + Windows shell | `npx` |
| 随包终端启动器 | `dsh.cmd`，`%~dp0` 定位包内 Node，透传 `%*` 并返回 errorlevel | `#!/bin/sh`，循环解析 launcher 链接，定位运行时，`exec ... "$@"` |
| 命令安装/移除 | 交给随官方归档提供的 command-manager worker | 同一 worker；macOS 写入遇 EACCES/EPERM 可通过 osascript 请求管理员权限 |

菜单只发起命令管理请求；官方 worker 拥有具体安装变更职责。本次原版源码快照没有把官方 worker 的全部实现展开，因此不推测它具体改哪个系统目录、注册表项或 shell 启动文件。

证据：[根 shell 选择 18 行](../references/original-platform-baseline-e94c99d5/source/scripts/package-desktop-release.mjs#L18)、[Windows cmd 选择 80 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/package-win.ts#L80)、[pnpm 平台分支 110 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/prepare-workdsh-runtime.mjs#L110)、[两个 CLI 启动器](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/prepare-workdsh-command.mjs)、[命令管理与提权 11 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/src/command-management.ts#L11)。

## 9. Electron 窗口行为、Host 与进程清理

### 9.1 界面共用，少量生命周期适配

- macOS 增加系统 appMenu；主应用 activation policy 为 regular，浏览器 worker 为 accessory。
- 所有窗口关闭时，非 macOS 在非切换状态下退出应用；macOS 保留应用级生命周期，并处理 activate。
- 所有平台均有单实例锁、second-instance 聚焦和 before-quit 的工作区/进程清理逻辑。
- 原版启动器显式清除 `ELECTRON_RUN_AS_NODE` 再启动 Electron；并没有默认加 `--no-sandbox`。

证据：[worker policy 92 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/src/workdsh-main.ts#L92)、[菜单 463 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/src/workdsh-main.ts#L463)、[主生命周期 476 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/src/workdsh-main.ts#L476)、[Electron 启动环境 20 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/start-workdsh.mjs#L20)。

### 9.2 进程树按平台处理

| 场景 | Windows | 非 Windows |
| --- | --- | --- |
| Host/命令子进程 | 不使用 POSIX detached 进程组策略 | `detached: true`，便于按进程组回收 |
| 所有权依据 | PID、PPID、创建时间，防止 PID 复用误杀 | 自有 detached 进程组 |
| 清理工具 | PowerShell CIM 查询后，核验身份再 taskkill；有超时/数量边界 | 先 SIGTERM，8 秒后可 SIGKILL，12 秒总停止时限 |
| 成功判据 | 需要确认自有进程已经消失，不只看父进程退出 | 回收进程组；ESRCH 作为已不存在处理 |

原版不是在所有平台统一执行 `taskkill`，也不是为了退出而无差别停止所有 Node/Electron。上述 Windows 自有进程清理还应与 NSIS 安装器的旧进程处理区分，见下一节。

证据：[Host spawn 235 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/src/workdsh-main.ts#L235)、[命令 spawn 15 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/src/official-command.ts#L15)、[进程所有权与清理](../references/original-platform-baseline-e94c99d5/source/apps/desktop/src/owned-process.ts)。

## 10. 平台打包、安装器和签名差异

### 10.1 Windows

`package-win.ts` 与 portable 入口要求原生 Windows/x64，构建 unsigned NSIS 或 ZIP，显式 `--publish never`、`signExecutable=false`、`npmRebuild=false`，并移除签名密钥环境。NSIS 为 per-user、非 one-click，允许选安装位置；支持提权不等于默认 per-machine 安装。安装包许可文件为 `THIRD_PARTY_NOTICES.md`。

Windows 原版已经有 ICO 生成器：从共享 PNG/SVG 派生多尺寸图标，小尺寸有专门渲染处理；不能把 macOS PNG 或浏览器 SVG 直接等同于 Windows 原生窗口/任务栏图标。

### 10.2 macOS

unsigned DMG smoke 与正式签名 release 分开：smoke 清理签名环境并关闭 notarization；release 有 Developer ID、签名/公证凭据前置门禁，检查阶段和验收阶段不无差别继承凭据。正式验证包括 codesign、Gatekeeper `spctl` 和 `xcrun stapler validate`。

carrier 配置 hardenedRuntime，LSUIElement，独立 macOS 图标画布和 template tray 资源。afterPack 还对随包 Node 作 ad-hoc 签名，使用 `allow-jit`、`disable-library-validation` entitlement，随后若走正式 release 再进入最终签名流程。这是源码中已经存在的明确平台差异，不能以“所有平台统一复制 Node”概括。

证据：[平台打包配置 102 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/package.json#L102)、[Windows 打包 121 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/package-win.ts#L121)、[macOS smoke 93 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/package-mac.ts#L93)、[macOS release](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/release-mac.ts)、[签名验收 82 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/verify-mac-release.ts#L82)、[Node 签名 147 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/verify-workdsh-carrier.ts#L147)、[entitlements](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/node-runtime-entitlements.plist)。

图标来源：[Windows ICO](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/generate-windows-app-icon.mjs)、[macOS 画布](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/generate-mac-app-icon.mjs)、[tray 变体](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/generate-tray-icons.mjs)。

### 10.3 原版已经修改了 electron-builder，不能视为完全默认工具链

根 `resolutions` 固定 `app-builder-lib@26.15.7` 的仓库 patch。该 patch 的平台差异包括：

| 范围 | 原版补丁行为 | 后续比较注意点 |
| --- | --- | --- |
| macOS keychain | 设置 key partition list 时改用临时 keychain password | 属于 macOS 签名工具适配，不应因 Windows 修改被移除 |
| Windows NSIS | 添加 `ManifestLongPathAware true` | 原版已经考虑 Windows 长路径，但不能据此证明整个依赖链无长度限制 |
| Windows 旧进程处理 | PowerShell 查询从安装目录前缀匹配改为文件名匹配 | 范围可能更广；这是原版既有取舍，不是本轮新增，也不等于 carrier 的严格进程所有权检查 |
| Windows 解压 | 直接向 `$INSTDIR` 解压，避免临时目录写一次再复制一次 | 明确以安装速度换取非原子覆盖；必须保留风险描述，不能称为无损优化 |
| Windows 升级 | 特定旧卸载器返回码 2 时继续走非原子原位替换 | 需单独验收升级/占用文件场景，不与首次安装混淆 |
| 公共依赖收集 | 环境 `DSH_ELECTRON_BUILDER_TRAVERSAL_ONLY=1` 仅用物理遍历 | 原版已有避免展开全工作区依赖的策略；不是 Windows 独占规则 |

证据：[补丁原文](../references/original-platform-baseline-e94c99d5/source/patches/app-builder-lib@26.15.7.patch)、[根 resolutions 14 行](../references/original-platform-baseline-e94c99d5/source/package.json#L14)、[公共 builder 环境](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/electron-builder-environment.ts)。这里仅记录 patch 中的意图和字节，不把它当作本轮重新验收过的安装行为。

## 11. 原版如何分层验收

| 验收层 | 原版包含什么 | 不能由此推出什么 |
| --- | --- | --- |
| 公共无头检查 | build、typecheck、单元测试、DSH 对齐/交付路径门禁 | 不证明本机窗口、安装器或所有目标系统通过 |
| 平台打包脚本测试 | 注入平台、架构、命令执行器，验证正确门禁和参数 | 在 Linux 模拟 darwin 不会产生真实 macOS 系统调用或文件系统 |
| afterPack carrier | 单 carrier/单 runtime、归档闭包、版本/来源、native addon、pnpm、插件清单、Host 初始化、Web boot/batch | 不是实际 Electron 主界面体验验收 |
| Windows NSIS verifier | 安装包和 unpacked 应用 PE 结构、runtime 元数据、Node/Python PE | 没有实际执行安装向导，也不证明安装后 GUI |
| Windows portable verifier | ZIP 非空、存在 WorkDSH.exe、resources/app.asar、PE | 不等于每个运行资源已实际加载 |
| macOS unsigned DMG verifier | 挂载只读 DMG、plist、app.asar、Electron/Node/Python 架构 | 不证明签名、公证或 Gatekeeper 接受 |
| macOS release verifier | 签名、Gatekeeper、stapler 加架构检查 | 不等于用户所有实际交互通过 |
| Electron fuse verifier | 检查最终产物可执行文件及要求的 fuse 状态，含目标路径区分 | Linux 分支存在不等于完整 Linux 运行时可打包 |

原版 Host smoke 使用独立临时 Home、loopback 随机端口和 `--no-open`；同时读取 stdout/stderr，等待 URL 加 IPC appReady/必需服务回执，再核对鉴权换 cookie、Web boot 图和客户端 batch。它不发起模型调用，也不启动 GUI。**所以原版已经区分“监听端口”和“必需服务真正初始化”。**

一个需防止误读的测试事实：原版 `verify-profile-release.test.mjs` 会在部分夹具中将 Linux 的 `process.platform` 模拟为 darwin，以测试编排；这不算 Linux/macOS 实机验收。Electron 测试准备脚本只提前解析并准备运行时，防止 Windows 测试 worker 并发解压，也不启动窗口。

证据：[完整 carrier 校验](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/verify-workdsh-carrier.ts)、[Host ready 条件 58 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/packaged-host-smoke.mjs#L58)、[无头安装锚点检查](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/verify-installation-anchor.mjs)、[Windows 安装器 verifier](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/verify-win-installer.ts#L88)、[portable verifier](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/verify-win-portable.ts#L32)、[macOS DMG verifier](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/verify-mac-smoke.ts#L72)、[平台模拟测试 28 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/scripts/verify-profile-release.test.mjs#L28)、[Electron 测试准备](../references/original-platform-baseline-e94c99d5/source/scripts/prepare-test-electron.mjs)。

## 12. CI 和发布的三平台分工

| job | 系统 | 原版配置的职责 |
| --- | --- | --- |
| `changes` / `check` | Ubuntu | 变更分类、immutable install、公共完整无头检查 |
| `web-source-check` | Ubuntu | Web frozen install、构建/类型/版本与浏览器集成检查 |
| `desktop-windows` | Windows | 从同提交本地源码走根 release 打包，生成并保存 x64 安装器及 footprint |
| `desktop-macos` | macOS | 分别以 `WORKDSH_MAC_ARCH=x64/arm64` 走根 release，生成 unsigned DMG smoke |
| `enterprise-plugin` | Ubuntu | 外部企业插件归档及相关门禁 |
| `publish-desktop-release` | Ubuntu | 等待规定检查；发布标签提交须可从 main 到达、版本匹配，再汇集并发布制品 |

Desktop Windows 和 macOS 分别在对应原生 runner 构建。Ubuntu 在这里承担通用开发检查、Web/服务端相关检查和发布协调，不是“Linux Desktop 已构建”。标签触发为 `desktop-v*`；正式 release policy 与 unsigned CI smoke 不能混为一谈。

证据：[CI 公共检查 73 行](../references/original-platform-baseline-e94c99d5/source/.github/workflows/ci.yml#L73)、[Windows job 185 行](../references/original-platform-baseline-e94c99d5/source/.github/workflows/ci.yml#L185)、[macOS job 231 行](../references/original-platform-baseline-e94c99d5/source/.github/workflows/ci.yml#L231)、[发布门禁 318 行](../references/original-platform-baseline-e94c99d5/source/.github/workflows/ci.yml#L318)。本报告没有读取这些 job 的历史成功记录。

## 13. 两种容易误认的“原版支持”

### 13.1 Linux 的局部代码不等于完整支持

至少有四处独立阻断：根 release 只接受 darwin/win32；归档锁没有 Linux 目标；primary runtime 准备明确拒绝 Linux；carrier afterPack 资源验收只接受 darwin/win32。相对地，package.json 确有 Linux `dir` 配置、fuse helper 确有 Linux 可执行文件寻址、企业环境确有 DISPLAY/WAYLAND_DISPLAY 字段。

正确表述是：**原版有可复用的跨平台基础代码和 Linux 无头/Web 能力，但该快照没有打通标准 Linux Desktop 发布链路。** 不能简单说“Linux 完全没有代码”，也不能把它当作已经成功工作的 Linux Desktop 基准。

### 13.2 仓库中的历史补丁存档不等于当前生效入口

原始 ZIP 中还保留 `apps/web/scripts/desktop/pack-desktop.mjs` 和 `patches/upstream/...` 等旧测试/补丁材料，包含 macOS arm64 的目标硬编码、旧 Desktop config，以及 Linux AppImage 配置。它们不是本报告锁定的根 `release:pack` / `apps/desktop` 标准构建链路的调用节点。

该存档同时存在说明原版仓库并非没有历史残留。后续找参考时必须先追踪入口是否可达，不能因为“同在原版 ZIP”就把旧 AppImage、自动更新或另一个 carrier 的实现当成当前产品契约。Web desktop README 甚至仍称 carrier 位于独立仓库；Desktop README 的 npm DSH 描述仍写 rc.2，与实际 lock rc.5 不一致。**本报告以生效入口和锁文件为基线，保留文档漂移记录，不替原版润色。**

证据：[旧打包脚本头部及 target 配置](../references/original-platform-baseline-e94c99d5/source/apps/web/scripts/desktop/pack-desktop.mjs#L1)、[旧 builder config 的 Linux 配置](../references/original-platform-baseline-e94c99d5/source/apps/web/scripts/desktop/patches/upstream/apps/desktop/electron-builder.config.mjs#L104)、[Web Desktop README](../references/original-platform-baseline-e94c99d5/source/apps/web/scripts/desktop/README.md)、[Desktop README 58 行](../references/original-platform-baseline-e94c99d5/source/apps/desktop/README.md#L58)。不建议恢复这些旧源码打包路线。

## 14. 后续比对使用的固定检查项

下表是比对清单，**不代表本轮授权实施或要求全部重建**。先比较对应契约，再决定最小验证；完整原生打包/安装/GUI 仍按目标阶段决定。

| ID | 原版基准 | 后续重点检查 |
| --- | --- | --- |
| P01 | 同一 npm DSH 版本，工具归档按目标分别锁定 | 不混淆 npm 与工具版本，不伪造 Intel 元数据 |
| P02 | 共享 Profile/产品功能，平台入口分开 | 不复制专家/技能/品牌产品规则为三套 |
| P03 | Windows/macOS 原生打包，Linux 链路未完成 | 不把新适配或未支持平台冒称原版能力 |
| P04 | 主机/目标架构分别记录，macOS 支持目标覆盖 | 路径语义与资源目标判断是否混用 |
| P05 | 合法相对文件 symlink 保留，copyFormat=3 | 新阶段有无拒绝、改绝对目标或破坏可执行链接 |
| P06 | 缓存命中复用，资源准备和制品组装仍有复制 | 新增复制究竟保护哪项契约，是否有等价替代 |
| P07 | 安装依赖不可变、用户 Profile 可写增量分开 | 不以用户空间隔离为由强制全量复制输入 |
| P08 | 资源定位用 join/resolve/URL/Electron 上下文 | 测试预期是否错误固定反斜杠或主机路径 |
| P09 | Windows `.cmd`/`;`，POSIX shell/`:` | 启动命令、参数转义、PATH 和退出码保持 |
| P10 | Node/Python 命名和 app Resources 层级按目标选择 | materialized/config/staging 是否保留正确层级 |
| P11 | macOS 签名、公证、Node entitlement 独立 | 新的复制或改字节是否破坏后续签名链 |
| P12 | Windows NSIS 有长路径与非原子安装补丁 | 不把继承的补丁行为误认新变更；升级风险独立验收 |
| P13 | 公共 builder 物理遍历，避免全 workspace 展开 | 新配置是否绕过原版的依赖收集限制 |
| P14 | Windows PID 代际清理，POSIX 进程组清理 | 不能统一为同一个 taskkill/kill 实现 |
| P15 | GUI 生命周期保留 macOS 习惯 | 品牌等显示修改不得顺带改变退出/激活语义 |
| P16 | 配置/夹具测试、Host smoke、实际 UI 是不同证据 | Linux 模拟和 Windows 本机通过不替代 macOS 实机 |
| P17 | 三平台图标格式/托盘资源不同，品牌来源可共享 | 统一品牌内容不等于统一一种原生图标文件 |
| P18 | 原版没有额外 display staging/materialization | 新增阶段是否在所有平台必要，失败边界是否明确 |
| P19 | Linux CLI 默认目录和部分 README 已有局限 | 不能把原版不足算成本次回归，也不能照搬为正确答案 |
| P20 | 有历史补丁存档，当前入口不引用它们 | 比较前先确认 owner、实际入口及产物来源 |

## 15. 架构判断及交付检查

基于原版事实，可以保留此前方向，但应更精确：**共享产品和版本契约，沿用现成 Windows/macOS 打包入口，仅对确有不同语义的文件系统、命令、签名和进程操作设置平台适配。** 是否需要 Windows/其他平台各一份新文件，应由这些契约决定，不能由“与历史 diff 不同”或“路径里有反斜杠”决定。

尤其不能把 macOS 和 Linux 无条件当成完全相同的一套：它们可共享部分 POSIX 文件/进程行为，但官方资源来源、签名、app bundle、CLI 默认目录和产品支持范围并不一致。这里是由源码得到的架构建议，尚未冻结为实施设计。

本轮交付校验：57 个参考源文件的 SHA-256 与清单一致、均有历史提交匹配记录；报告引用的本地文件和行号存在；总目录、DESIGN/PLAN 入口同步。没有修改产品源码、官方运行时、锁文件、构建配置或当前应用状态；没有提交、推送或发布。本轮原始检查回执存于 [r111 validation](../.runs/r111-original-three-platform-audit-20261117-001/validation.json)。

长期入口：[RESEARCH_INDEX](RESEARCH_INDEX.md)；架构入口：[DESIGN](../DESIGN.md)；实施与研究记录：[PLAN](../PLAN.md)。
