# 受控复用：品牌界面与八个预置专家验收（r86）

- 日期：2026-11-16
- runId：`r86-controlled-reuse-ui-experts-20261116-001`
- 性质：实验结果、源码事实、受控复用验收证据
- 结论：`passed / controlled-reuse-ui-accepted`

## 目标

在不进行完整 Desktop/DSH 全量重建的前提下，把当前源码已经验收的品牌界面产物，与此前已经通过验收的八个预置专家运行时资产放到同一个隔离个人模式运行中，确认两类改动可以同时工作。

## 采用的受控复用方案

1. 复用当前已经能够启动的 Electron、官方 DSH `0.2.1-rc.5` runtime、Profile、Host 和当前源码生成的自有 Bundle/UI 产物。
2. 只将历史 r63 发布包中的 `workdsh-plugin-experts` 解包覆盖到运行时对应的自有插件目录；没有重新复制或重建官方 DSH runtime。
3. 使用新的隔离运行根目录，隔离 `DSH_HOME`、`DSH_AGENTS_HOME`、Desktop user-data、临时目录、AppData 和日志。
4. 保留原始运行时专家目录备份于 `.runs/r85-old-experts-package`，以便回滚。

## 输入与哈希

| 项目 | 事实 |
| --- | --- |
| 源码提交 | `2dc6a100d2d16284c981e8a545b87d63f08b16dc` |
| 历史专家发布包 | `r63-seven-expert-runtime-retry-20261115-001/standard-release-3/workdsh-plugin-experts-0.1.0-alpha.9-4061c7247d22feb1.tgz` |
| 历史专家包 SHA-256 | `4061C7247D22FEB196039A82D5F0EE46E855BD87461354829CDA7750C48562E8` |
| 历史专家包大小 | `623928` bytes |
| 当前运行时专家 `package.json` SHA-256 | `6D51AD121A52E2F46547659E4B557D379750922701C6A66E7D093D3D38C8BE9B` |
| 当前运行时 `expert-packages.json` SHA-256 | `F1FD15371BB891146259A1819AB2C03A968BDE455BFB3BAF75FF051B9544F9DF` |
| manifest 专家数 | `8` |
| 当前自有 Bundle client 产物 | `86DF93E0400F4D1329E5E6114B4E9EB1C27789DF949750620934D6D863349192` |
| 当前自有 UI index 产物 | `37B6930BD36F988570C039AAAE2783C017F18E15E1615B771BD44184F639A0E5` |

八个 manifest ID：

`training-course-designer-expert`、`ai-learning-coach-expert`、`business-operations-analysis-expert`、`enterprise-knowledge-extraction-assistant-expert`、`exam-evaluator-expert`、`idp-development-plan-generator-expert`、`llm-wiki-expert`、`training-needs-diagnosis-expert`。

## 实际验收

- Electron 窗口标题为“AI专家办事大厅”，左侧品牌图标和文字可见。
- 主界面正常进入，Host 输出 `[workdsh:probe] activated`，并提供 `http://127.0.0.1:3080/`。
- 专家入口打开后，无障碍树列出上述 8 个预置专家，另外列出 3 个原始专家；因此当前入口共显示 11 个专家。
- 截图观察到专家列表、品牌标题和主界面同时存在；列表滚动区域的无障碍结果补齐了截图底部未完全显示的条目。
- 进程仍存活：launcher PID `33304`，Electron PID `34176`；端口 3080 检查为 `True`。
- 运行时包目录中仅替换了 WorkDSH 自有专家包；本次没有修改官方 DSH 源码、Electron、Host、Agent、模型调用或会话存储。

## 证据位置

- 稳定回执：[`.runs/r86-controlled-reuse-ui-experts-20261116-001/final-receipt.json`](../.runs/r86-controlled-reuse-ui-experts-20261116-001/final-receipt.json)
- 运行脚本与日志位于项目根目录同级的 `D:\project\codex\workdsh\r86-controlled-reuse-ui-experts-20261116-001`；该目录按项目规则作为一次性测试副本保存。
- 旧专家包回滚副本：[`.runs/r85-old-experts-package`](../.runs/r85-old-experts-package)

## 限定与后续

这次验收证明“已验收的当前 UI 产物 + 已验收的八专家发布包”可以在同一受控运行中共存；它不等价于从干净源码、空缓存和全新依赖开始的可复现全量构建。若进入正式发布或需要证明源码可复现性，应另建新的 runId 做完整构建与发布门禁，不在本次运行上原地扩展。
