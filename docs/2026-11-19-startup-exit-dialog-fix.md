# Windows 进入与退出错误弹窗修复

日期：2026-11-19；性质：设计、实施与验收工作包。分支 `codex/startup-exit-dialog-fixes-20261119`，基线为本次分支起点。目标是修复错误触发和生命周期故障，不是隐藏真实启动/权限/清理错误。

## 冻结范围与源码假设

参考：r108 成功启动报告、启动历史门禁、现有 connection-lifecycle 与 owned-process-windows 测试。

源码发现：Host ready 后90秒计时器仍存在；启动取消只看 quitting 而忽略 quitRequested；退出回调在异步 cleanup 后只看全局 switching，可能在转换已完成时弹出旧进程的错误；child error/exit/timeout 可能重复报告；stopRuntime 的清理 promise 没有 catch。以上是待回归测试确认的假设，不是已复现根因。

允许：`apps/desktop/src/workdsh-main.ts`、`apps/desktop/src/owned-process.ts`，及 `apps/desktop/tests/connection-lifecycle.spec.ts`、`apps/desktop/tests/owned-process-windows.spec.ts`、必要的独立生命周期回归测试；本报告、DESIGN/PLAN、研究索引及隔离实验脚本/回执。若需新自有生命周期小模块，限 `apps/desktop/src/runtime-lifecycle.ts` 及直接测试，不新增依赖。

禁止：官方 DSH/Electron 字节、Profile/专家/Skill/品牌内容、模型配置、用户旧空间、生产打包策略、依赖和 lockfile、CI；不推送/合并/发布，不删除历史资料或停止用户旧实例。企业身份/撤权/清理的安全语义不能弱化。

方案：按每个 Host 实例记录预期停止/失败是否已报告；错误、退出、超时只处理当前实例且最多报告一次。预期停止在异步清理前登记；退出/取消与 ready 同步，ready/停止及时取消计时器；清理失败仍报告且不误称进程已退出。Windows 进程操作保持 PID/创建时间归属校验，只有复现证明其故障时才改。

## 验收与回滚

按标准实施先 Astra/high 只读审核，再 Terra/high 修正；首写新 runId、输入哈希、allowlist 与精确 pre-snapshot。机器回归覆盖正常启动/退出、启动中退出、延迟 exit、error+exit、ready 后计时器、超时及真实清理失败；现有企业测试保持。聚焦测试、类型检查和完整 check 通过后，复用已验证的官方 runtime/Electron，隔离同级 runs 下可变用户状态，实际进入个人主界面、退出并确认进程，重启后留窗口供用户审核。

测试不复制整棵运行时、不构建安装包。复用 r108 普通 Node wrapper/标准 DACL 路径，只更新当前自有 carrier 构建产物的选择；保存非敏感诊断，凭据/URL token 不落盘。失败分诊换 run，不反复覆盖旧结果。

回滚范围为本批 allowlist 的变更。2026-11-20 用户通过体验验收，授权提交、推送并通过 PR 合入 `main`。

## Astra/high 审查修订

源码纠正：90 秒计时器已有 !ready 守卫，startRuntime 已有两处 quitRequested 检查，不把它们当成已证实根因。确定需测试的是退出期间 ready、取消被外层 catch 误报、旧 loadURL/exit 的异步回调，以及旧企业 verify 失败影响新会话。首个 await 前登记停止意图；回调按 child/window/session 所有者判断；真实加载/认证/清理失败仍须报告，清理失败保留进程引用可重试，超时不能先宣称已停止。Windows owned-process 目前无修改依据，保留不动。允许新增 `apps/desktop/tests/startup-exit-lifecycle.spec.ts` 以隔离回归夹具；修复前失败、修复后通过，再实际验证。审查为 approved-with-changes，范围未扩大。

## 新根因：Windows 清理预算（独立审查批次）

2026-11-19 隔离旧 carrier 实际启动中关闭，出现“暂时无法退出 / Windows 本机进程清理查询超时”。原版每个 PowerShell/CIM 命令最多4秒、总清理12秒；同环境 Node→PowerShell 单次只读查询已测2257毫秒，单轮尚需多个串行查询/身份核对/停止操作。该测量证明预算压力，不证明每次超时都是同一原因。

新增 review/run r119-cleanup-budget-20261119-001，仅允许 owned-process.ts 的 Windows 有界预算常量及 owned-process-windows.spec.ts 对应预算/失败门禁测试；候选单命令10秒、总清理40秒，原8轮/128进程上限、PID代际校验、权限失败拒绝和POSIX时限保持。允许退出等待更久，不允许隐藏清理失败或强杀未知进程。经Astra/high增量审核后Terra实施，再真实退出/进程消失验证。原r118负证据保留，新的UI运行使用保护DACL的新run。

## 最终实现与机器验证

两次 Astra/high 审查分别覆盖生命周期方案和新增 Windows 清理预算，均为 approved-with-changes。Terra/high 实施后主代理核对并补足审查条件：

- Host 预期停止在首个 await 前登记；退出期间的 ready 不再开窗，主动取消不再作为“无法进入”报告。
- loadURL 成功/失败只影响所属的当前窗口；退出期间不重新显示窗口，不因旧加载拒绝误报。
- 企业会话在清理前登记停止意图；停止中/停止后的旧 verify 失败不影响新会话；当前认证失败及远端注销失败仍报告。
- error/exit/timeout 的故障提示去重，预期停止的清理失败由其调用者报告；未知退出的真实清理失败仍提示，保留引用以重试。ready/停止取消启动计时器，超时提示改为“正在尝试停止”，不先声称进程已停止。
- Windows 命令预算10秒、总预算40秒；未更改进程归属、128进程/8轮边界、错误拒绝或 POSIX 行为。

最终仅修改两个生产文件及两个对应测试文件。生命周期回归先在旧代码复现退出期间 ready 多开窗口，修复后验证迟到窗口加载、停止中的验证失败、重复故障、真实清理失败重试等条件。预算测试在旧4秒/12秒下失败，改为10秒/40秒后验证累计15秒完成、单命令10秒失败、总40秒截断，以及真实孤儿进程清理。

主代理在新 r124 统一验证：`corepack yarn check` 退出码0；Vitest 169通过/1跳过，node:test 23通过/1跳过，包含构建、类型和文档/版本门禁。记录：[输入哈希](../.runs/r124-lifecycle-final-validation-20261119-001/inputs.json)、[原始日志](../.runs/r124-lifecycle-final-validation-20261119-001/check.log)、[退出码](../.runs/r124-lifecycle-final-validation-20261119-001/check-exit.json)。

## 实际 Windows 验收及保留窗口

复用已锁定 Electron 43.3.0、rc.5 Profile/primary runtime 和 r103 显示输入，仅重建当前自有 carrier；未复制整套运行时或生成安装包。新同级 runs 使用标准受保护 DACL，隔离 user-data、Home、agents、临时目录。普通 Node wrapper 启动，未调用模型或使用用户 API key。

1. r121 原生个人入口进入完整主界面，无启动错误；Alt+F4 正常退出，Electron exit code0，退出前记录的12个所属进程全部消失，未出现错误弹窗。[退出前](../.runs/r121-lifecycle-ui-20261119-001/normal-exit-before.json)、[退出后](../.runs/r121-lifecycle-ui-20261119-001/normal-exit-after.json)。
2. 再次启动 r125 进入主界面和专家中心，11名专家（8名新增+3名原始）均在。保留窗口ID2430804、Electron PID65604供用户审核，独立空间为 `D:\project\codex\workdsh-ai-experts-runs\r125-startup-cancel-ui-20261119-001`。这是正常运行，未使用下面的延迟适配器。
3. 正常启动太快，首次手动取消尝试时已经就绪，因此未把它算作“启动中取消”。r127 用独立 bootstrap 仅将 Host 启动延迟20秒，保留原始 argv/`--no-open`，导入完全相同的 carrier 构建文件；在可见“正在启动”页 Alt+F4，退出码0，wrapper/根进程退出，按隔离run标识检查没有Node/Electron残留，无错误弹窗。生产代码和审核窗口不使用此适配器。[取消结果](../.runs/r127-delayed-start-cancel-20261119-001/result.json)、[残留检查](../.runs/r127-delayed-start-cancel-20261119-001/tree-final.json)。

UI截图和操作过程保留在本任务计算机记录，脱敏结构回执为 [ui-review.json](../.runs/r124-lifecycle-final-validation-20261119-001/ui-review.json)。企业故障与边界使用回归夹具验证，未登录真实企业后台；不是正式安装包或跨平台验收。

## 失败、过程偏差和回滚材料

- r116/r117/r119/r121/r122 的原始失败与夹具调整保留；最终生命周期回执：[r123](../.runs/r123-startup-exit-regressions-20261119-001/receipt.md)。
- 预算工作者遇进程权限和测试类型错误后误用原run继续，未把该过程当成合规最终验收；主代理新建r124独立复核，所有输入固定且完整检查通过。原记录：[预算回执](../.runs/r119-cleanup-budget-20261119-001/terra-budget-receipt.json)。
- r126 延迟适配器漏传 `--no-open`，导致自动浏览器工作进程和清理超时；保留失败并修正适配器，在新r127验证，未因此继续放大生产预算。[适配器分诊](../.runs/r126-delayed-start-cancel-20261119-001/triage.json)。
- 旧版 r118 已实际复现清理超时；它的首次实验目录继承权限未受保护，不当作最终标准DACL门禁成功。r121/r125/r127使用新受保护目录。旧隔离失败树经父PID及可执行路径核对后单独清理，用户旧实例未操作。

原始回滚输入分别位于 r116/before（主生命周期）与 r119/before（Windows 预算）。合并后如需回滚，通过 PR 撤销对应提交，保留后续变更。
