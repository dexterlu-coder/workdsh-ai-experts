# 移除首启“预览版说明”提示

批次：`r64-remove-preview-onboarding-20261115-001`  
状态：`implemented / build-passed / clean-personal-ui-verified`

## 基线结论

用户提供的截图显示启动后出现官方 DSH 的“预览版说明”卡片。只读审计在当前仓库的 Desktop、Bundle、UI 和 Profile 源码中没有找到该文案或首启状态实现；官方验收脚本仅按 `继续`、`稍后配置` 等按钮名关闭它。历史运行副本中发现 `workdsh-bundle/dist/client/harness/welcome-brand.js`，它通过 `settings.onboarding` 插槽定位 `welcome-notice`，说明该提示属于官方 DSH UI，旧 WorkDSH 运行副本曾对文案做过品牌替换。

材料性质：源码事实、历史运行副本证据和只读审计结果；没有把官方包内部未公开实现猜成源码事实。

## 允许的实现

当前用户授权的最小变更是：在 WorkDSH 自有 `packages/bundle/src/client/harness/client.ts` 中使用公开 `settings.onboarding` 插槽，按 `welcome-notice` 稳定 ID 注册空组件，抑制这一张首启说明卡片。该变更不修改官方包、不复制官方控件、不改变模型配置和首启设置存储。

## 验收与回滚

验证必须覆盖干净个人 Profile 首次启动、当前已配置 Profile 重启、主界面与原生 Conversation、模型设置、专家/技能/连接器入口、Host ready 和进程存活。若提示仍出现或出现新的启动异常，保留原始日志并以新 runId 分诊。回滚只移除该 suppression 实现，恢复本批次前的 WorkDSH bundle 构建产物。

## 实施回执

- 源码提交：`236bf76f4f106db1c373f6562d8de87d7264f783`；Bundle 类型检查和构建通过。
- 发布候选：`.runs/r64-remove-preview-onboarding-20261115-001/standard-release-1/release-manifest.json`，`sourceDirty=false`，官方 DSH `0.2.1-rc.5`。
- 运行时：`r70-remove-preview-onboarding-fresh-home-20261115-001`；使用历史成功 DACL 根 `D:\project\codex\workdsh\r63-seven-expert-run` 下的全新 DSH Home，避免旧 Profile 状态和用户凭据影响首启验证。
- UI：窗口标题 `WorkDSH`；主界面 URL `http://127.0.0.1:3080/?workdsh-view=conversation`；主界面没有“预览版说明”弹窗，原生 Conversation、侧栏和“专家·技能·连接器”入口可见。
- 专家入口：目录显示 11 个专家，其中 8 个预制 Skill 专家与 3 个原始专家均可见；运行时生成清单仍为 8 个预制包。
- 说明：主界面保留官方静态“预览版”徽章；本批次移除的是启动时遮挡界面的说明弹窗。此前个人 Home 中的 `.credentials.yaml` 未读取、未修改、未复制。
- 原始分诊证据：r64/r65 的 Windows rename EPERM、r67 的工作区 DACL 拒绝、r68 的 `D:AI` 继承差异和 r69 的受保护目录对照均保存在对应 `.runs` 目录。
