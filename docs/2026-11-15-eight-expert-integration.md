# 八个预制 Skill 专家整合回执

日期：2026-11-15（Asia/Shanghai）  
批次：`r63-seven-expert-runtime-retry-20261115-001`  
状态：`source-integrated / build-passed / tests-passed / personal-main-ui-visible`

## 结论

剩余 7 个 Skill 已按既有“培训课程设计专家”流程生成并整合到当前源代码，连同先前的 1 个专家共 8 个预制专家。发布候选包来自当前 `main` 默认分支的提交 `3db89e76b38208cec64e77898428ce3785f63022`，打包清单记录 `sourceDirty=false`。个人模式已使用该运行时进入原版 WorkDSH 主界面，窗口标题为 `WorkDSH`，主界面地址为 `http://127.0.0.1:3080/?workdsh-view=conversation`，当前留给人工验收。

## 本轮新增的七个专家

| Expert ID | 绑定 Skill | 快照摘要 |
| --- | --- | --- |
| `ai-learning-coach-expert` | `ai-learning-coach` | `e610b61e7076ddaa75cd4204c0f222150f240360467c5175d713fe3a0f03b4e2` |
| `business-operations-analysis-expert` | `business-operations-analysis` | `744a54df48381b342d65d6cf80d4c2f461b18dcdc7929b4e0a12395acdc0c5ab` |
| `enterprise-knowledge-extraction-assistant-expert` | `enterprise-knowledge-extraction-assistant` | `6237b9d0525171b59707e4ec39e8fcd58699821f129a5cb07f1b90395492eeac` |
| `exam-evaluator-expert` | `exam-evaluator` | `80b7d31547e1ae9e1b5c62ba20a6bc8c454b2c749438f79b6a128f4ea51b6b76` |
| `idp-development-plan-generator-expert` | `idp-development-plan-generator` | `c5e0eff3be580e1a1a9b339d61fe6092cd899b3a7b5dfb85ca1ae01b9f599be1` |
| `llm-wiki-expert` | `llm-wiki` | `ee51d285b0ebadd24c6aafde33faf2a5d0a4b8841d36700f7514d751b01579e0` |
| `training-needs-diagnosis-expert` | `training-needs-diagnosis` | `8465f403baf12db8b7eb04ae8ca40f91d995116b98e3e11f439bd5e65fb8eb6b` |

既有 `training-course-designer-expert` 也被重新纳入同一生成清单，保留原快照和资源闭包。完整的源摘要、归档 SHA-256 和资源文件列表以运行时生成的 `expert-packages.json` 为准。

## 实施事实

- 生成器：`apps/web/scripts/generate-prebuilt-expert-snapshot.mjs`；来源根目录为 `packages/plugins/experts/resources/prebuilt`。
- 原始 Skill 内容以发布时固定的资源快照嵌入专家包；专家文档只增加身份、职责、边界、交付标准和示例，不执行 Skill 中的脚本。
- 运行时清单：`apps/desktop/build/workdsh-runtime/profiles/workdsh/node_modules/workdsh-plugin-experts/resources/generated/expert-packages.json`，`packages=8`，`generatedFrom=packages/plugins/experts/resources/prebuilt`。
- 发布清单：`.runs/r63-seven-expert-runtime-retry-20261115-001/standard-release-3/release-manifest.json`，官方 DSH 版本 `0.2.1-rc.5`，源代码干净。
- 本轮只扩展预制专家资源和生成逻辑，没有复制官方 DSH 源码、没有添加第二套 Desktop Host/Client，也没有配置模型密钥或写入用户数据。

## 验收证据

1. 生成器成功输出 `Generated 8 prebuilt expert snapshots`。
2. `definitionFromDocuments()` 成功解析 8 个包及其资源闭包。
3. `corepack pnpm --filter workdsh-plugin-experts build` 成功。
4. `corepack pnpm test -- apps/web/tests/integration/expert-manager.test.mjs` 成功，37/37 通过。
5. `apps/web` 的 `corepack pnpm build` 成功。
6. Desktop 发布包成功生成，`release-manifest.json` 记录 `sourceDirty=false`。
7. 当前个人模式主界面可见，左侧包含“专家·技能·连接器”，原生 Conversation 已加载，Host 端口 `3080` 正在监听。

## 回滚与后续验收

代码回滚点为提交 `6a2c8fe`（仅含首个培训课程设计专家）或当前整合提交 `3db89e7`；本轮运行副本和原始命令回执保存在 `.runs/r63-seven-expert-runtime-retry-20261115-001/`。用户下一步可在“专家·技能·连接器”中检查 8 个入口和实际对话行为。当前未配置 DeepSeek API Key，因此模型调用验收属于后续批次，不影响本轮包整合和启动验收。

材料性质：源码事实、构建/测试实验结果、运行时 UI 验收；不把未提供的 API 调用结果写成已验证事实。
