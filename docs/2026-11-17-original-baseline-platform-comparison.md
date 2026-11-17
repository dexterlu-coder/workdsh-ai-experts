# 二次开发前基线与当前构建的平台差异

日期：2026-11-17；性质：本地来源核对、源码差异及架构建议；runId：`r110-baseline-platform-compare-20261117-001`。本次仅比对并写文档，不修改产品/构建源码，不运行构建或触碰当前应用窗口。

## 1. 基线从哪里来

- 当前仓库最早提交 `6a2c8fef025cb6efb6b8cff39ca7897e3b0a81c6` 已是“Integrate prebuilt training course expert”，不能当作二次开发前原版。Git 不是浅克隆，但本仓库自身的历史起点较晚。
- 邻近的 `D:\project\codex\workdsh` 有自己的 Git 历史和大量未提交变更，因此它的当前工作树也不是只读原版。
- 找到本地 `D:\project\codex\workdsh-main.zip`，SHA-256 为 `4AB764957CFFBC9C52DFC36CEA0429AF46033163E9087BD21A986A9C1BCBEC37`。ZIP 注释记录提交 `e94c99d5f9e143fb67fec84a74978eb8218daf32`，邻近仓库有对应 Git 对象，提交时间为 2026-10-31 20:55:58 +08:00。
- 抽查 ZIP 内的 Windows/macOS 打包脚本、primary-runtime 准备、local-runtime、Desktop package.json、upstream.json 和 CI 共 7 个关键文件，内容（归一化 CRLF/LF 后）均与该提交一致。
- 因此本次采用这个可追溯 ZIP 为二次开发前基线；这不等于证明它是上游历史最早版本，也不证明该提交曾通过所有系统的真实验收。

来源证据：[provenance.json](../.runs/r110-baseline-platform-compare-20261117-001/provenance.json)。

## 2. 比对范围与结果

检查 Desktop scripts/src/tests、根 scripts 和 package/upstream/CI 等共 135 个相关文件路径；对比当前验证分支及工作树，忽略单纯换行差异。发现 17 个修改、12 个新增，106 个未变；不是全仓全部文件的兼容性认证，也没有逐项审查与路径无关的专家内容或全部文档。

差异、文件哈希和范围见 [comparison.json](../.runs/r110-baseline-platform-compare-20261117-001/comparison.json)；逐文件 diff 保存在同一 run 的 `diffs/`，只提取了比较所需的历史文件，没有复制整套仓库或运行时。

## 3. 对用户假设的核实

“原版路径全部符合 macOS/Linux，因此差异就是需要拆分的文件”不能直接成立：

1. 原版已经有 `package-win.ts`、`package-mac.ts`、`release-mac.ts`，并分别要求原生 Windows/macOS 主机构建。原版并不是只有 POSIX 实现。
2. 原版已普遍使用 `node:path`、`fileURLToPath` 和 `process.platform`。Windows 专属测试原来就含 `C:\\...` 夹具字符串；出现反斜杠本身不说明需要新建平台版本。
3. 原版的 `prepare-workdsh-primary-runtime.mjs` 仅接受 `win-x64`、`mac-arm64`、`mac-x64`；Linux 无头检查不能推导出 Linux Desktop 制品受支持。这个文件以及 `local-runtime.ts`、`upstream.json`、CI 在本次选定范围中与基线相同。
4. 历史 diff 能定位修改来源，但不能单独证明回归的因果关系；新增代码可能是必要修复，原版也可能有缺陷。需要逐项说明契约并补对应验证。

## 4. 已识别的真实差异

| 位置 | 原版 → 当前 | 判断与处置建议 |
| --- | --- | --- |
| `apps/desktop/tests/package-win.spec.ts` | 新增 3 个配置路径断言，固定反斜杠；实现新增参数使用当前系统的 `join` | 明确的测试路径假设问题；根据夹具目录形成期望，不复制整个测试文件 |
| `apps/desktop/package.json` | `dev`、`package:dir`、macOS/Windows dist 均加入 display staging 和 materialization | 平台影响发生在公共调用链，不能只修路径字符串；需明确哪些平台、哪些阶段确需物化 |
| `scripts/package-desktop-release.mjs` | 公共 release 路径也加入 display/materialized 准备 | 平台策略选择应在统一入口显式登记，避免 macOS 因 Windows 调试新增步骤而改变链接契约 |
| `prepare-workdsh-display-staging.mjs` | 原版无此文件；当前拒绝文件符号链接，只接受目录链接 | 与原版允许相对可执行文件符号链接的行为存在静态契约冲突；若输入有此链接将被拒绝，需 POSIX 原生验收 |
| `materialize-workdsh-display-runtime.mjs` | 原版无此文件；展开目录链接、拒绝文件 symlink，输出禁止 reparse | 这个物化策略不能未经证明就强制应用所有系统；Windows 链接处理适合独立策略实现 |
| 两个新增阶段的路径比较 | 对路径使用不区分大小写的比较，存在无条件 `toLowerCase()` | Windows 和大小写敏感文件系统语义不同；路径边界和环检测不能默认所有平台大小写等价 |
| 新 hardlink-limit 修复 | Windows `nlink >= 1024` 的精确故障分支 | 保留为 Windows 特定行为；公共身份、哈希和版本约束共享，不复制产品规则 |
| macOS/Windows 打包入口 | 各新增一个自定义 electron-builder config 参数，原有平台入口仍存在 | 不需复制第二套完整入口；应检查其引入的配置是否保留各平台契约 |
| `start-workdsh.mjs` | 新增 materialized/staging pointer 优先选择 | 这是运行时来源策略，公共选择逻辑需可追溯，不能仅靠检测系统自动误选旧产物 |
| `workdsh-main.ts` | 品牌字段和 Host ready stdout/stderr/竞态处理变更 | 共享产品显示和启动修复；不能因为与原版不同就归入 Windows 或直接恢复原版 |

关于文件 symlink 的证据：未变化的 `official-desktop-release.test.mjs` 在非 Windows 上明确测试保留 `python3 -> python3.12` 的相对链接；新增 staging 在 `targetInfo.isDirectory() === false` 时拒绝。这里已经能证明源码契约不一致，但还没有实际读取/运行 macOS 官方制品，不能写成“本轮 macOS 实机已复现失败”。

## 5. 推荐的架构边界

推荐沿用原版已有的平台入口，只在新增且确实不同的文件系统行为上拆实现：

- **公共部分：**版本锁定、8 个专家资产、品牌补丁定义/锚点/输入哈希、配置字段、回执完整性以及启动成功标准。
- **Windows 文件系统策略：**Junction 处理、必要的常规文件物化、NTFS hardlink 上限及相应故障证据。
- **POSIX 文件系统策略：**保留经过验证的相对 symlink 语义，采用相应的大小写规则；是否新增 staging、如何将品牌补丁安全传入制品，须在原版链路基础上验证。不能简单跳过品牌变更，也不能照搬 Windows 的“所有链接均展开”规则。
- **测试：**路径拼接保持跨主机可执行；平台行为用精确的独立夹具与契约测试；真正的 macOS/Windows 打包仍在相应主机验收。

如果落实到文件，可以考虑 `runtime-tree.windows.mjs` 与 `runtime-tree.posix.mjs` 这样的窄适配模块，由公共入口选择。它们是建议命名，尚未新建或批准为实现范围。已有 `package-win.ts`/`package-mac.ts` 继续承担各自打包职责，不再克隆整套构建文件。

选择平台时区分“构建主机平台”和“制品目标平台”：本机文件地址遵循主机文件系统；制品资源、签名和可执行文件名称遵循目标平台。不能将一个 `process.platform` 判断滥用于所有路径。

## 6. 后续计划调整

此前只聚焦“3 个路径断言 + 硬链接分支”的计划不足以覆盖本次基线比较发现的公共调用链和 POSIX symlink 风险，应先修订设计再实施：

1. 锁定本报告基线与当前 dirty 快照，登记保留的品牌、8 专家和启动修复。
2. 逐项列出公共构建步骤的输入/输出、链接语义和平台前提，决定策略边界。原版是行为参考，不进行全仓回退。
3. 对实际新增的 POSIX 文件 symlink、大小写路径和 Windows Junction/hardlink 情况建立精确夹具；保留公共产品契约。
4. Astra/high 审核修订范围后，Terra/high 最小实施；先聚焦检查，再复用现有三系统 CI，macOS/Windows 制品验收分别记录。

本轮没有授权直接切换构建策略或移动文件；本报告为待决策方案。已有应用窗口和所有未提交改动保持原状。
