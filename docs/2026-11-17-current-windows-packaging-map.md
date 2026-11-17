# 当前 Windows 打包流程、路径和复用关系

日期：2026-11-17；性质：当前源码事实、本机只读路径观察与历史实验结果；runId：`r112-current-platform-contract-audit-20261117-001`。当前输入：`codex/full-build-validation-20261116`，HEAD `aee688b755bb03747ebc6e5227768285bfa80d0e` **加调查时的 dirty 工作树**。输入文件哈希见 [comparison.json](../.runs/r112-current-platform-contract-audit-20261117-001/comparison.json)。

目的：让后续平台比对能追踪“哪个入口，在什么工作目录，用哪个输入，输出什么，为什么复制或复用”。本报告不是新的启动脚本或已验收安装包，也不授权修改构建逻辑。原版入口见[三平台基线](2026-11-17-original-three-platform-baseline.md)，当前平台判断见[契约对照报告](2026-11-17-current-platform-contract-comparison.md)。

## 1. 路径记号和三种不同入口

为避免本机路径被误当产品常量，下文使用：

- `R = D:\project\codex\workdsh-ai-experts`：本次仓库根目录。
- `D = R\apps\desktop`：唯一 Desktop 工作区。
- `W = R\apps\web`：独立 pnpm Web 工作区。
- `S = D\build\workdsh-runtime`：准备好的官方 npm Profile 加官方工具输入。
- `B`：最终应用的 `resources` 目录。Windows 目录包通常为 `D\dist\win-unpacked\resources`；安装后取决于用户选定安装位置，不能写死。

| 入口 | 工作与目标 | 关键差异 |
| --- | --- | --- |
| 根 `release:pack` | `R` 执行 `node scripts/package-desktop-release.mjs --source=local` | 从同提交源码构建 Web/自有归档，检查来源，再准备运行时和 NSIS |
| Desktop `package:dir` | 工作区 build、准备、物化，再 electron-builder `--dir` | 生成 unsigned 目录包，不生成/执行安装向导 |
| Desktop `dev` / `start` | dev 准备后启动；start 仅选择已有运行时并启动 Electron | start 可使用 staging；打包 config 强制要求 materialized，前置条件不同 |

`dist:win-portable` 最终选择 ZIP；`dist:win` 选择 NSIS。直接调用某个底层脚本，不等于已经执行根 release 的来源/组合检查。根 release 的 `--source=published` 是另一个明确模式，源码中下载位置仍固定为 `techflag/workdsh/releases/download/v<version>`；不能把它理解为自动从当前仓库远端拿到我们的新增专家和品牌包。

证据：[根 release](../scripts/package-desktop-release.mjs)、[脚本定义](../apps/desktop/package.json#L31)、[开发运行时选择](../apps/desktop/scripts/start-workdsh.mjs#L11)、[目录打包](../apps/desktop/scripts/package-dir.mjs)。以下只展开本次目标对应的 `--source=local`。

## 2. Windows local release 的完整调用顺序

| 阶段 | 执行者 / 主要 cwd | 输入 | 输出与门禁 |
| --- | --- | --- | --- |
| 1. 主机分流 | 根 release / `R` | `process.platform` | 只接受 win32/darwin；Windows 选择 corepack.cmd |
| 2. 根依赖与 Desktop 检查 | corepack / `R` | Yarn 4.18.0、根 lockfile | immutable install；Desktop build/typecheck/test，不打开 GUI |
| 3. Web 安装、构建 | corepack pnpm / `W` | Web lockfile、共享产品源码 | frozen install、官方依赖解析测试、自有功能构建、企业账户包构建 |
| 4. Web 归档 | `release:project:pack` / `W` | 当前构建产物 | `W\.artifacts\project-v<version>`；manifest 的版本、sourceCommit、sourceDirty 必须匹配 |
| 5. Desktop 组合归档 | `pack-workdsh-profile.mjs` | 已构建自有包 | `D\build\workdsh-profile-release-local-<commit12>-<timestamp>`；包闭包、SHA-256、干净来源检查 |
| 6. 官方 npm Profile 准备 | `prepare-workdsh-runtime.mjs` / `D` | `WORKDSH_RELEASE_DIRECTORY` 所选归档、锁定 DSH npm | `S\profiles\workdsh`、`S\package-cache`；版本、组合、模块身份和安装锚点校验 |
| 7. 官方工具准备 | `prepare-workdsh-primary-runtime.mjs` | win-x64 官方安装归档及哈希 | `S\primary-runtime`、`S\office-skills`；原版已有 two-seam 适配及 provenance 校验 |
| 8. 命令工具准备 | `prepare-workdsh-command.mjs` | 官方 CLI、自有 command-cli 构建产物 | `S\runtime\cli`；生成 POSIX dsh 和 Windows dsh.cmd |
| 9. 显示 staging | `prepare-workdsh-display-staging.mjs` | `S`、两个锁定显示补丁 | `.runs\<displayRunId>\staging\workdsh-runtime` 及 staging pointer/receipt |
| 10. 打包物化 | `materialize-workdsh-display-runtime.mjs` | 经校验的 staging pointer | `.runs\<materializeRunId>\materialized\workdsh-runtime`；展开目录链接、写结构/来源回执和 materialized pointer |
| 11. Windows 打包 | `package-win.ts` / `D` | carrier、自定义 builder config、物化输出 | Windows/x64/Node 门禁；unsigned NSIS，`--publish never` |
| 12. 产物检查 | afterPack、fuses、Windows verifier | 实际复制进应用的 Resources 与可执行文件 | 品牌哈希、原生 frame、版本/闭包、native addon、pnpm、Host/Web smoke、PE 等检查 |
| 13. 后续验收 | 独立启动/安装工作包 | 打包后的 EXE 和隔离用户空间 | 实际入口、个人主界面、8 专家、退出/重启；本轮未执行 |

根 release 已跑 Desktop gate 时向最后一步传 `DSH_PACKAGE_CHECK_ALREADY_RAN=1`，只避免重复该前置检查，不跳过资源准备或产物验真。直接 `dist:win` 默认仍执行自己的包检查。

证据：[根阶段编排](../scripts/package-desktop-release.mjs#L36)、[归档构造](../apps/desktop/scripts/pack-workdsh-profile.mjs)、[Profile 准备](../apps/desktop/scripts/prepare-workdsh-runtime.mjs)、[Windows 参数](../apps/desktop/scripts/package-win.ts#L121)。

## 3. 目录和文件的精确职责

| 路径 / 内容 | 来源与性质 | 消费者 / 可否直接复用 |
| --- | --- | --- |
| `D\lib\workdsh-main.js`、`connection-preload.cjs` | 自有 carrier 构建产物 | Electron/app.asar；源码变化后需重建 |
| `D\build\app-icon.png/.ico`、tray 资源 | `packages/ui/assets` 经自有品牌与平台图标生成器派生 | carrier/builder；品牌输入变更后重建 |
| `D\node_modules\electron\dist\electron.exe` | 本次模块解析到 Electron 43.3.0 的依赖运行时位置 | 开发启动；路径由包管理器/模块解析决定，不固定复制到每个 run |
| `W\.artifacts\project-v<version>` | Web release candidate | 根 release 检查 manifest 后消费，不以目录名证明提交匹配 |
| `D\build\workdsh-profile-release-local-<commit12>-<timestamp>` | 不可变 Desktop 自有包归档和 manifest | 设置为 WORKDSH_RELEASE_DIRECTORY；新增专家属于这里的自有包输入 |
| `D\build\workdsh-profile-release` | 底层脚本的默认归档位置 | 本次检查不存在；根 release 使用上面的新目录覆盖，不能据此判断归档丢失 |
| `D\build\official-release-cache\<target>-<artifact.version>` | 校验后的官方工具缓存 | primary/command 准备命中后复用；缓存身份包含目标/版本/归档/copyFormat |
| `S\profiles\workdsh\node_modules` | 官方 npm DSH 及安装后的 WorkDSH 产品依赖图 | source runtime；不是 Electron 本体 |
| `S\package-cache` | release manifest、自有 tgz 等 | 可写 Profile 初始化/插件相关操作；不包含用户模型 key |
| `S\primary-runtime\dependencies\node\bin\node.exe` | 官方工具归档中的普通 Node | Host、pnpm、命令；不是 Electron.exe |
| `S\primary-runtime\dependencies\python\python.exe` | 官方工具归档中的 Python | 工具能力 |
| `S\primary-runtime\dependencies\pnpm\bin\pnpm.cjs` | 官方随包 pnpm | 由随包 Node 执行，区别于构建 Web 的 pnpm |
| `S\runtime\cli\bin\dsh.cmd` | 自有生成的 Windows 启动器 | 相对定位随包 Node 和 command-cli |
| `R\.runs\<displayRunId>\staging\workdsh-runtime` | 显示补丁的受控派生输入 | start 或物化；普通文件多为 hardlink，不是全量独立字节副本 |
| `R\.runs\<materializeRunId>\materialized\workdsh-runtime` | 面向当前 builder 的无 reparse 树 | builder config；物化完成且回执通过才能消费 |
| `D\build\workdsh-display-staging.json` | 可变的共享 staging pointer | start、materializer、builder config；不是资源本体 |
| `D\build\workdsh-display-materialized.json` | 可变的共享 materialized pointer | start、builder config；缺失时 builder config 不回退到 source/staging |
| `D\dist\win-unpacked\WorkDSH.exe` | builder 生成的目录包入口 | packaged-runtime 验收；存在不等于是当前合格产物 |
| `D\dist\WorkDSH-<version>-x64-Setup.exe` | unsigned NSIS | 安装验收；本次未重新构建 |
| `D\dist\WorkDSH-<version>-x64-Portable.zip` | portable 入口生成 | ZIP/运行时验收；与 NSIS 是不同目标 |

本次只读取必要路径是否存在、pointer 字段和 Electron 包元数据，没有遍历庞大运行树。观察回执：[windows-path-observations.json](../.runs/r112-current-platform-contract-audit-20261117-001/windows-path-observations.json)。

## 4. Staging、物化、打包的边界

### 4.1 Staging 不是再安装一套 DSH

staging 默认取 `S`，要求 source/staging 同卷；目标显示文件独立复制，其余普通文件优先 hardlink。目录链接映射到 staging 内对应目录；文件 symlink 当前直接拒绝。复制退路目前只接受登记的 `EPERM+nlink>1`。两个改字节的目标是 layout 静态 productTitle 和 Conversation hero.headline；图标和徽章 CSS 由自有功能提供。

硬链接共享文件内容及 inode；创建目录项、扫描、stat、写回执仍有成本，也会增加 nlink。它不是完全免费的复用，更不是具有写入隔离的副本；后续不能就地改写共享非目标文件。

证据：[staging 实现](../apps/desktop/scripts/prepare-workdsh-display-staging.mjs#L49)、[固定显示补丁](../apps/desktop/scripts/display-patch-spec.mjs)。

### 4.2 物化为何仍可能很慢

物化按每条逻辑访问路径展开 Junction。相同物理依赖可通过多条逻辑路径重复出现，产生更多目录项、hardlink、lstat/stat 和 manifest 记录；达到硬链接限制或 EPERM 时还会实际复制内容。因而“没有大量独立字节副本”与“没有大量 I/O”是两回事。

当前 hardlink fallback 中，Windows 专用上限分支要求平台 win32、错误 UNKNOWN/EMLINK、失败后 nlink≥1024、源身份一致；独占复制后核对长度、哈希及独立 inode。原有 EPERM 退路仍存在；新增 stat/COPYFILE_EXCL 等也影响共享失败路径。staging 自身没有同样的上限分支，不能称为两个阶段都已解决上限问题。

物化结束后还要扫描无 reparse 的实际树并保存来源关系，独立 verifier 重新核对。这些约束是**当前策略**，不能由此反推它们都是跨平台唯一必要条件。

证据：[物化遍历和 fallback](../apps/desktop/scripts/materialize-workdsh-display-runtime.mjs#L52)、[物化回执校验](../apps/desktop/scripts/verify-display-materialized-receipt.mjs)。

### 4.3 Builder 最后复制什么

`electron-builder-config.mjs` 先验证两个 pointer，然后克隆 `package.json.build`，只把 extraResources 中目标为 `workdsh-runtime` 的 `from` 改成物化输出绝对路径；`to` 仍为 `workdsh-runtime`。Windows、macOS 打包入口均引用它。

因此制品中应落为 `B\workdsh-runtime\...`，不应仍引用构建机 `.runs`。carrier 自有代码进入 app.asar，Node/DSH/Profile 等作为 extraResources 位于 asar 外。afterPack 读取实际 Resources 做品牌/版本/闭包和 Host 验收，不能仅凭准备阶段 receipt 判断安装包正确。

证据：[builder config](../apps/desktop/scripts/electron-builder-config.mjs)、[extraResources](../apps/desktop/package.json)、[实际制品 verifier](../apps/desktop/scripts/verify-workdsh-carrier.ts)。

## 5. 关键环境变量及其边界

| 字段 | 当前用途 | 不能误解为 |
| --- | --- | --- |
| `WORKDSH_RELEASE_DIRECTORY` | 指定 Desktop 自有归档输入 | 自动选择“最新目录” |
| `WORKDSH_OFFICIAL_DESKTOP_ARCHIVE` / `WORKDSH_7ZIP` | 指定官方归档/Windows 解压器；归档仍需过锁定哈希 | 跳过官方版本/校验 |
| `WORKDSH_DISPLAY_SOURCE` | staging source，受仓库内 build runtime 路径约束 | 任意历史运行目录均可接受 |
| `WORKDSH_DISPLAY_RUN_ID` / `WORKDSH_DISPLAY_RUN_DIR` | staging run 及输出父目录 | 取消 `.runs` 边界或允许覆盖旧结果 |
| `WORKDSH_DISPLAY_MATERIALIZE_RUN_ID` / `..._RUN_DIR` | 物化 run | 在原 run 反复覆盖 |
| `WORKDSH_BUNDLED_PROFILE` / `WORKDSH_NODE_EXECUTABLE` / `WORKDSH_PRIMARY_RUNTIME` | 开发启动器向 carrier 明确传入选择的运行时 | 另装官方 Electron |
| `WORKDSH_DESKTOP_USER_DATA` / `WORKDSH_DSH_HOME` | 可变用户配置和个人 DSH Home 的覆盖 | 产品包或官方缓存输入 |
| `DSH_HOME` / `DSH_AGENTS_HOME`、TEMP 等 | Host/实验可变状态隔离 | 每个 run 必须复制 Electron/全部依赖 |
| `WORKDSH_DEPLOYMENT_CONFIG` | 包含公开 backend origin 的部署输入 | 凭据或 model key 配置 |

源码中 staging/materializer/verifier 当前强制使用仓库 `.runs`，而仓库补充规则为测试运行推荐同级 `<项目>-runs`；已有显示批次设计仍登记 `.runs`。这是需要在后续方案中明确的**源码/规则/旧批次边界差异**，本报告不直接搬目录或放宽 verifier。pointer 还是 `D\build` 的共享可变状态，创建前会拒绝旧 pointer；复用前必须明确其生产者、输入和当前验真结果，不应只看文件存在。

## 6. 可复用与需派生的对象

| 对象 | 复用判断 |
| --- | --- |
| Electron 43.3.0 | 来源、版本、平台/架构和文件身份成立即可复用；用户状态另隔离 |
| 官方归档/工具缓存 | 目标、哈希、元数据和链接语义不变可复用；Windows 归档不能给 macOS 目标使用 |
| 自有 tgz 与 manifest | 组合、提交、dirty 状态及哈希与目标一致才复用；不能只比较包版本号 |
| 安装好的 Profile | 依赖图、官方版本、自有包输入和平台架构匹配且校验通过才复用 |
| 显示 staging | 需验证输入和补丁身份、回执及实际目标；有 pointer 不等于适用于当前源码 |
| 物化输出 | 当前包 config 要求；但是否各平台均需此策略仍待设计决定 |
| user-data/Home/端口/进程 | 属于可变状态；按干扰边界隔离，不与输入复用混淆 |

## 7. 当前事实与尚未完成项

本轮观察：staging pointer 指向 `r103-display-20261117-001`；materialized pointer 不存在。`dist/win-unpacked` 虽存在，本轮未读取其来源、哈希或运行它，不能将其视为当前验收成功制品。Electron 包解析为 43.3.0，没有触发 Electron 的惰性下载或启动。

历史实验：r108 成功的是 staging 个人主界面，8 个新增专家与 3 个原始专家可见；r109 Windows 完整无头检查通过；r107 物化主动中止且未生成 pointer。历史结果分别见 [r108](2026-11-17-current-source-startup-r108.md)、[r106/r107](2026-11-17-materialize-hardlink-limit-r106.md)。本报告没有重新确认旧 PID 仍存活，也没有把历史记录当成本轮实时观察。

后续若改变平台策略，需保留品牌、8 专家及启动修复，先登记设计/allowlist/验收/回滚，按标准审核后最小实施。本文只是当前事实地图，不自动批准重构、全量复制、重新打包或发布。
