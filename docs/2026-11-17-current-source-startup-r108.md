# 当前源码 staging 启动验收（r108）

日期：2026-11-17；性质：本机实验结果；状态：`staging-ui-passed / packaged-pending`。本报告与 [DESIGN](../DESIGN.md)、[PLAN](../PLAN.md) 共同描述当前边界。

## 输入与准备

- 源码输入提交 `aee688b755bb03747ebc6e5227768285bfa80d0e`，分支 `codex/full-build-validation-20261116`。本次运行使用该提交生成的本地 release 归档；`release-manifest.json` SHA-256 `43A10E6AF15B3FC06FAFE283AF68735A561E06FA241C469FFAFB750BD5FB26AE`，专家包 SHA-256 `4061C7247D22FEB196039A82D5F0EE46E855BD87461354829CDA7750C48562E8`。
- r100 官方 Profile 安装退出码 0，验证 DSH `0.2.1-rc.5` 和 6 个默认 WorkDSH 产品插件，见 [安装日志](../.runs/r100-profile-http-20261117-001/prepare.log)。r102 primary 与 command 准备通过；Windows x64 官方 primary `runtime.json` 记录 Desktop `0.2.1-rc.5`、Node `24.21.0`、pnpm `11.28.5`、Python `3.12.14`，payload digest `e2cef445c262ce6e8d28480b5ebecc8b0c54c06bea7183374debfcf02f30eb7d`。
- r103 display staging 回执 SHA-256 `C76F9881D1BB014C1699054C0102AE859B6932338B4D90D94FE821395AA76A7A`，见 [回执](../.runs/r103-display-20261117-001/display-patch-receipt.json)。Electron `43.3.0`；使用标准受保护 DACL、独立 user-data、DSH home、agents 和临时目录。

## 启动实验与实际 UI

r105 在个人入口后出现“启动超时”，未观察到 Host ready；该运行未保存 stdout/stderr，根因不能仅凭现象确定。原始现象和进程状态见 `D:\project\codex\workdsh-ai-experts-runs\r105-staged-ui-20261117-001\failure-triage.txt`。r99 已证实本机 pnpm 的 SOCKS 请求失败、同端口 HTTP 请求成功，见 [网络诊断](2026-11-17-profile-network-diagnosis.md)。r108 使用 HTTP 代理和无凭据 npm 配置，并逐行省略含敏感字段或 URL 的日志；随后实际进入主界面。这支持网络配置是一个可验证因素，但不单独证明 r105 的根因。

r108 的实际窗口显示“AI专家办事大厅”、完整原生 Conversation 和 Composer。专家中心无障碍树显示 11 名专家：8 名预置专家及 3 名原始专家。窗口 ID `3475912` 保留在专家列表供审核；主代理也独立复核了窗口及列表。详细非敏感事实见 `D:\project\codex\workdsh-ai-experts-runs\r108-staged-ui-20261117-001\ui-receipt.txt`；截图与无障碍树在本任务计算机操作记录中。日志省略了含 URL 的 Host ready 行，主界面加载证明 Web boot，不补称该行已留存。

完整源码检查 r109 退出码 0，[日志](../.runs/r109-final-check-20261117-001/check.log)。最终 Electron PID 3504、Host 子进程和 3080 端口存活的非敏感回执保存于 `D:\project\codex\workdsh-ai-experts-runs\r108-staged-ui-20261117-001\final-process-receipt.json`。本报告的 UI 验收针对 staging，不等于物化目录包、packaged runtime、安装包或发布验收；这些仍待独立验证。r104 物化失败与分诊见 [记录](../.runs/r102-runtime-20261117-001/materialize-failure-triage.txt)。r107 长任务主动中止的证据和后续验收范围见 [交接计划](2026-11-17-packaged-validation-handoff.md)。本次没有修改用户原有数据或发布产品；隔离运行和历史证据保留，停止运行时仅清理其自有进程。
