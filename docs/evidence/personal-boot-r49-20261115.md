# Personal mode boot evidence — r49

日期：2026-11-15（Asia/Shanghai）
runId：`r49-personal-final-20261115-001`

## 结果

使用全新标准权限 Home 启动 `D:\project\codex\workdsh-ai-experts` 原始 Desktop carrier，选择“个人使用”后进入真实 WorkDSH 主界面。UIA 可见：会话列表、Composer、专家 · 技能 · 连接器、项目、工作台、资料库、插件和自动化任务入口。

Host 回执：`[workdsh:probe] activated`、`dsh web: http://127.0.0.1:64027/?token=[redacted]`。token 未写入证据。

## 源码修复

- `packages/plugins/experts/src/client/PresetMenu.tsx`：slot 回调执行前确认 Fiber active；注册竞态只忽略 Cordis `INACTIVE_EFFECT`。
- `apps/desktop/src/workdsh-main.ts`：Host ready URL 同时从 stdout 和 stderr 解析。
- 构建产物：experts bundle SHA-256 `D70FD049B7810A661B703BD76FF4D35932FC34A97F382B24ABE27DA97C48012E`，已写入本地验证 Profile；Desktop carrier 已重新 build。

## 验证

- experts typecheck：通过。
- Desktop typecheck：通过。
- Desktop build：通过。
- 真实 Electron/UI 验收：通过。
- Desktop 单元测试：沙箱重跑后被缺失 Electron 下载阻塞（`fetch failed` / `Electron failed to install correctly`），不是测试断言失败。

## 过程证据

- `r45` CDP 栈：`INACTIVE_EFFECT` 来源于 experts 的异步 `installExpertPresetMenu()` slot 注册。
- `r47` 跳过预设包装：主界面可见，证明第一处假设。
- `r48`：Host ready 出现在 stderr，证明 Desktop stdout-only parser 的第二处故障。
- `r49`：两处源码修复后的最终个人模式主界面验收。
