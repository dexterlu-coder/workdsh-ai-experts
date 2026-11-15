# 移除首启“预览版说明”提示

批次：`r64-remove-preview-onboarding-20261115-001`  
状态：`planned`

## 基线结论

用户提供的截图显示启动后出现官方 DSH 的“预览版说明”卡片。只读审计在当前仓库的 Desktop、Bundle、UI 和 Profile 源码中没有找到该文案或首启状态实现；官方验收脚本仅按 `继续`、`稍后配置` 等按钮名关闭它。历史运行副本中发现 `workdsh-bundle/dist/client/harness/welcome-brand.js`，它通过 `settings.onboarding` 插槽定位 `welcome-notice`，说明该提示属于官方 DSH UI，旧 WorkDSH 运行副本曾对文案做过品牌替换。

材料性质：源码事实、历史运行副本证据和只读审计结果；没有把官方包内部未公开实现猜成源码事实。

## 允许的实现

当前用户授权的最小变更是：在 WorkDSH 自有 `packages/bundle/src/client/harness/client.ts` 中使用公开 `settings.onboarding` 插槽，按 `welcome-notice` 稳定 ID 注册空组件，抑制这一张首启说明卡片。该变更不修改官方包、不复制官方控件、不改变模型配置和首启设置存储。

## 验收与回滚

验证必须覆盖干净个人 Profile 首次启动、当前已配置 Profile 重启、主界面与原生 Conversation、模型设置、专家/技能/连接器入口、Host ready 和进程存活。若提示仍出现或出现新的启动异常，保留原始日志并以新 runId 分诊。回滚只移除该 suppression 实现，恢复本批次前的 WorkDSH bundle 构建产物。
