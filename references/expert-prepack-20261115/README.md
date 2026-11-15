# 预制专家调研参考索引

日期：2026-11-15
批次：`r51-expert-prepack-research-20261115-001`

## 本地源码

| 类型 | 路径 | 用途 |
| --- | --- | --- |
| 设计/计划 | `DESIGN.md`, `PLAN.md` | 当前项目边界、启动批次和回滚规则 |
| 专家定义 | `packages/contracts/src/experts.ts` | 定义、Skill 依赖、未来能力和 Host 服务契约 |
| 定义校验 | `packages/plugins/experts/src/domain/definition.ts` | 字段、资源、团队和模板安全校验 |
| 默认种子 | `packages/plugins/experts/src/domain/templates.ts` | 当前三位默认专家定义 |
| 种子/发布/执行 | `packages/plugins/experts/src/services/experts-manager.ts` | 延迟种子、Skill 锁、connector 检查、Session 绑定 |
| preset 编译 | `packages/plugins/experts/src/runtime/preset-compiler.ts` | persona、Skill filesystem、tool-skill 的运行时组合 |
| 文档与资源 | `packages/plugins/experts/src/authoring/documents.ts` | Agent MD、专家包和附带 Skill 解析 |
| 专家 ZIP | `packages/plugins/experts/src/services/portability.ts` | 导入预览、完整性校验和导出 |
| Desktop 包装 | `apps/desktop/scripts/pack-workdsh-profile.mjs`, `prepare-workdsh-runtime.mjs` | Profile 归档与全新运行时安装 |
| 运行证据 | `.runs/r51-expert-prepack-research-20261115-001/pre-snapshot.json` | 输入文件哈希和本轮范围 |

## 官方外部参考

| 来源 | 结论 |
| --- | --- |
| [dsh-skill-filesystem README](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/skill/skill-filesystem/README.md) | Skill 目录格式、扫描根和 `customSkillDirs` |
| [dsh-agent-preset README](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/preset/agent-preset/README.md) | preset 是插件组合；新 Agent 使用新组合 |
| [dsh-mcp-client README](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/mcp/mcp-client/README.md) | MCP server 配置、工具命名空间和连接失败语义 |
| [MCP subsystem reference](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/mcp.md) | MCP 是 scope 内的可选外部工具，不是默认全局能力 |

外部资料仅作能力核对；项目实现和授权边界以本仓库源码及 `AGENTS.md` 为准。
