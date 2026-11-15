# 8 个 Skill 与预置专家映射登记

登记日期：2026-11-15  
批次：`r55-eight-skill-expert-mapping-20261115-001`  
状态：`mapping-recorded / all-eight-integrated-in-r62`

## 一、登记范围

本文件把历史 WorkDSH 规划中的 8 个第三方 Skill 映射为 8 个业务专家入口。它是后续专家定义、快照生成和菜单展示的规范输入之一；本轮只登记映射，不修改专家源码、Skill 源码、运行时或用户数据。

当前进度：8 个 Skill 均已按该映射生成固定资源快照并接入当前专家插件预发布包；`r62-seven-expert-packages-20261115-001` 保存了本轮输入、哈希和验证回执。

许可证状态按用户本轮声明记录为：**已取得许可**。本轮尚未收到许可证原文、授权邮件或可核验文件路径，因此授权凭证仍需在实施批次中归档并计算哈希，不能仅凭本文件替代再分发证据。

## 二、规范映射

| 顺序 | 稳定 expert ID | 规范 Skill slug | 原始 ZIP | 预置专家名称 | 专家职责 |
| ---: | --- | --- | --- | --- | --- |
| 1 | `ai-learning-coach-expert` | `ai-learning-coach` | `ai-learning-coach-1.0.0.zip` | AI学习教练 | 制定学习计划，组织练习、主动回忆、间隔复习并恢复学习进度 |
| 2 | `business-operations-analysis-expert` | `business-operations-analysis` | `business-operations-analysis-1.0.1.zip` | 经营数据分析 | 基于授权经营数据生成指标、趋势、异常和分析建议 |
| 3 | `enterprise-knowledge-extraction-assistant-expert` | `enterprise-knowledge-extraction-assistant` | `enterprise-knowledge-extraction-assistant-1.0.0.zip` | 企业知识库萃取助手 | 将制度、流程、会议和案例整理为带来源的结构化知识 |
| 4 | `exam-evaluator-expert` | `exam-evaluator` | `exam-evaluator-1.3.1.zip` | 试卷与题库质量评估 | 评估试题结构、质量、难度、覆盖度和规范性 |
| 5 | `idp-development-plan-generator-expert` | `idp-development-plan-generator` | `idp-development-plan-generator-1.0.0.zip` | 个人发展计划生成器 | 根据岗位要求和授权资料生成个人发展行动计划 |
| 6 | `llm-wiki-expert` | `llm-wiki` | `llm-wiki-1.0.1.zip` | 个人知识库管理 | 建立、查询、维护结构化知识库并保留来源关联 |
| 7 | `training-course-designer-expert` | `training-course-designer` | `training-course-designer-1.0.0.zip` | 培训课程设计 | 生成课程蓝图、教学材料、活动和评估材料草稿 |
| 8 | `training-needs-diagnosis-expert` | `training-needs-diagnosis` | `training-needs-diagnosistraining-needs-analysistraining-needs-survey-1.0.0.zip` | 培训需求诊断 | 分析能力差距、培训优先级、AI 切入点和实施路线 |

## 三、命名决策

- 经营入口采用历史 MVP 计划和候选生成快照中的规范名称“经营数据分析”；早期可行性评估中的“经营分析专家”作为历史别名保留，不再作为新的显示名。
- 企业知识入口采用候选生成快照中的“企业知识库萃取助手”；“企业知识萃取专家”是早期设计稿名称。
- `training-needs-diagnosis` 是历史规范化 Skill slug；当前原始 SkillHub ZIP 的 slug 是 `training-needs-diagnosistraining-needs-analysistraining-needs-survey`。实施时必须在 manifest 中同时保存 `canonicalSlug`、`sourceSlug`、ZIP SHA-256 和内容摘要，不能靠字符串猜测映射。
- 英文 slug 和 expert ID 是机器追溯字段；用户界面只显示中文名称、中文说明和就绪状态。

## 四、来源与证据

### 历史规划

- `D:\project\codex\DeepSeek harness usage\docs\WorkDSH-AI专家办事大厅-MVP产品批次实施计划-2026-11-10.md`：8 个 expert ID、Skill 和中文入口的 MVP 规范表。
- `D:\project\codex\DeepSeek harness usage\docs\WorkDSH-已整合Skill专家Agent可行性评估-2026-11-09.md`：8 个 Skill 的产品职责映射和专家化边界。
- `D:\project\codex\DeepSeek harness usage\docs\WorkDSH-专家快捷入口与界面统一-续作实施计划-P3R-P8-2026-11-09.md`：要求以专家清单作为唯一映射源的后续规划。

### 历史生成快照

候选仓库的 `packages/plugins/experts/resources/generated/expert-packages.json` 已生成 8 个包，`schemaVersion=1`、`buildVersion=workdsh-expert-snapshot/1`，每项包含 `expertId`、`skillSlug`、`sourceDigest`、`snapshotDigest`、资源闭包和专家包文档。该文件属于历史候选仓库，不是当前项目已经接入的产物。

### 当前归档

- 原始 ZIP 和哈希：[references/skillhub/packages/2026-11-06/README.md](../references/skillhub/packages/2026-11-06/README.md)
- 原始下载清单：[download-manifest.json](../references/skillhub/packages/2026-11-06/download-manifest.json)
- 当前项目中的 AI Learning Coach 兼容性与许可证审计：[2026-11-15-ai-learning-coach-integration-audit.md](2026-11-15-ai-learning-coach-integration-audit.md)

## 五、实施前必须保留的边界

1. 每个专家必须绑定对应 Skill 的固定内容快照，记录 `sourceDigest`、`snapshotDigest` 和资源闭包。
2. Skill 缺失、快照损坏、内容漂移或依赖未就绪时，专家显示未就绪并禁止召唤。
3. 原始 Skill 正文仍只有一个来源；专家只补充角色、边界、输入、交付物和启动示例，不复制第二份可独立演化的 Skill 正文。
4. Python、Marp、QMD 等脚本或外部工具依赖必须单独登记，不因专家映射成立就自动安装。
5. 授权凭证归档前，不能把“用户已取得许可”写成已完成的产品发布验收结论。

