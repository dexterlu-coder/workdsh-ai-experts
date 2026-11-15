# WorkDSH 调研、经验与证据总目录

最后更新：2026-11-15 09:08（Asia/Shanghai）  
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

| 报告/笔记 | 日期 | 材料性质 | 重点 |
| --- | --- | --- | --- |
| [`2026-11-14-electron-temporary-environment-first-principles.md`](2026-11-14-electron-temporary-environment-first-principles.md) | 2026-11-14 | 第一性原理分析、实验结果 | 解释临时环境与当前源码启动差异、ACL、Electron 沙箱和运行时配对 |
| [`evidence/startup-methodology-20261115.md`](evidence/startup-methodology-20261115.md) | 2026-11-15 | 经验总结、操作协议 | 启动分层、错误分诊、单变量实验、窗口/Host/退出验收 |
| [`2026-11-15-expert-prepack-research.md`](2026-11-15-expert-prepack-research.md) | 2026-11-15 | 源码事实、官方资料核对 | 预制专家链路、Skill 依赖、MCP/连接器边界和打包路径 |
| [`expert-prepack-PROMPT_SPEC.md`](expert-prepack-PROMPT_SPEC.md) | 2026-11-15 | 待实施规格模板 | 新增预制专家必须提供的名称、职责、输入、输出和能力依赖 |
| [`2026-11-15-ai-learning-coach-integration-audit.md`](2026-11-15-ai-learning-coach-integration-audit.md) | 2026-11-15 | 源码事实、隔离实验、发布门 | 内置目录、官方 provider 兼容性和许可证阻塞证据 |
| [`2026-11-15-eight-skill-expert-mapping.md`](2026-11-15-eight-skill-expert-mapping.md) | 2026-11-15 | 产品映射登记、历史规范整理 | 8 个 Skill 对应的 expert ID、中文入口、命名决策和实施边界 |
| [`2026-11-15-training-course-expert-snapshot-audit.md`](2026-11-15-training-course-expert-snapshot-audit.md) | 2026-11-15 | 源码校验、历史快照对比 | 历史专家包结构校验结果、Skill 内容漂移和重新生成决定 |
| [`2026-11-15-training-course-expert-pre-release.md`](2026-11-15-training-course-expert-pre-release.md) | 2026-11-15 | 实施回执、预发布验收 | 培训课程设计专家快照、当前源码接入、预发布包和测试边界 |

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

每次新增材料完成前检查：

1. 路径是否存在，链接是否可打开；
2. 是否标明日期、批次或关联 `runId`；
3. 是否区分官方声明、源码事实、实验结果和推测；
4. 是否把凭据、Token、Cookie、用户正文和临时 URL 排除在长期文档外；
5. 是否在本文件同一变更中新增了引用；
6. 删除或改名材料时，是否同步移除或修正旧链接。

