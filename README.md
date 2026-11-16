# AI 专家办事大厅

AI 专家办事大厅（WorkDSH）是一个基于 DeepSeek Harness 的开源工作台。它把专家、技能、连接器、项目和资料库放在同一个工作流中，帮助用户把一次对话变成可以持续使用的工作能力。

当前仓库同时包含 Web 与 Desktop 工作区。Desktop 使用 Electron 作为载体，运行官方锁定版本的 DSH Profile；WorkDSH 自有功能通过公开插件和 Profile API 集成。项目保留官方 Conversation、Composer 和右侧面板，品牌层使用项目自己的静态标题与图标，Hero 的“预览版”徽章通过 CSS 隐藏。

## 主要能力

- **专家**：保存可复用的角色、职责和工作方法。
- **技能**：把 `SKILL.md` 与配套资源组织成可安装、可复用的能力包。
- **连接器**：接入本地工具、外部服务和 MCP 能力。
- **项目与资料库**：把任务、文件、计划和能力配置放在同一工作区。
- **个人模式与企业能力**：个人模式开箱可用；企业账户、协作和企业业务插件按需安装并单独授权。
- **预制专家**：仓库包含 8 个由预置 Skill 映射而来的专家，映射和快照见 [docs/2026-11-15-eight-skill-expert-mapping.md](docs/2026-11-15-eight-skill-expert-mapping.md)。

## 快速开始

### 环境要求

- Node.js `^22.19.0` 或 `>=24.0.0`
- Corepack
- Windows Desktop 构建需要项目文档列出的原生打包工具

### 安装依赖

```bash
corepack yarn install --immutable
```

### 启动 Desktop 开发流程

```bash
corepack yarn dev
```

### 常用检查

```bash
corepack yarn build
corepack yarn test
corepack yarn typecheck
corepack yarn check
```

启动、运行时隔离、Windows 权限诊断和实际窗口验收遵循 [docs/2026-11-15-startup-history-gate.md](docs/2026-11-15-startup-history-gate.md)。品牌界面当前源码验收记录见 [docs/2026-11-16-ai-expert-branding-r82-ui-acceptance.md](docs/2026-11-16-ai-expert-branding-r82-ui-acceptance.md)。

## 仓库结构

```text
apps/desktop/    Electron 载体、运行时检查和打包入口
apps/web/        Web 启动、部署和 Web 验证
packages/        共享插件、UI、Provider 和协议包
profiles/        Personal 与 Enterprise Profile 组合
scripts/         构建、对齐检查和发布辅助脚本
docs/            设计、计划、调研、运行证据和用户文档
references/      外部来源、Skill 快照和许可证材料
```

`upstream.json` 锁定官方 DSH 发布版本、归档地址、大小和 SHA-512。构建时从官方发布包提取运行时依赖和辅助工具；仓库不克隆、编译或携带第二套官方 Electron 应用。

## 专家、技能与 MCP

专家配置由 WorkDSH 专家插件管理。专家可以引用 Skill 的指令和资源，也可以在授权范围内使用连接器提供的工具；Skill、专家和软件插件是三个不同层次，不能把它们混为一个安装物。具体生命周期、依赖关系和预制专家流程见 [docs/2026-11-15-expert-prepack-research.md](docs/2026-11-15-expert-prepack-research.md) 与 [docs/expert-prepack-PROMPT_SPEC.md](docs/expert-prepack-PROMPT_SPEC.md)。

## Personal 与 Enterprise

Personal Desktop 与 Enterprise Desktop 使用同一套经过验证的官方 DSH 版本和 WorkDSH 自有功能。企业账户、协作和企业业务插件必须显式安装并通过成员授权启用；Personal mode 不会自动激活企业能力。企业后端是独立仓库：[WorkDSH Admin](https://github.com/techflag/workdsh-admin)。

不要把 API key、Token、Cookie、`.env` 文件、用户正文或企业数据提交到仓库。模型地址、公司密钥和登录凭据属于运行时或官方设置，不属于 README 或打包配置。

## 文档入口

- [`DESIGN.md`](DESIGN.md)：架构目标、边界、产品决策和长期约束。
- [`PLAN.md`](PLAN.md)：实施批次、命令、验收、证据和回滚。
- [`docs/RESEARCH_INDEX.md`](docs/RESEARCH_INDEX.md)：调研报告、经验教训和稳定证据总目录。
- [`docs/user-guide.md`](docs/user-guide.md)：用户使用说明。
- [`apps/desktop/README.md`](apps/desktop/README.md)：Desktop 构建和打包说明。
- [`apps/web/README.md`](apps/web/README.md)：Web 工作区说明。

## 贡献

请先阅读 [`AGENTS.md`](AGENTS.md)、[`DESIGN.md`](DESIGN.md) 和 [`PLAN.md`](PLAN.md)。改动应保持范围聚焦，并在提交前运行与改动相符的检查。新增调研报告、经验笔记或稳定证据时，同时更新 [`docs/RESEARCH_INDEX.md`](docs/RESEARCH_INDEX.md)。

## 许可与上游致谢

WorkDSH 使用 [MIT License](LICENSE)。项目感谢 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 及相关开源项目提供运行时、插件和生态基础。WorkDSH 是独立社区项目，与 DeepSeek、WorkBuddy 或其关联方没有隶属、授权或背书关系。
