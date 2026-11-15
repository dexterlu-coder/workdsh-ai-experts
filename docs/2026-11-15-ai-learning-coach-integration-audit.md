# AI Learning Coach 内置集成审计

日期：2026-11-15  
批次：`r54-ai-learning-coach-integration-audit-20261115-001`  
状态：`compatible-in-isolation / blocked-license / product-source-unchanged`

## 结论

当前源码的内置 Skill 入口是：

```text
packages/plugins/skills/resources/skills/<name>/SKILL.md
```

构建时由 `apps/web/scripts/generate-builtin-skills.mjs` 使用官方 `@deepseek-ai/dsh-skill-filesystem` 解析该目录，生成 `packages/plugins/skills/src/authoring/professional.ts`；随后 `workdsh-plugin-skills` 的构建和打包把 `resources/` 与生成代码一起纳入包。

`ai-learning-coach@1.0.0` 在隔离副本中通过了这条解析链路，但当前不能直接复制进产品源码，因为来源资料没有提供可核对的再分发许可证或授权。

## 源码事实

- 当前内置 Skill 目录：`packages/plugins/skills/resources/skills/`。
- 当前目录包含六个工程维护的 Skill：`workdsh-excel-design`、`workdsh-ppt-design`、`workdsh-skill-creator`、`workdsh-web-design`、`workdsh-word-design`、`workdsh-workbench-dev`。
- 生成脚本只读取 `SKILL.md` 的 frontmatter 和正文；同目录下的 `references/`、`scripts/` 等资源随 `resources/` 交付，不复制到 TypeScript 生成文件。
- `packages/plugins/skills/package.json` 的 `files` 明确包含 `resources`，所以把第三方内容放入源码目录就会进入发布包，不能把它当作只在开发机存在的临时文件。

## AI Learning Coach 静态结果

来源归档：`references/skillhub/packages/2026-11-06/ai-learning-coach-1.0.0.zip`。

内容：

- `SKILL.md`
- `references/data_schemas.md`
- `scripts/manage_plan.py`
- `_meta.json`

兼容性检查：

- 官方 Skill provider 在隔离 `customSkillDirs` 中发现 `ai-learning-coach`；
- `SKILL.md` frontmatter 可解析，正文可加载；
- `SKILL.md` 引用的 `{SKILL_DIR}/scripts/manage_plan.py` 存在；
- `manage_plan.py` 通过 Python 语法编译检查，静态导入只使用 Python 标准库；
- 没有执行第三方脚本，没有创建用户 `.ai-coach` 数据，也没有修改真实 Skill 根目录。

## 发布门阻塞

SkillHub 已保存的元数据表明：

- `source=community`；
- `verified=false`；
- `authorVerifiedHandle=null`；
- `sourceUrl=null`；
- 作者未认领，ZIP 内没有 `LICENSE`、`NOTICE` 或 `COPYING`。

因此，当前证据只能支持“隔离兼容候选”，不能支持“作为 WorkDSH 内置 Skill 随包再分发”。将 ZIP 原文复制到 `packages/plugins/skills/resources/skills/ai-learning-coach/` 会使未授权第三方内容进入产品包，违反外部内容的许可证核对和发布边界。

## 可执行的后续路线

### 路线 A：取得明确授权后原样内置

补充作者或版权方的许可证原文/再分发授权，固定授权文件和 ZIP 哈希，然后将四个文件放入 `resources/skills/ai-learning-coach/`，运行：

```text
corepack pnpm --filter workdsh-plugin-skills typecheck
corepack pnpm --filter workdsh-plugin-skills build
```

之后再做 Profile 打包、冷启动、Skill 发现和实际任务验收。

### 路线 B：做 WorkDSH 自有实现

以“苏格拉底式学习、知识树、主动回忆、间隔复习、会话持久化”为需求，重新编写 WorkDSH 自有 `SKILL.md`、数据 schema 和脚本；不复制原 ZIP 的正文、代码或资源。该路线需要独立设计、命名、验收和版权归属记录。

在 A 或 B 发生前，本批次不修改 `packages/plugins/skills/resources/skills/`，也不生成新的生产包。

## 证据

- 隔离解压副本：[`.runs/r54-ai-learning-coach-integration-audit-20261115-001/candidate`](../.runs/r54-ai-learning-coach-integration-audit-20261115-001/candidate)
- Provider 结果：[provider-result.json](../.runs/r54-ai-learning-coach-integration-audit-20261115-001/provider-result.json)
- 输入快照：[pre-snapshot.json](../.runs/r54-ai-learning-coach-integration-audit-20261115-001/pre-snapshot.json)
- 原始 ZIP 归档：[references/skillhub/packages/2026-11-06/README.md](../references/skillhub/packages/2026-11-06/README.md)

