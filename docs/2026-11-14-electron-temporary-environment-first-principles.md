# Electron 临时环境启动差异：第一性原理分析

日期：2026-11-14

## 结论

历史 r61 的“临时环境”不是单纯换了一个临时目录，而是同时改变了五个启动条件：用户数据与锁隔离、环境变量继承、Electron Chromium 沙箱边界、进程监督与窗口验收、Electron/Runtime/App 的来源配对。历史成功回执明确把结果标为 `sandbox-and-no-sandbox-environment-exception`，并保留 `nativeAcceptance=blocked`；它证明的是一次受控环境例外下的真实窗口启动，不等于当前源码在默认环境中已经可启动。

历史 renderer 命令行还包含 `--disable-features=NetworkServiceSandbox`。当前失败日志来自 `network_sandbox.cc`，因此仅添加 `--no-sandbox` 并不能复现完整条件。但官方 Chromium 源码同时说明：Windows 即使在 network sandbox 未启用时，也会为 HTTP cache 预先设置 ACL；所以这个 feature flag 只能作为实验变量，不能直接当成根因或产品修复。受控最小 Electron A/B 矩阵已经证明，两组都保留相同的 ACL 拒绝；根因应转向启动器进程 token、完整性级别和 ACL broker 权限。

## 对象模型

- Electron 主进程：读取当前 App root，创建 BrowserWindow，并管理第二实例与退出。
- Chromium 子进程：浏览器、渲染器、GPU、Utility/Mojo 通道；当前错误 `mojo platform_channel ... access denied (0x5)` 属于这一层的原生启动失败信号。
- WorkDSH Host：由 Electron 后续启动，输出 `dsh web:` ready 信号。
- Profile/DSH Home：保存可写状态、锁、会话和用户配置。
- 启动监督器：负责清洁环境、记录 PID/creationTime/canonical path、等待窗口和清理进程。

## 历史成功与当前失败的变量差异

| 变量 | 历史 r61 | 当前尝试 | 影响 |
| --- | --- | --- | --- |
| 用户数据 | 唯一系统 TEMP run root 下的 userData/DSH_HOME/agents | 工作区 `.runs` 下目录 | 影响锁、缓存、Profile 状态和 ACL；当前路径可写，但没有复现历史路径条件 |
| 环境继承 | 清除 `ELECTRON_RUN_AS_NODE`、`NODE_OPTIONS`、Provider/API/Token 变量，并重设 TEMP、APPDATA、HOME 等 | 主要设置 `WORKDSH_*`，其余环境由父 PowerShell 继承 | 子进程解析、Node/Electron 行为和用户目录来源不完全相同 |
| 沙箱 | 明确允许测试专用 `--no-sandbox` | 后续尝试虽把参数放在 App root 前，但没有完整复现 r61 的监督与清洁环境 | 规避 Chromium sandbox broker 是历史 r59→r61 的关键变化，但不是唯一变量 |
| Network Service sandbox | 历史 renderer 命令行含 `--disable-features=NetworkServiceSandbox` | 初始当前尝试未传入；日志报 `network_sandbox.cc` ACL 拒绝 | 这是当前 Mojo/Cache/Network 拒绝的直接实验变量 |
| 监督与窗口 | WinApp supervisor 记录窗口、可见性、前台、PID 归属和清理 | 直接 `Start-Process`，期间存在旧 Electron 错误对话框/残留进程 | 可能造成前台、second-instance、锁和诊断混淆 |
| 运行时来源 | 历史 run 使用当时配对的 App、Electron、Profile 和 primary runtime | 当前源码的 `build/workdsh-runtime` 曾联接到 Academy 目录；当前 App 是 `WorkDSH` | 运行时/品牌/源码来源不一致，不能把历史包当作当前源码的启动证明 |

## 证据判断

1. Electron 43.3.0 二进制在历史目录、候选目录和 Academy 目录的 SHA-256 相同，单独执行 `--version` 正常；所以“Electron 文件本身不可执行”不是根因。
2. 最小 Electron 应用能建立进程和 Chromium 缓存；当前 WorkDSH 应用触发原生异常，说明故障发生在应用初始化、BrowserWindow 沙箱/IPC 或其启动依赖组合，而不是普通源文件 ACL。
3. 历史 r59 记录的根因是 Electron Chromium sandbox 初始化阶段的 `mojo platform_channel access denied`；r61 通过测试专用 `--no-sandbox`、唯一 TEMP root 和 clean env 后完成真实窗口与主界面验收。
4. 历史 r40 的 `windowVisible=true`、`didFinishLoad=true`、`axMainUi=true` 证明真实窗口曾经可见；历史 r2 的 `status=electron-window-started` 证明 Electron 载体曾经启动成功。
5. 当前 `r69` 记录了另一条独立问题：Host readiness 出现在 stderr，而当前解析逻辑只看 stdout；这会让窗口停在“正在启动个人工作区”，但它不是 r59 的原生 Mojo 崩溃根因。
6. 本轮最小 Electron A/B 矩阵中，`--no-sandbox` 与 `--disable-features=NetworkServiceSandbox` 两组都出现相同的 `Cache/SharedDictionary/Network` ACL 拒绝；feature flag 不是根因。当前 shell 为 medium integrity，Administrators 为 deny-only，只有 `SeChangeNotifyPrivilege` 启用。历史 r61 通过 WinApp/独立 supervisor 启动，因此下一步应对照 launcher token，而不是继续叠加 Chromium flags。

## 最小验证顺序

1. 关闭本次 run 产生的 Electron、错误对话框和 Host，确认没有旧窗口或 second-instance 进程。
2. 用历史 r61 的 clean env 契约，在系统 TEMP 下创建新的唯一 run root；清除 `ELECTRON_RUN_AS_NODE`、`NODE_OPTIONS`、Provider/API/Token/Secret 变量，显式设置 `TEMP/TMP/APPDATA/LOCALAPPDATA/HOME/USERPROFILE` 子目录。
3. 固定同一份 Electron 43.3.0，先启动最小 BrowserWindow，再启动当前 `workdsh-ai-experts/apps/desktop`，两次只改变 App root。
4. 当前源码启动时继续使用 `--no-sandbox` 作为测试环境例外，并单独记录 `sandboxDisposition`；成功后再分别替换 Profile/runtime 来源，定位是否是 runtime provenance 造成的失败。
5. 只有同时观察到 Electron 窗口、Host ready、主界面加载和进程归属清理，才把当前源码标为启动成功。
6. 不再把 WinApp 当作启动器，也不再叠加 Chromium flags；下一步只需用 r42 的 Node wrapper 结构与标准 DACL run root 做最小窗口对照，确认 ACL 继承差异是否足以解释 broker 失败。

## 当前矩阵结论

- A：最小 Electron + `--no-sandbox`，窗口句柄创建，但 `network_sandbox.cc`、`platform_channel` 和 Cache/Network ACL 错误仍在。
- B：最小 Electron + `--no-sandbox --disable-features=NetworkServiceSandbox`，错误完全相同。
- 两组 user-data ACL 在运行后没有新增 Chromium sandbox ACE。
- 当前终端 token 为 medium integrity，Administrators 组 deny-only，只有 `SeChangeNotifyPrivilege` 启用。
- 历史候选仓库 `workdsh-ai-expert-candidate` 与 `workdsh` 的根目录 DACL 是受保护的标准 ACL；当前 `workdsh-ai-experts` 与 `.runs` 的 SDDL 带有额外的 Codex 沙箱 SID 和继承项。该 ACL/继承差异已证实，但尚未证明它单独就是 Chromium broker 失败的唯一原因。
- 因此 feature flag 已被实验排除为根因。历史 r42 保存了真实 Node wrapper：普通 `node` 通过 `spawn(electronExe, ...)` 启动 Electron，WinApp 只负责观察；没有证据证明 WinApp 改变了 token。决定性已知差异是 r42 run root 的标准受保护 DACL，而当前 `.runs` 带有额外 Codex SID 和继承项。历史 r61 本身没有完整 launcher token receipt，因此 token 仍不能被臆测。

## 不应得出的结论

2026-11-15 受控对照：同一 Electron SHA-256、同一最小页面和同一 Node wrapper 在历史风格标准 DACL 根目录下无 `mojo/network_sandbox` 拒绝并保持运行；当前 `.runs` 根目录下 A/B 两组均报拒绝。当前最强根因是 DACL/继承差异，token 差异仍未被证明。

- 历史 r61 成功不代表当前 `workdsh-ai-experts` 源码已经成功。
- `--no-sandbox` 不能作为产品默认修复；历史计划明确把它限定为测试环境例外。
- Host 输出 `dsh web:` 不等于 Desktop 窗口可见；窗口、Host、renderer 和退出清理必须分层验收。

## 官方资料对照

- Electron 官方沙箱文档说明 renderer、GPU、audio 和 network service 都属于 Chromium sandbox；`--no-sandbox` 会关闭所有 Chromium sandbox，只适合测试。
- Chromium `network_sandbox.cc` 源码说明 Windows 会为 cache、Shared Dictionary 和 network data 目录授予 sandbox 访问权；源码还明确写着，cache ACL 即使在 sandbox 未启用时也会设置。
- Chromium `network_service_instance_impl.cc` 源码说明 Windows 每次建立 network context 都可能重新授予 data path ACL，因为不同 Chrome channel 的 LPAC SID 可能不同。
- Electron 官方 issue #49143 记录了 Windows network sandbox 因文件 ACL/发行方式失败的同类问题，并明确把“修正 ACL”与“无 sandbox 运行”视为不同路线。

