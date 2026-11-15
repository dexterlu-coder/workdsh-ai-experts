# 预制专家输入规格

这是下一批实现的输入模板，不是已经生效的产品配置。

## 每位专家

- `name`：面向用户的中文名称
- `id`：稳定的小写英文 kebab id
- `description`：一句话价值
- `role`：身份和职责
- `methodology`：处理顺序和方法
- `boundaries`：不做什么、信息不足怎么处理
- `deliverables`：输出结构和验收标准
- `tags` / `categoryId`
- `examples`：至少两个真实启动示例
- `skillRequirements`：已有 Skill 名称和可选 skill id
- `futureRequirements`：仅在确实需要 connector 时填写 `kind=connector`

## MCP 额外信息

- connector id / serverName
- 需要的工具名或资源名
- 是否允许在个人模式使用
- 连接失败时是否允许专家显示为不可用
- 凭据来源（只写“由连接器凭据服务管理”，不要写 token）

## 交付选择

- 新安装默认可见：扩展 `DEFAULT_TEMPLATES`
- 已有安装也要出现：另行设计版本化迁移或导入流程
- 专家团：补充成员 key、成员职责和 workflow stages
