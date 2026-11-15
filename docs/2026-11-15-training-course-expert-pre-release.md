# 培训课程设计专家预发布实现

日期：2026-11-15  
实现批次：`r59-training-course-expert-example-compliance-20261115-001`  
状态：`source-integrated / package-built / tests-passed-with-windows-fix`

## 已实现内容

- 从当前已授权的 `training-course-designer-1.0.0.zip` 重新生成专家快照；没有复用历史候选中已发生内容漂移的 Skill 正文。
- 新增构建生成器：[generate-prebuilt-expert-snapshot.mjs](../apps/web/scripts/generate-prebuilt-expert-snapshot.mjs)。
- 将 Skill 原始资源作为专家快照源放在 `packages/plugins/experts/resources/prebuilt/training-course-designer/`。
- 生成 [expert-packages.json](../packages/plugins/experts/resources/generated/expert-packages.json)，记录 `expertId`、Skill slug、资源闭包、归档 SHA-256、source digest 和 snapshot digest。
- 新增 `loadPrebuiltExpertTemplates()`，专家目录首次读取时将构建生成的专家包解析为默认专家种子。
- 预置入口：`training-course-designer-expert` / `培训课程设计`。
- 预置专家的定义包含角色、方法、边界、交付物、启动示例和 `training-course-designer` 固定 Skill 快照。

## 历史快照合规结论

历史候选包中的 `training-course-designer-expert` 已按当前源码的 `definitionFromDocuments()`、`validateDefinition()`、资源路径规则、Skill 入口、资源闭包和四个 `workdsh` 文档区段逐项检查：代码结构层面通过，14 个文档、11 个 Skill 资源均可解析且没有缺失闭包文件；但项目预制专家规格要求至少两个真实启动示例，历史包只有一个，因此产品规格层面不合格。原始 3 个默认专家属于既有基线，不计入新增 8 个 Skill 专家；历史测试仍断言 3 个，是旧测试基线未同步。

但它不能直接作为当前发布输入。历史 `SKILL.md` 与当前授权 ZIP 的正文存在差异（摘要文案和结尾换行导致内容摘要不同），历史声明的 `sourceDigest`/`snapshotDigest` 因而不能证明当前 Skill 来源一致。处理原则是保留其专家包结构作为参考，丢弃其 Skill 内容快照，从当前 ZIP 重新生成并重新计算摘要，同时补齐第二个启动示例。详细证据见[历史快照审计](2026-11-15-training-course-expert-snapshot-audit.md)。

## 生成摘要

- `expertId`：`training-course-designer-expert`
- `skillSlug`：`training-course-designer`
- 原始 ZIP SHA-256：`502f5146872ef01fbdcec2aa30132197de630d75b573a37c9dd7e099f9af18d6`
- `sourceDigest`：`aa40aa0179b2e9b8a6e9409d84a9e3aad034385479181f99efece1cd787d74c5`
- `snapshotDigest`：`be18b5cae87d5f988f28d84772bb27ff3c4f15b5f55c8ccecc87432dddefaf01`
- Skill 资源文件数：11；专家包文档数：14。
- 启动示例数：2，满足项目预制专家输入规格。

## 验证结果

- `workdsh-plugin-experts` typecheck：通过。
- 当前专家包 `definitionFromDocuments()`：通过；名称、角色、Skill 依赖、示例和 14 个资源文件均可解析。
- 预发布 tarball：已生成 [workdsh-plugin-experts-0.1.0-alpha.9.tgz](../.runs/r59-training-course-expert-example-compliance-20261115-001/pre-release/workdsh-plugin-experts-0.1.0-alpha.9.tgz)。
- tarball 已包含 `resources/generated/expert-packages.json`、完整 Skill 快照和 `dist/services/prebuilt-templates.js`。
- `expert-manager.test.mjs`：29/29 通过。
- `expert-package-authoring.test.mjs` 与 `expert-authoring-skill.test.mjs`：8/8 通过。
- Windows 验证修复：`preset-compiler.ts` 不再把 Windows 上不可表达 POSIX 执行位的普通资源误判为缺失依赖；仍保留资源字节和路径校验。
- 普通沙箱构建曾因 esbuild 子进程 `EPERM` 失败；在受控提升环境中重跑构建通过。该环境限制和命令退出码已记录在本批次回执。

## 当前边界

- 预置种子仍沿用当前 `ensureSeeded()` 语义：只在专家表为空时创建。对已有非空用户目录，新增预置专家不会自动迁移。
- 本批次没有接入其余 7 个专家，也没有修改官方 DSH 源码或运行时用户数据。
- 许可证按用户声明记录为已取得；授权原文/凭证尚未放入仓库，正式发布前仍需归档其路径和哈希。

## 回执

- [pre-snapshot.json](../.runs/r59-training-course-expert-example-compliance-20261115-001/pre-snapshot.json)
- [receipt.json](../.runs/r59-training-course-expert-example-compliance-20261115-001/receipt.json)
- 历史快照审计：[2026-11-15-training-course-expert-snapshot-audit.md](2026-11-15-training-course-expert-snapshot-audit.md)

