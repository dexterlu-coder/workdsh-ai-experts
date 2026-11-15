# 培训课程设计专家历史快照审计

日期：2026-11-15  
审计批次：`r56-training-course-expert-pre-release-20261115-001`  
状态：`structure-approved / project-spec-example-gap / provenance-drift / regenerate-from-current-zip`

## 结论

历史候选仓库中的 `training-course-designer-expert` 专家包结构符合当前源码的专家包校验规则，但不能原样作为当前预发布输入。按项目预制专家规格，它还少于两个真实启动示例；同时历史快照中的 Skill 正文与当前归档的原始 ZIP 不完全一致，因此其 `sourceDigest` 和 `snapshotDigest` 不能代表当前 Skill。

这里要区分两组专家：原始源码已有的 3 个默认专家是既有基线；历史生成清单中的 8 个 Skill 专家是新增集合，loader 明确要求清单恰好为 8 个，原始 3 个不计入这组。历史集成测试仍断言“3 个默认专家”，属于测试基线未同步，不能作为 8 个新增专家的数量要求。

后续实现必须从当前已授权的 `training-course-designer-1.0.0.zip` 重新生成专家快照，并重新计算资源闭包和摘要。

## 通过项

历史候选文件：

`D:\project\codex\workdsh-ai-expert-candidate\packages\plugins\experts\resources\generated\expert-packages.json`

当前 `definitionFromDocuments()` 验证结果：

- `expertId=training-course-designer-expert`；
- `name=培训课程设计`；
- `skillRequirements=[{ name: training-course-designer }]`；
- 14 个 package documents；
- `.workdsh-expert/plugin.json` 的 `agentName`、`agents`、`skills`、`expertType` 结构合法；
- `agents/expert.md` 包含四个必需的 `workdsh` 区段；
- 资源路径、Skill 入口和专家定义通过当前源码校验。
- `plugin.json.quickPrompts` 只有 1 条；当前项目规格要求至少 2 条真实启动示例，因此产品规格层面不合格。

## 未通过项

当前原始 ZIP：

`references/skillhub/packages/2026-11-06/training-course-designer-1.0.0.zip`

与历史 `packageDocuments[skills/training-course-designer/SKILL.md]` 对比发现：

- 文件清单数量一致；
- `references/` 和 `templates/` 内容一致；
- `SKILL.md` 至少存在 description 文案差异和结尾换行差异；
- 因此历史快照的 `sourceDigest=f617fd3e…` 与当前原始 ZIP 不能直接复用；
- 历史快照应视为候选结构参考，而不是当前 Skill 的可信内容来源。
- 单示例问题已在当前生成器中补为 2 条，并由 `definitionFromDocuments()` 复核。

对整个历史 8 包清单做只读加载复核时，另发现 3 个新增专家的资源闭包含中文文件名；历史 `parseExpertPackageManifest` 使用 ASCII-only 相对路径规则，导致这 3 项会让整个 8 包清单在 loader 阶段失败。该问题与 `training-course-designer` 单项的结构校验分开记录。

## 实施决定

1. 保留历史专家包的结构设计：`expertId`、`plugin.json`、`agents/expert.md`、`README.md`、`skills/<slug>/` 和资源闭包。
2. 以当前原始 ZIP 重新生成 `packageDocuments`、`sourceDigest` 和 `snapshotDigest`。
3. 重新生成后再次调用当前 `definitionFromDocuments()` 和 `validateDefinition()`。
4. 只有摘要、资源闭包和专家定义全部匹配当前输入，才进入 `workdsh-plugin-experts` 预发布构建。

## 证据

- 当前原始 ZIP：[training-course-designer-1.0.0.zip](../references/skillhub/packages/2026-11-06/training-course-designer-1.0.0.zip)
- 当前归档说明：[README.md](../references/skillhub/packages/2026-11-06/README.md)
- 本批次输入快照：[pre-snapshot.json](../.runs/r56-training-course-expert-pre-release-20261115-001/pre-snapshot.json)

