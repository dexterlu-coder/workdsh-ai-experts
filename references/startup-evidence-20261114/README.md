# 启动证据索引

本轮启动方法论与分层排查规则见：[docs/evidence/startup-methodology-20261115.md](../../docs/evidence/startup-methodology-20261115.md)。

本索引只记录本机历史证据，不把其中的 token、凭据或临时 URL 当作可复用配置。

| 证据 | 事实 | 边界 |
| --- | --- | --- |
| `D:\project\codex\workdsh-ai-expert-candidate-runs\workdsh-real-ui-acceptance-20261114T023000Z-r61\evidence\TERRA-R61-RESULT.md` | 真实 Electron 入口、个人工作区和主界面 UIA 读取通过；窗口可见；退出清理完成 | `sandbox-and-no-sandbox-environment-exception`；`nativeAcceptance=blocked` |
| `D:\project\codex\DeepSeek harness usage-runs\dependency-reproducibility-20261111-electron-r2\evidence\ELECTRON-CANDIDATE-RESULT.json` | `status=electron-window-started`，窗口标题为 AI 专家办事大厅 | 候选 Electron 载体观察，未证明发布制品 |
| `D:\project\codex\DeepSeek harness usage-runs\full-runtime-workspace-20261111-host-direct-r2\evidence\HOST-DIRECT-RESULT.json` | Host 输出 `dsh web:` 并达到 ready | 有 skill-office 资源警告；仅 Host ready，不等于 Desktop UI ready |
| `D:\project\codex\workdsh-ai-expert-candidate-runs\experts-known-process-preflight-20261113T170000Z-r40\evidence\TERRA-R40-RESULT.json` | `windowVisible=true`、`didFinishLoad=true`、`axMainUi=true` | 因 CUA geometry gate blocked，未执行会话创建 |
| `D:\project\codex\workdsh-ai-expert-candidate-runs\workdsh-ui-review-20261114T141500+0800-r69\evidence\R69-STARTUP-READY-BLOCKED.json` | Host ready URL 出现在 stderr，UI 停在个人工作区启动中 | 独立的 stdout/stderr readiness 回归，不是 Mojo 根因 |
| `D:\project\codex\workdsh-ai-expert-candidate-runs\experts-cua-overlay-20261113T105329Z-r30\evidence\TERRA-R30-RESULT.json` | 历史 renderer 命令行包含 `--disable-features=NetworkServiceSandbox` | 该 run 本身被 CUA gate 阻塞，但保留了历史 Chromium 参数事实 |

对应的历史计划是：

`D:\project\codex\DeepSeek harness usage\docs\WorkDSH实际启动新建退出验收计划-r61-20261114.md`

官方资料：

- Electron 沙箱说明：<https://www.electronjs.org/docs/latest/tutorial/sandbox>
- Electron 命令行参数：<https://www.electronjs.org/docs/latest/api/command-line-switches/>
- Chromium network sandbox ACL 实现：<https://chromium.googlesource.com/chromium/src/+/f548c1ebe727d7917e37b3f07b65095a40118f1a/content/browser/network_sandbox.cc>
- Chromium network service ACL 实现：<https://chromium.googlesource.com/chromium/src/+/dac11fb82f38e80f305c8b23ad1c6305d45280c0/content/browser/network_service_instance_impl.cc>
- Electron Windows network sandbox issue：<https://github.com/electron/electron/issues/49143>

