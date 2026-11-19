# WorkDSH 调研、经验与证据总目录

最后更新：2026-11-19（Asia/Shanghai）
维护规则：本目录由 [`AGENTS.md`](../AGENTS.md) 约束；新增、改名或删除调研报告、经验笔记、架构决策和稳定证据时，必须在同一变更中更新本文件。

本文件是“去哪里找结论”的总入口，不替代各报告正文，也不把 `.runs` 下的一次性原始回执复制进长期文档。每条记录尽量标明材料性质：**官方声明、项目设计、源码事实、实验结果、推测/待验证**。

## 1. 当前项目入口

| 材料 | 性质 | 用途 |
| --- | --- | --- |
| [`../DESIGN.md`](../DESIGN.md) | 项目设计 | 架构目标、边界、长期约束和当前状态 |
| [`../PLAN.md`](../PLAN.md) | 实施计划/验收 | 批次、命令、验收、证据和回滚 |
| [`../AGENTS.md`](../AGENTS.md) | 仓库规则 | 工作范围、证据纪律和本目录维护要求 |
| [`README.md`](README.md) | 文档入口 | 文档体系和中英文入口 |

## 2. 调研报告与方法论

生命周期修复：[Windows 进入与退出错误弹窗](2026-11-19-startup-exit-dialog-fix.md)（2026-11-19；设计、源码事实、回归和 UI 验收记录；r116—r127；修复回调竞态和有界清理预算，记录完整检查、正常退出/慢启动取消及保留的11专家审核窗口）。

合并工作包：[当前构建验证分支合并 main](2026-11-17-main-merge-plan.md)（2026-11-17；用户授权、范围与合并验收记录；r113 审核 / r114 实施；排除本机材料，登记必要测试修正、只读审核和 PR/默认分支验证边界）。

当前平台调查：[原版契约与当前源码逐项对照](2026-11-17-current-platform-contract-comparison.md)及[当前 Windows 打包流程、路径与复用地图](2026-11-17-current-windows-packaging-map.md)（2026-11-17；源码事实、静态推导、本机有限路径观察与待决策建议；r112；固定 75 路径 dirty 输入、对照 P01—P20，区分 macOS 转换契约冲突、Linux 既有缺口和 Windows 复用/物化/验收边界）。

原版平台基准：[二次开发前三平台差异处理详细报告](2026-11-17-original-three-platform-baseline.md)及[57 文件源码参考快照](../references/original-platform-baseline-e94c99d5/README.md)（2026-11-17；来源校验、原版源码事实与静态推导；r111；固定 e94c99d5 的 Windows/macOS/Linux 支持范围、路径/链接/资源/签名/进程/CI 契约和 P01—P20 后续比对项，保留原版已有局限）。

基线调查：[二次开发前与当前版本的平台差异](2026-11-17-original-baseline-platform-comparison.md)（2026-11-17；来源核对、源码事实和待决策架构建议；r110；确认原始 ZIP 提交及路径/公共物化/POSIX 链接差异，界定平台拆分范围）。

待实施方案：[跨平台构建兼容方案](2026-11-17-cross-platform-build-plan.md)（2026-11-17；源码事实与架构建议；关联 r90/r106/r109；修复路径测试假设、限制 Windows 修复影响并复用原生平台 CI）。

本轮总报告：[当前源码构建、安装与启动全过程](2026-11-17-build-process-report.md)（2026-11-17；构建复盘、源码事实与实验结果；r88—r109；解释构建链路、失败处理、实施不足和源码启动/安装包验收边界）。

| 报告/笔记 | 日期 | 材料性质 | 重点 |
| --- | --- | --- | --- |
| [`2026-11-14-electron-temporary-environment-first-principles.md`](2026-11-14-electron-temporary-environment-first-principles.md) | 2026-11-14 | 第一性原理分析、实验结果 | 解释临时环境与当前源码启动差异、ACL、Electron 沙箱和运行时配对 |
| [`evidence/startup-methodology-20261115.md`](evidence/startup-methodology-20261115.md) | 2026-11-15 | 经验总结、操作协议 | 启动分层、错误分诊、单变量实验、窗口/Host/退出验收 |
| [`2026-11-15-startup-history-gate.md`](2026-11-15-startup-history-gate.md) | 2026-11-15 | 经验固化、启动前门禁 | 将历史成功路径固化为 DACL、清洁环境、Node wrapper、分层验收和失败换 run 规则 |
| [`2026-11-15-expert-prepack-research.md`](2026-11-15-expert-prepack-research.md) | 2026-11-15 | 源码事实、官方资料核对 | 预制专家链路、Skill 依赖、MCP/连接器边界和打包路径 |
| [`expert-prepack-PROMPT_SPEC.md`](expert-prepack-PROMPT_SPEC.md) | 2026-11-15 | 待实施规格模板 | 新增预制专家必须提供的名称、职责、输入、输出和能力依赖 |
| [`2026-11-15-ai-learning-coach-integration-audit.md`](2026-11-15-ai-learning-coach-integration-audit.md) | 2026-11-15 | 源码事实、隔离实验、发布门 | 内置目录、官方 provider 兼容性和许可证阻塞证据 |
| [`2026-11-15-eight-skill-expert-mapping.md`](2026-11-15-eight-skill-expert-mapping.md) | 2026-11-15 | 产品映射登记、历史规范整理 | 8 个 Skill 对应的 expert ID、中文入口、命名决策和实施边界 |
| [`2026-11-15-training-course-expert-snapshot-audit.md`](2026-11-15-training-course-expert-snapshot-audit.md) | 2026-11-15 | 源码校验、历史快照对比 | 历史专家包结构校验结果、Skill 内容漂移和重新生成决定 |
| [`2026-11-15-training-course-expert-pre-release.md`](2026-11-15-training-course-expert-pre-release.md) | 2026-11-15 | 实施回执、预发布验收 | 培训课程设计专家快照、当前源码接入、预发布包和测试边界 |
| [`2026-11-15-eight-expert-integration.md`](2026-11-15-eight-expert-integration.md) | 2026-11-15 | 实施回执、构建/测试/UI 验收 | 8 个预制 Skill 专家整合、运行时清单、发布提交和人工验收入口 |
| [`2026-11-15-remove-preview-onboarding.md`](2026-11-15-remove-preview-onboarding.md) | 2026-11-15 | 源码审计、范围登记、实施计划 | 官方首启预览说明的 owner、公开插槽抑制方案和验收/回滚边界 |
| [`2026-11-15-historical-branding-investigation.md`](2026-11-15-historical-branding-investigation.md) | 2026-11-15 | 历史源码事实、官方补丁记录、真实 UI 实验结果 | 分别核对红/黄/蓝三个区域；原生窗口标题和侧栏曾有通过证据，动态网页标题和 Conversation Hero 仍失败 |
| [`2026-11-15-ai-expert-branding-css-plan.md`](2026-11-15-ai-expert-branding-css-plan.md) / [`2026-11-15-ai-expert-branding-css-astra-audit.md`](2026-11-15-ai-expert-branding-css-astra-audit.md) | 2026-11-15 | 实施计划、Astra 审计 | CSS 隐藏官方 Hero 预览徽章；当前因 rc.5 selector、布局保持和 Hero 证据不足而 blocked |
| [`2026-11-15-ai-expert-branding-css-plan-r73.md`](2026-11-15-ai-expert-branding-css-plan-r73.md) / [`2026-11-15-ai-expert-branding-css-astra-audit-r73.md`](2026-11-15-ai-expert-branding-css-astra-audit-r73.md) | 2026-11-15 | 修订计划、Astra 审计 | 固定 rc.5 Hero selector 和 Slot；CSS 隐藏方案获 `approved-with-changes`，等待 Terra preflight |
| [r73 failure triage](../.runs/r73-ai-expert-branding-css-badge-20261115-001/failure-triage.md) | 2026-11-15 | Terra 错误分诊 | 官方运行时 node_modules 写入被自动审查拒绝；自有源码已写入，官方运行时未修改，Run 保持 blocked |
| [`2026-11-15-r74-packaging-lessons.md`](2026-11-15-r74-packaging-lessons.md) | 2026-11-15 | 打包经验归档、错误分诊、架构结论 | 记录 staging/materialized、Junction、只读 pnpm vendor、receipt、图标色值、组合哈希和 packaged Node EPERM；明确当前先做轻量 UI 验证，正式打包后置 |
| [`2026-11-16-resource-isolation-and-minimum-evidence.md`](2026-11-16-resource-isolation-and-minimum-evidence.md) | 2026-11-16 | Astra 只读架构审核、规则落盘决策 | 说明可变状态隔离、稳定输入复用、最小充分证据、长任务停手条件，以及全局规则与 DSH 项目适配的两层结构 |
| [`2026-11-16-ai-expert-branding-r82-ui-acceptance.md`](2026-11-16-ai-expert-branding-r82-ui-acceptance.md) | 2026-11-16 | 实验结果、源码事实、稳定验收证据 | 记录当前源码 r82 个人模式的三处品牌、预览徽章、左上方“新会话”位置和运行时哈希验收 |
| [`2026-11-16-connection-entry-branding-plan.md`](2026-11-16-connection-entry-branding-plan.md) | 2026-11-16 | 项目设计、源码事实、实施计划 | 登记 Desktop 选择使用方式页和个人启动页的品牌 owner、allowlist、禁止范围、验收与回滚 |
| [`2026-11-16-connection-entry-branding-astra-audit.md`](2026-11-16-connection-entry-branding-astra-audit.md) | 2026-11-16 | Astra/high 只读审核、范围决策 | 审核入口页静态品牌方案、共享 header 传播、CSP/协议/转义保持和源码 allowlist，结论为 approved-with-changes |
| [`2026-11-16-connection-entry-branding-r84-ui-acceptance.md`](2026-11-16-connection-entry-branding-r84-ui-acceptance.md) | 2026-11-16 | 实验结果、源码事实、稳定验收证据 | 记录选择使用方式页、个人启动页、主界面回归、r83 失败换 run 和 r84 实际窗口验收 |
| [`2026-11-16-controlled-reuse-ui-expert-acceptance.md`](2026-11-16-controlled-reuse-ui-expert-acceptance.md) | 2026-11-16 | 实验结果、源码事实、稳定验收证据 | r86 受控复用当前品牌 UI 产物与 r63 八专家发布包，在同一隔离个人运行中完成实际窗口和专家入口验收 |
| [`2026-11-17-full-build-validation.md`](2026-11-17-full-build-validation.md) | 2026-11-17 | 完整构建门禁、发布归档、错误分诊 | 分支验证的 check、Web/WorkDSH 归档、Profile 依赖缓存阻塞、自动审查边界和 packaged-runtime 未验收事实 |

## 3. 启动与安装证据

### 3.1 稳定证据索引

| 入口 | 说明 |
| --- | --- |
| [`../references/startup-evidence-20261114/README.md`](../references/startup-evidence-20261114/README.md) | 历史启动回执、事实与边界；不把临时 URL、Token 或凭据当作配置 |
| [`evidence/personal-boot-r49-20261115.md`](evidence/personal-boot-r49-20261115.md) | 当前源码个人模式启动验收 |
| [`evidence/electron-network-sandbox-r61-repro-20261114.txt`](evidence/electron-network-sandbox-r61-repro-20261114.txt) | Electron/Chromium ACL 拒绝的原始复现记录 |
| [`evidence/windows-nsis-ab-methodology.md`](evidence/windows-nsis-ab-methodology.md) | Windows NSIS 解压与暂存替换的 A/B 方法 |
| [`evidence/windows-installer-upgrade-2026-08-25.md`](evidence/windows-installer-upgrade-2026-08-25.md) | 安装器升级、覆盖安装和回归证据 |
| [`evidence/desktop-footprint-2026-09-26.md`](evidence/desktop-footprint-2026-09-26.md) | Desktop 安装包体积与 Windows 安装耗时检查 |

### 3.2 原始运行材料

一次性命令输出、进程树、哈希和回执保存在仓库根目录 `.runs/`。长期文档只引用与结论直接相关的回执，例如：

- [`../.runs/r50-current-source-final-receipt.json`](../.runs/r50-current-source-final-receipt.json)：当前源码最终启动回执；
- [`../.runs/r51-expert-prepack-research-20261115-001/research-receipt.json`](../.runs/r51-expert-prepack-research-20261115-001/research-receipt.json)：预制专家调研回执；
- [`../.runs/r52-doc-index-20261115-001/pre-snapshot.json`](../.runs/r52-doc-index-20261115-001/pre-snapshot.json)：本次目录与规则变更前快照。

其余 `.runs` 目录是历史或临时实验材料，先通过上面的证据索引定位，不把它们全部当作产品结论。

## 4. 架构、边界与产品决策

| 文档 | 主题 |
| --- | --- |
| [`architecture.md`](architecture.md) / [`architecture.en.md`](architecture.en.md) | Desktop 与 WorkDSH 的架构说明 |
| [`desktop-boundaries.md`](desktop-boundaries.md) | Desktop、Web、官方 DSH 和 WorkDSH 的归属边界 |
| [`DESKTOP-PERSONAL-ENTERPRISE.md`](DESKTOP-PERSONAL-ENTERPRISE.md) | 个人版与企业版的身份、存储、权限和插件边界 |
| [`ENTERPRISE-PLUGIN-AUTH.md`](ENTERPRISE-PLUGIN-AUTH.md) | 企业插件认证接入和授权边界 |
| [`plugin-development.md`](plugin-development.md) / [`plugin-development.en.md`](plugin-development.en.md) | 插件开发约束和实现入口 |
| [`plugin-ecosystem.md`](plugin-ecosystem.md) / [`plugin-ecosystem.en.md`](plugin-ecosystem.en.md) | 插件生态、组合和发布原则 |

## 5. 产品与用户参考文档

这些文件主要服务用户或维护者，不等同于实验结论，但仍纳入总目录，避免重复搜索：

| 文档 | 用途 |
| --- | --- |
| [`user-guide.md`](user-guide.md) / [`user-guide.en.md`](user-guide.en.md) | 用户使用说明 |
| [`faq.md`](faq.md) / [`faq.en.md`](faq.en.md) | 常见问题 |
| [`why-desktop.md`](why-desktop.md) / [`why-desktop.en.md`](why-desktop.en.md) | Desktop 产品定位 |
| [`README.md`](README.md) / [`README.en.md`](README.en.md) | 文档导航 |

## 6. 外部参考与主题索引

| 参考索引 | 主题 |
| --- | --- |
| [`../references/startup-evidence-20261114/README.md`](../references/startup-evidence-20261114/README.md) | Electron、Chromium、Windows ACL 启动资料 |
| [`../references/expert-prepack-20261115/README.md`](../references/expert-prepack-20261115/README.md) | Skill、Agent preset、MCP 官方资料和本地源码映射 |
| [`../references/skillhub/README.md`](../references/skillhub/README.md) | 第三方 SkillHub 原始 ZIP 快照、来源清单和许可证/安装边界 |

外部资料必须在对应参考索引中记录来源、日期/版本、采用结论和“不适合照搬”的部分；外部资料不能覆盖 `DESIGN.md`、`PLAN.md` 或 `AGENTS.md` 的冻结边界。

## 7. 维护检查

后续计划：[Desktop 安装包验收后续计划](2026-11-17-packaged-validation-handoff.md)（2026-11-17，r107/r108；区分已通过的源码启动与尚未通过的物化、打包验收，登记下一批目标和验收条件）。

- [Profile 网络诊断](2026-11-17-profile-network-diagnosis.md)：实验结果，2026-11-17，r99/r100；记录 pnpm 代理协议差异和续跑边界。
- [当前源码 staging 启动验收](2026-11-17-current-source-startup-r108.md)：本机实验结果，2026-11-17，r100/r103/r105/r108/r109；记录品牌、专家与 packaged 验收边界。

每次新增材料完成前检查：

1. 路径是否存在，链接是否可打开；
2. 是否标明日期、批次或关联 `runId`；
3. 是否区分官方声明、源码事实、实验结果和推测；
4. 是否把凭据、Token、Cookie、用户正文和临时 URL 排除在长期文档外；
5. 是否在本文件同一变更中新增了引用；
6. 删除或改名材料时，是否同步移除或修正旧链接。


- [r106 硬链接上限修复与 r107 中止证据](2026-11-17-materialize-hardlink-limit-r106.md)：实验结果，2026-11-17，runId r106/r107/r109；记录修复规则、验证和未完成的打包验收。
