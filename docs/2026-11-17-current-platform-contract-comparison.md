# 原版契约与当前源码的平台对照及决策边界

日期：2026-11-17；性质：源码比较、因果分析与待决策建议；runId：`r112-current-platform-contract-audit-20261117-001`。状态：`research-complete / implementation-not-authorized-by-this-report`。

本轮采用三个相关参考：[原版三平台基线](2026-11-17-original-three-platform-baseline.md)、[r110 初步差异](2026-11-17-original-baseline-platform-comparison.md)、[当前 staging 成功与打包验收交接](2026-11-17-packaged-validation-handoff.md)。当前 Windows 的具体链路、路径和复用条件见[配套报告](2026-11-17-current-windows-packaging-map.md)。

## 1. 对用户方法的判断

“原版处理＋当前源码差异＋Windows 当前路径/流程”是很有价值的调查组合，能减少凭印象拆文件或重复试错。但是，**它足以定位和排序需要调整的契约，不能单独充分证明 Linux/macOS 打包兼容。**

原因如下：

1. 历史实现是比较基准，不是永远正确的规范；原版就缺完整 Linux Desktop 链路，也有 CLI 路径和文档漂移。
2. 文件内容不同不必然是错误。新增品牌、8 专家和 Host ready 修复是已经接受的产品资产，不能为了与原版相同而回退。
3. 同一个公共脚本没有改，也可能收到不同的新输入。反之，新增 Windows 平台判断也不能证明其他共享分支没有变化。
4. 符号链接、权限、签名和原生依赖需要对应行为证据。字符串/path 模拟不能代替真实目标系统；Windows 成功也不能代替 macOS 成功。

从第一性原理看，最终必须保持的是“正确版本和功能输入，经保留目标系统所需语义的转换，生成可加载且可验证的制品”。因此比对单位应是**输入→转换→输出→验收契约**，不能只按文件名或反斜杠分类。

## 2. 本轮固定的输入与范围

- 原版：`e94c99d5f9e143fb67fec84a74978eb8218daf32`，来自已校验 ZIP；r111 的 57 文件参考快照保持不变。
- 当前：分支 `codex/full-build-validation-20261116`；HEAD `aee688b755bb03747ebc6e5227768285bfa80d0e` **加当前未提交修改**。只给 HEAD 不足以重现本次输入，所以同时保存文件 SHA-256。
- 选定 75 个相关路径：原版 57 文件加 r110 已识别变化路径的并集；46 未变、17 修改、12 新增、0 删除。它不是 r110 的 135 路径全量复查，更不是全仓兼容性认证。
- 原始比较及逐文件 diff：[comparison.json](../.runs/r112-current-platform-contract-audit-20261117-001/comparison.json)。本轮没有执行构建、GUI、依赖安装或外部写入。

## 3. P01—P20 原版契约逐项对照

“保留”只表示所检查源码契约仍在；“冲突”表示已有明确静态反例；“风险”表示条件/影响尚需验证；“缺口”表示原版已有能力不足，不能算新增回归。

| ID | 当前源码相对原版 | 判断和最小后续证据 |
| --- | --- | --- |
| P01 版本/来源 | upstream、官方来源/提取脚本未变，rc.5 npm 与 Intel rc.4 工具仍分开 | 保留；实际制品继续核对 provenance，不能只看源码锁 |
| P02 共享产品 | 共用包/Profile 架构保留；新增品牌和专家资产不属于 OS 分叉 | 保留；保护已经接受的产品功能，禁止全仓回退 |
| P03 支持范围 | Linux 阻断和 win/mac 原生入口仍在 | 原版缺口未消除；Linux 无头回归与“新增 Linux Desktop”分开决策 |
| P04 主机/目标架构 | runtime-architecture 与原版相同；macOS 目标覆盖保留 | 保留；跨主机路径测试仍要独立处理，不能仅依赖这一函数 |
| P05 相对文件 symlink | 新 staging 和 materializer 都拒绝文件 symlink；原版明确测试保留 python3→python3.12 | 确定的契约冲突；用原版相对链接夹具验证，再在 macOS 资源上验收。未称本轮 macOS 已复现 |
| P06 缓存/复制 | 官方缓存逻辑未变；新增两次运行树派生及遍历 | 转换成本和输入语义改变；应逐阶段判断必要性，而非全部禁止复制 |
| P07 输入/可写空间 | local-runtime.ts 未变，原版只读安装/可写增量边界保留 | 保留；不把用户空间隔离解释成必须物化整棵输入树 |
| P08 路径规则 | 生产包入口使用 host path.join；Windows 测试新增 3 处固定反斜杠 expected | 确定的跨主机测试问题；用主机 path 形成独立期望，不复制整套测试 |
| P09 Shell/PATH | 根 release 的 corepack.cmd 分支、command、PATH 等原有逻辑保留 | 所查契约保留；新步骤不能绕过既有环境/退出码纪律 |
| P10 Resources | 新 builder config 保持 `to: workdsh-runtime`，只替换 `from` | 逻辑路径意图保留；必须核对实际资源闭包及构建机路径不泄入产物 |
| P11 macOS 签名 | release-mac 新增 custom config；签名门禁与 afterPack Node 签名仍在 | 风险来自新文件树/输入；不能凭签名脚本未改认定通过，需原生 smoke/正式发布签名分层 |
| P12 NSIS | 原版 app-builder-lib patch 未变 | 非原子替换和长路径行为为继承策略；不是本轮 Windows 修复引入 |
| P13 依赖收集 | 根 patch 与 electron-builder-environment 未变；入口仍设置 traversal only | 保留；实际物化额外遍历不等于替代 builder 依赖收集 |
| P14 进程清理 | owned-process、official-command 未变 | 原有 Windows/POSIX 差异保留；本轮不操作运行中进程 |
| P15 GUI 生命周期 | workdsh-main 变化主要为品牌/ready 处理，原 mac 菜单和退出条件仍在 | 保留目标行为；共享启动修复不是 Windows 专属内容 |
| P16 验收分层 | 新增显示回执/制品哈希检查；Windows r109 有历史通过，mac/Linux 本轮没有结果 | 证据分层保留；源码测试、staging UI 与 packaged runtime 不可互换 |
| P17 图标 | 新品牌输入生成器接在原 Windows/mac/tray 派生器之前，原平台派生器未变 | 共享品牌＋平台格式方向合理；目标系统原生显示仍需各自验收 |
| P18 新公共阶段 | dev/package:dir/dist:win/dist:mac 与根 release 均接入 staging/materialization；custom config 同时强制两回执 | macOS 确实受到新增 Windows 文件树假设影响；不能只修 package-win 测试 |
| P19 原版局限 | command-cli 非 Windows 默认仍指向 macOS Library 路径，README 部分旧描述未变 | 继承缺口；若要支持 Linux Desktop 则需另立范围 |
| P20 历史残留 | 本轮所查旧 Web desktop patch/脚本未变，标准入口仍不引用 | 不恢复旧源码打包路线；只比较实际可达生产者/消费者 |

主要源码：[package scripts](../apps/desktop/package.json#L39)、[根 release 新阶段](../scripts/package-desktop-release.mjs#L90)、[staging 链接分支](../apps/desktop/scripts/prepare-workdsh-display-staging.mjs#L53)、[materializer 链接分支](../apps/desktop/scripts/materialize-workdsh-display-runtime.mjs#L55)、[Windows 测试](../apps/desktop/tests/package-win.spec.ts)、[macOS 入口](../apps/desktop/scripts/package-mac.ts#L125)、[签名入口](../apps/desktop/scripts/release-mac.ts#L98)、[builder config](../apps/desktop/scripts/electron-builder-config.mjs)。逐文件原版/当前身份以比较 JSON 为准。

## 4. 比对后需要优先处理的公共行为

### 4.1 文件链接及大小写是语义问题

除了确定的文件 symlink 契约冲突，新 staging、materializer、receipt verifier 和实际显示验真器还使用无条件 `.toLowerCase()` 进行路径边界或环检测。在大小写敏感文件系统上，它可能把不同目录合并判断，不能仅以操作系统名称决定大小写规则；macOS 也不能被笼统视为始终大小写不敏感。

本轮只确认这种无条件归一化确实存在；未声称已经复现路径越界或某 macOS 设备失败。后续需用区分大小写的最小目录夹具验证 containment/环检测，再选适配方式。

### 4.2 hardlink 修复尚不等于平台影响被隔离

`isWindowsHardlinkLimit()` 确有 win32 判断；但失败后的额外 lstat、`COPYFILE_EXCL` 以及回执来源/重复项校验在共享流程中。后续需要明确哪些属于必要的公共完整性约束，哪些只是 Windows 上限故障的补救；不能用一句“只有 Windows 分支会触发”覆盖整批改动。

同时，上限退路只加入 materializer，staging 仍只认 EPERM 退路。是否需扩大处理，应以真实失败与精确夹具为依据，不能顺手扩成平台文件系统框架。

### 4.3 运行时选择和路径约束需明确

start 按 materialized→staging→source 选择；builder config 必须同时验证 staging 和 materialized，不使用相同回退。staging/materializer 还把输出限制在仓库 `.runs`，而测试目录规则与旧显示批次存在边界差异。后续需在设计中明确生产者、有效期、指针/输入身份和允许输出路径，不应通过临时换环境变量掩盖约束。

上述点见[Windows 地图第 4—5 节](2026-11-17-current-windows-packaging-map.md)。没有必要现在就引入通用锁、generation、缓存管理平台或大范围目录迁移。

## 5. 对 macOS 与 Linux 分别做判断

**macOS：已有足够静态证据说明需要调整新增转换策略。** 精确范围首先是相对文件 symlink 契约和路径大小写判断，以及公共入口是否应强制无链接物化。不能直接跳过显示补丁，否则又丢失已接受的品牌；也不能照搬 Windows 正规文件树作为所有平台唯一输出要求。调整后的最低后续证据是对应夹具和原生 unsigned DMG/资源/Host smoke；正式发布再要求签名、公证及实际 UI 验收。

**Linux：当前应先保护原版已有无头检查/Web 能力。** 3 处路径测试会影响 POSIX 主机测试，应修正；大小写语义也值得精确夹具验证。但没有理由为了“保持原版 Linux Desktop 打包”去实现一条原版不存在的链路。若要求 Linux Desktop，则归档来源、二进制/原生依赖、安装形式和验收需作为新增产品能力决定，不能混进本次兼容修复。

## 6. 推荐的后续最小决策顺序

1. **先约定验收目标。** 当前兼容工作限定 Windows/macOS Desktop 与 Linux 无头/Web 回归；Linux Desktop 新增支持不默认纳入。
2. **保护共同结果。** rc.5 对齐、品牌、8 专家、完整原生 Conversation 和启动修复保持；文件系统策略允许不同，功能验收标准不降低。
3. **先测确定反例。** 路径 expected、相对文件 symlink、区分大小写 containment/环判断；不从全量安装包开始找一个字符串问题。
4. **再决定最小适配。** 优先沿用现有 package-win/package-mac 入口。只在确定存在不同契约的转换操作上选择平台策略；Windows/其他平台各一套整个源码文件不是默认答案。
5. **按层验证。** 聚焦夹具→公共门禁→相应平台实际资源/unsigned 制品→实际 UI；正式发布才增加相应签名/安装升级要求。每层只声称自己证明的事。

这是一份供后续设计使用的决策依据，不是已获批实现批次。待实施范围见[更新后的兼容方案入口](2026-11-17-cross-platform-build-plan.md)。若进入源码修改，仍需登记新版 DESIGN/PLAN、allowlist、验收、回滚和输入快照，并完成规定的 Astra/high 审核及 Terra/high 实施。

## 7. 本轮交付与边界

本轮形成当前 Windows 地图和 P01—P20 契约对照；保存 75 路径输入哈希、必要 diff 及有限路径观察；维护总目录和设计/计划入口。没有复制整个运行时、修改产品源码、启动构建或操作当前窗口。本轮校验回执：[validation.json](../.runs/r112-current-platform-contract-audit-20261117-001/validation.json)。
