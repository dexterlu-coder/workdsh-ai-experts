# WorkDSH Desktop 启动诊断计划与回执

状态：`completed-with-current-source-launch`

本文件与 [DESIGN.md](DESIGN.md) 互相引用。该批次只做启动差异诊断、证据归档和当前原始版本启动验证。

## 批次

- `runId`：`r45-personal-cdp-20261115-001`
- 输入：历史 r2/r30/r40/r42/r57/r59/r60/r61/r69 证据、当前源码、同一 Electron 43.3.0。
- 允许路径：当前仓库的 `docs/`、`references/`、`.runs/`，以及为受控 ACL 对照创建的临时目录。
- 禁止路径：官方 DSH 源码、产品运行时二进制、用户凭据、Token、Cookie、用户正文和企业数据。

## 已完成的前置回执

1. `--no-sandbox` 与附加 `--disable-features=NetworkServiceSandbox` 的最小 Electron A/B 矩阵均复现 ACL 拒绝，证明 feature flag 不是根因。
2. 相同 Electron SHA-256、最小页面和 Node wrapper 在标准受保护 DACL 根目录下保持运行且没有 `mojo/network_sandbox` 拒绝；当前 `.runs` 两组仍失败。
3. 当前 `workdsh-ai-experts` 原始 WorkDSH 通过历史风格 Node wrapper、标准 DACL 根目录和测试环境例外成功打开，窗口标题为 `WorkDSH`，主界面可见。
4. 结论、原始输出和比较 JSON 已保存，未把未验证的 token 差异写成事实。

## 当前个人模式批次

- `r43-personal-clean-20261115-001`：全新 Home 仍停在启动页，Host 子进程长期存活但无端口；按分诊规则保存进程树并确认清理。
- `r44-personal-cold-capture-20261115-001`：Host stdout 明确输出 `[workdsh:probe] activated` 与 `dsh web:`；浏览器稳定报 `cannot create effect on inactive context`，随后 `workdsh-plugin-experts: failed`。
- `r45-personal-cdp-20261115-001`：CDP 完整栈定位到 `workdsh-plugin-experts` 的 `installExpertPresetMenu()` 异步 slot 回调，落在官方 `SlotRegistry.register()` 的 inactive Fiber 上。
- `r46-personal-overlay-skip-preset-20261115-001`：Profile overlay 装配失败，未生成 Host launcher，结果不用于根因判断。
- `r47-personal-skip-preset-20261115-001`：仅跳过预设包装后真实主界面可见，证明第一处故障假设。
- `r48-personal-source-fix-20261115-001`：源码修复构建产物已加载；Host ready 回执出现在 stderr，暴露 Desktop stdout-only parser 的第二处故障。

## 当前验证动作

在一次性运行副本中跳过 `installExpertPresetMenu()`，保持 Host、Profile、Electron、其他插件和用户数据契约不变。成功标准是个人模式真实主界面可见，且 experts、skills、library、connectors 入口均已激活；失败则保留完整 CDP/日志并新建 runId。

## 源码修复

- `packages/plugins/experts/src/client/PresetMenu.tsx`：slot 回调执行前调用 `ctx.fiber.assertActive()`；对注册竞态只吞掉 Cordis `INACTIVE_EFFECT`，其他异常继续抛出。
- `apps/desktop/src/workdsh-main.ts`：stdout 与 stderr 共用 ready URL 解析路径，保留两路独立脱敏诊断。
- `apps/desktop/src/workdsh-main.ts`：ready URL 不再因为入口切换仍为 `switching=true` 而被丢弃；这是当前 Profile 冷启动卡 loading 的第三处竞态修复。
- 构建：`corepack pnpm --filter workdsh-plugin-experts build` 成功；嵌套 Web 依赖和 esbuild 二进制由本机安装回执提供。
- 最终验收：[personal-boot-r49-20261115.md](docs/evidence/personal-boot-r49-20261115.md)。

## 当前源码最终启动批次

- `r50-current-source-personal-20261115-001`：从 `D:\project\codex\workdsh-ai-experts` 当前源码构建并启动，保留前两处修复并增加 ready 竞态修复；使用当前仓库 Electron 43.3.0、普通 Node wrapper、标准 DACL 运行根目录 `D:\project\codex\workdsh\r50-current-source-home6`，未使用候选仓库 Electron 或候选运行时。
- 当前源码自有包已装入本次运行副本：`workdsh-plugin-experts/dist/client.browser.js` SHA-256 `D70FD049B7810A661B703BD76FF4D35932FC34A97F382B24ABE27DA97C48012E`；`workdsh-ui/dist/index.js` SHA-256 `92A212AD0E050BB0F270A7E9BFA2892CFABF3255F9F21B56D717D2EF53E970D8`。
- UI 验收：Electron 窗口标题 `WorkDSH`；个人模式 loading 页面完成；主导航可见 `专家 · 技能 · 连接器`、`资料库`、`工作台` 和原生 Conversation；账户/API Key 提示为当前空环境预期状态。
- 完整回执：[.runs/r50-current-source-final-receipt.json](.runs/r50-current-source-final-receipt.json)。

## 八个预制专家整合批次

- `r63-seven-expert-runtime-retry-20261115-001`：在已有培训课程设计专家基础上，将其余 7 个 Skill 按同一发布时快照流程整合到当前源码；生成清单为 8 个专家，运行时和个人模式主界面均已验证。
- 源码提交：`3db89e76b38208cec64e77898428ce3785f63022`；发布清单记录 `sourceDirty=false`，官方 DSH 版本为 `0.2.1-rc.5`。
- 验收报告：[2026-11-15-eight-expert-integration.md](docs/2026-11-15-eight-expert-integration.md)；一次性运行回执：[.runs/r63-seven-expert-runtime-retry-20261115-001/final-receipt.json](.runs/r63-seven-expert-runtime-retry-20261115-001/final-receipt.json)。

## 首启预览说明抑制批次

- `r64-remove-preview-onboarding-20261115-001`：用户授权移除启动时官方“预览版说明”弹窗。Astra 只读审计确认仓库源码没有该文案；历史运行副本的 `workdsh-bundle/dist/client/harness/welcome-brand.js` 只改写官方 `settings.onboarding` 的 `welcome-notice`。本批次只在 WorkDSH bundle 的公开 Client 插槽中抑制该单一入口。
- 允许路径：`packages/bundle/src/client/harness/client.ts`、相关测试、`docs/`、`DESIGN.md`、`PLAN.md`；禁止修改官方 DSH 源码、官方运行时二进制、模型配置和用户数据。
- 成功标准：干净个人 Profile 首次启动不显示该说明卡片；主界面、Conversation、模型设置、专家/技能/连接器入口和 Host ready 仍可用；已初始化 Profile 重启不回归。失败按错误分诊规则换新 runId。
- 回滚：移除 WorkDSH 自有的 slot suppression 代码并恢复本批次前的 bundle 构建产物；官方包、用户配置和现有专家快照不变。

## 证据

- 启动经验固化与门禁：[docs/2026-11-15-startup-history-gate.md](docs/2026-11-15-startup-history-gate.md)
- [COMPARISON-RESULT.json](.runs/electron-matrix-r61-20261114/r42-standard-acl/COMPARISON-RESULT.json)
- [MATRIX-RESULT.json](.runs/electron-matrix-r61-20261114/MATRIX-RESULT.json)
- [原始复现记录](docs/evidence/electron-network-sandbox-r61-repro-20261114.txt)
- [历史启动证据索引](references/startup-evidence-20261114/README.md)

## 回滚

本批次没有产品源码或运行时改动。若清理实验材料，只删除 `.runs` 下本批次副本；长期分析与证据索引保留。

本次新增的源码改动属于当前源码启动所需修复，不回滚。运行时副本改动只位于 `.runs/r50-current-runtime`；恢复旧运行时可使用 `.runs/r50-current-source-ui/before-workdsh-ui` 和 `.runs/r50-current-source/before-installed` 备份。
