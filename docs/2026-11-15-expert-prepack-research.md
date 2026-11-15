# 预制专家与 Skill/MCP 调研

日期：2026-11-15
研究批次：`r51-expert-prepack-research-20261115-001`
状态：`research-complete / implementation-pending-input`

## 一、目标与边界

本轮调查回答三个问题：

1. 预制专家从源码到 Desktop 运行时的真实链路是什么；
2. 专家定义能否绑定 Skill、MCP，以及绑定发生在哪一层；
3. 如果要把新增专家打包进原项目，应该改哪一个源代码入口，怎样验收。

本轮只做源码调查、官方资料核对和方案落盘，没有创建未命名的专家，没有修改专家模板、运行时用户数据、官方 DSH 源码、凭据或连接器配置。

## 二、结论先行

- 当前项目已经有三位源码预制专家：需求分析顾问、文档评审顾问、工作复盘顾问。它们在首次读取专家目录时由 `DEFAULT_TEMPLATES` 延迟种子化，不是通过复制某个旧运行时目录得到的。
- 新增预制专家的产品内入口应是 `packages/plugins/experts/src/domain/templates.ts`。构建 `workdsh-plugin-experts` 后，再由 Desktop 的 Profile 打包脚本把该包放进新的 Profile；不应直接向用户目录写专家记录，也不应把专家 ZIP 当作基础运行时的第二套来源。
- 专家可以绑定 Skill。发布前会解析并冻结 Skill revision；运行时 preset 会把冻结的 Skill 快照和专家包内的 `skills/<name>/SKILL.md` 挂进官方 `dsh-skill-filesystem`，模型通过官方 Skill loader 按需调用。
- 专家可以使用 MCP，但当前模型不是“专家定义直接内嵌 MCP 服务器配置”。项目通过 `futureRequirements` 声明 `kind: connector`，发布后在创建任务时检查连接器是否 ready，并把连接器选择写入该 Session；MCP 服务本身仍由 `workdsh-plugin-connectors` 管理。
- 专家不能在 Agent MD 中声明任意 `tools` 权限。导入解析器会拒绝带 `tools` 字段的旧式文档；工具集合由官方 standard preset、Skill provider 和当前 Session 的连接器选择共同决定。
- 当前工作区没有 Git 元数据。`pack-workdsh-profile.mjs` 明确要求从 Git 根目录读取 `sourceCommit` 和 `sourceDirty`，因此源码包可以单独构建，但“官方 Desktop Profile 发布包”在这个工作区不能直接完成，必须使用完整 Git checkout 或已生成的 release directory。

## 三、源码对象模型

### 1. ExpertDefinition：专家内容

`packages/contracts/src/experts.ts` 定义专家内容，核心字段是 `name`、`description`、`role`、`methodology`、`boundaries`、`deliverables`、`examples`、`skillRequirements` 和 `futureRequirements`。`agentDocument`、`packageDocuments`、`packageAssets` 用于保留完整制作稿和资源。

摘要字段会编译成 persona 前缀；示例只用于启动任务草稿；定义本身没有“给模型直接开放任意工具”的字段。

### 2. SkillRequirement：可冻结的 Skill 依赖

`skillRequirements` 只有 `name` 和可选 `skillId`。`ExpertsManager.computeValidation()` 会逐项调用 `ctx.workdshSkills.resolveRevision()`，得到不可变的 Skill revision lock 和 digest。依赖不存在、禁用或发生漂移都会成为发布或运行时就绪错误。

### 3. Preset：不可变运行时组合

`compileExpertPreset()` 以官方 `standard` preset 为基线，复制其插件表，再替换/追加：

- `@deepseek-ai/dsh-persona`：专家身份前缀和后缀；
- `@deepseek-ai/dsh-skill-filesystem`：冻结 Skill 快照目录和专家包内 Skill 目录；
- `@deepseek-ai/dsh-tool-skill`：模型可见的 Skill 目录/加载工具。

它不会自动添加 `@deepseek-ai/dsh-mcp-client`。因此 MCP 不是由某个专家的 `skillRequirements` 隐式获得的。

### 4. Package resources：专家的可移植内容

专家包允许 `agents/`、`skills/`、`README.md`、`team.md`、`assets/`、`avatars/`、`bin/` 等受控路径。`skills/<name>/SKILL.md` 会被识别为专家包内 Skill，并随 preset 挂载；`bin` 文件的 executable 标记只描述文件模式，不等于获得越权执行权。

### 5. Execution binding：专家与 Session 的绑定

发布修订会记录 `presetRevisionRef`、Skill dependency lock 和 composition digest。召唤专家时先准备 execution plan，再创建原生 Session；创建后检查必需能力，并将 `futureRequirements` 中的 ready connector 追加到该 Session 的连接器选择。绑定记录用于后续防漂移和恢复校验。

## 四、完整工作协议

### A. 对话制作路径

1. 用户点击“制作专家”或“制作专家团”；
2. Client 创建官方原生 Session，并写入一次性 `/workdsh-expert-manager` 草稿；
3. Skill 指导模型澄清角色、材料、边界、交付物和依赖；
4. 模型通过 `workdsh_expert_create_draft`、`workdsh_expert_save_documents`、`workdsh_expert_save_resources` 等工具保存草稿；
5. 通过 `workdsh_expert_list_skills` 选择可用 Skill；
6. `workdsh_expert_validate` 做结构校验、资源校验和 Skill revision 冻结；
7. `workdsh_expert_request_publish` 只产生 `needs-confirmation` 挑战；
8. 用户在专家界面检查摘要和依赖锁，受信 UI 完成 confirm/publish；
9. 发布后的修订才能被召唤；已有任务继续使用原修订。

### B. 源码预制路径

1. 在 `DEFAULT_TEMPLATES` 增加完整且稳定的 `id` 与定义；
2. 构建 `workdsh-plugin-experts`，让 `dist/` 与 `resources/` 同步；
3. 使用 `pack-workdsh-profile.mjs` 将所有 release packages 打成带 SHA-256 的归档；
4. 使用 `prepare-workdsh-runtime.mjs` 在全新输出目录安装锁定的 Profile；
5. 首次读取专家目录时，`ensureSeeded()` 把模板编译为 published revision 和 draft，来源标为 `default`；
6. 用实际 Desktop runtime 验证列表、详情、召唤、Skill readiness 和 MCP connector readiness。

关键点：`ensureSeeded()` 在专家表非空时直接返回。因此给已有安装追加模板不会自动补种；已有用户必须走显式导入或另行设计的、带迁移证据的种子迁移。当前不应偷偷添加迁移逻辑。

当前仓库的 Skill 插件资源目录还包含 `workdsh-excel-design`、`workdsh-ppt-design`、`workdsh-skill-creator`、`workdsh-web-design`、`workdsh-word-design` 和 `workdsh-workbench-dev`。它们是可供依赖解析的本地候选，是否适合某个专家仍要逐项验证内容、模型可调用状态和发布时的 revision。

## 五、能力判断

| 能力 | 当前是否支持 | 真正绑定层 | 验收条件 |
| --- | --- | --- | --- |
| 使用已有 Skill | 支持 | ExpertDefinition → dependency lock → expert preset | Skill 可解析、revision intact、模型目录可见 |
| 随专家包携带 Skill | 支持 | `packageDocuments[skills/<id>/SKILL.md]` → preset customSkillDirs | 包路径合法、Skill 文件存在、preset 无 drift |
| 使用 MCP 工具 | 条件支持 | connector service → Session selection → official MCP client | connector 已安装、启用、ready；新 Session 绑定后工具可见 |
| 专家独占 MCP 服务器配置 | 当前不支持 | 无对应 ExpertDefinition 字段；不应把 server URL/token 写进专家定义 | 需要单独设计 connector provisioning，不能靠专家模板绕过 |
| 在 Agent MD 中声明任意 tools | 禁止 | 导入解析器拒绝 `tools` 字段 | 通过 standard preset 与连接器选择控制工具集合 |
| 使用未来能力 | 仅 connector 已实现 | `futureRequirements` | `kind=connector` 会检查；其它 kind 进入 unsupported-capability |

## 六、官方资料核对

- 官方 `dsh-skill-filesystem` 说明：Skill 是目录束 `name/SKILL.md` 或顶层文件；provider 发现目录、解析 frontmatter，正文按需加载；`customSkillDirs` 是官方配置入口。
- 官方 `dsh-agent-preset` 说明：preset 是一组子插件组合；Agent 的模型体验由声明的插件提供，已有 Agent 不会中途换组合，新 Agent 使用新定义。
- 官方 `dsh-mcp-client` 说明：每个 MCP server 是一个独立配置项，工具以 `mcp__<serverName>__<rawName>` 暴露；无 server 时没有 MCP 工具和提示词；连接失败时默认可保留启动但不会出现该 server 的工具。

这些外部资料只用于核对官方能力边界；本项目的专家权限、发布确认、连接器选择和版本锁定仍以本仓库源码为准。

## 七、实现建议与当前阻塞

建议下一批采用“源码模板 + 新 Profile 验收”路径：

- 预制专家只写入 `DEFAULT_TEMPLATES`，不复制现有用户数据库；
- 如果专家需要 Skill，优先声明已有 Skill 的稳定名称和版本锁；只有确实需要随包交付的 Skill，才放入 `packageDocuments`；
- 如果专家需要 MCP，先确认目标 connector 的 `serverName`、安装方式、ready 条件和是否允许个人模式使用，再在 `futureRequirements` 声明 connector id；不把 URL、命令、令牌写进专家包；
- 先构建并做无头验证，再生成全新 Profile；当前工作区缺少 Git 根目录，因此正式 `pack-workdsh-profile.mjs` 仍需在完整 checkout/release directory 中执行；
- 对已有安装要单独决定“只支持新安装种子”还是“增加版本化迁移”。

## 八、待用户提供的专家规格

在写入源码前，每位专家至少需要：

- 专家名称和稳定英文 id；
- 解决的问题和目标用户；
- 核心职责、工作方法、边界；
- 输入材料和输出/验收标准；
- 至少两个启动示例；
- 是否依赖现有 Skill；
- 是否需要 MCP，若需要，目标 connector id 和允许的工具范围；
- 单专家还是专家团。

本轮未写入具体专家，是因为上述内容尚未确定；直接猜测会把未经确认的业务规则固化到产品。
