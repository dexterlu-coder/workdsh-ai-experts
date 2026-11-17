# Desktop 安装包验收后续计划

日期：2026-11-17；性质：后续计划；状态：`not-started / awaiting-user-decision`。

## 当前已完成

当前源码的 Desktop 和 Web/WorkDSH 包已构建，官方 rc.5 Profile 已重新安装并通过组合检查，r108 实际进入个人主界面，8 个新增专家与 3 个原始专家同时可见；r109 完整无头检查通过。证据见 [r108 验收](2026-11-17-current-source-startup-r108.md) 和 [网络诊断](2026-11-17-profile-network-diagnosis.md)。Electron PID 3504、Host 子进程及 3080 端口在最终进程回执中仍存活；回执位于 `D:\project\codex\workdsh-ai-experts-runs\r108-staged-ui-20261117-001\final-process-receipt.json`。

## 未完成边界

r107 materialization 在超过 20 分钟后仍有持续 I/O，进度约为 400/771 个物理依赖目录，后续仍包含 Junction 展开与完整结构验真，预计额外半小时以上有明显可能。按时间必要性复核，用户最新目标是运行界面供审核，因此主动中止这条打包副线，保留不完整输出及负证据。没有把 staging UI 成功称为 packaged-runtime 成功。硬链接上限修复与针对测试保留在验证分支，尚未完成实际物化验收。

## 以后明确启动本计划时

1. 复核验证分支、dirty 所有权、r103 输入哈希和官方锁定版本；选择允许的可回滚输出路径，不覆盖 r108 用户数据。
2. 先评估 Junction 展开的文件数量、预计耗时和最小充分证据，避免再次无上限等待；若需改变物化策略，按独立工作包完成设计与审核。
3. 用新 run 完成 materialization 及独立 verifier，核对新 hardlink-limit fallback 的错误码、失败时 nlink、源/目标身份、SHA-256、集合闭包和无 reparse 结构。
4. 生成 unsigned Desktop 目录包并核对资源闭包、官方版本、8 专家资源和品牌资产；不发布、不打 tag。
5. 使用打包后的可执行文件与全新隔离用户数据，验收入口、个人模式、Host、主界面、8 专家、退出和重启；保存实际进程与 UI 回执。

成功标准：以上机器门禁全部通过，真实 packaged runtime 显示品牌和全部新增专家，用户随后判断界面体验。回滚仅撤销该计划产生的指针、生成目录和受控代码修改；保留历史证据及当前已运行窗口。
