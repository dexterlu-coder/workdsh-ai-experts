# r106 Windows 物化硬链接上限修复

状态：修复已实施、聚焦规则测试通过；r107 主动中止，打包运行时未验收。日期：2026-11-17。

- 源码事实：现有物化器及回执验真器是本次参考。新 fallback 仅在 Windows 的 `UNKNOWN`/`EMLINK`、失败后普通文件链接数至少 1024 且源身份未变化时允许；记录失败时链接数与身份，独占复制并核对长度、SHA-256 和独立 inode。原 `EPERM+nlink>1` 分支保留。
- 实验结果：r106 聚焦测试 2/2 通过，覆盖两种错误、平台、阈值、身份和内容拒绝。输入哈希、变更前脚本快照及测试输出保存在同级 `workdsh-ai-experts-runs/r106-hardlink-limit-20261117-001`。主代理执行的根目录完整检查 r109 通过，日志：[check.log](../.runs/r109-final-check-20261117-001/check.log)。
- 实验结果：r107 复用 r103 staging。长任务复核确认持续推进，但考虑用户当前只要求启动并等待审核，主代理决定中止打包副线；停止时 CPU 498.36 秒，一级 `.pnpm` 目录 628/771。执行会话退出码 -1，未生成 materialized pointer。保留 [停止回执](../.runs/r107-stop-receipt.txt)、[进度复核](../.runs/r107-progress-assessment.txt)、[命令日志](../.runs/r107-materialize-command.log) 和未完成树；不得将此结果视为打包运行时验收。
- 回滚：恢复 r106 保存的两个脚本快照，移除本批新增测试和记录；保留原始运行证据。不得修改 r103 staging、官方文件或 r108 运行状态。
