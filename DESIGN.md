# WorkDSH Desktop 启动诊断设计

状态：`completed-with-current-source-launch`

本文件与 [PLAN.md](PLAN.md) 互相引用。当前记录的目标是解释历史临时环境为何能够启动、当前源码为何被 Windows 拒绝访问，并保留可复核的启动路径。

## 结论与边界

- 历史临时环境改变了用户数据目录、环境继承、Electron/Chromium 沙箱参数、监督方式和运行时配对，不是单纯换了一个文件夹。
- 受控对照显示：相同 Electron、相同最小页面和相同 Node wrapper，在标准受保护 DACL 根目录下可以存活；当前 `.runs` 根目录下出现 `mojo/network_sandbox` ACL 拒绝。DACL/继承差异是当前最强已验证原因，launcher token 差异仍未证明。
- `--disable-features=NetworkServiceSandbox` 已被 A/B 实验排除为根因；`--no-sandbox` 只能作为测试例外，不是产品默认修复。
- 本次诊断不修改官方 DSH 源码、Electron 二进制或产品 UI；实验脚本和回执保存在 `.runs`，长期结论保存在 `docs/` 与 `references/`。
- 当前个人模式的新证据确认两处独立启动故障：`workdsh-plugin-experts` 的 `installExpertPresetMenu()` 异步 slot 回调会在 Cordis Fiber 失效后调用 `slots.register()`；Desktop `startRuntime()` 只从 stdout 解析 Host ready，而 Host ready 也可能出现在 stderr。两处都已形成最小实验与源码修复。
- 当前源码个人模式最终启动又确认第三处竞态：`startRuntime()` 在入口切换仍为 `switching=true` 时会丢弃一次性 Host ready URL；当前 Profile 冷启动足够快时会稳定复现 loading 卡住。修复后通过普通 Node wrapper、当前仓库 Electron 和当前源码构建的 WorkDSH UI/Experts 包进入主界面。

## 参考入口

- 详细分析：[docs/2026-11-14-electron-temporary-environment-first-principles.md](docs/2026-11-14-electron-temporary-environment-first-principles.md)
- 运行证据索引：[references/startup-evidence-20261114/README.md](references/startup-evidence-20261114/README.md)
- 原始复现记录：[docs/evidence/electron-network-sandbox-r61-repro-20261114.txt](docs/evidence/electron-network-sandbox-r61-repro-20261114.txt)
- 实施与验收：[PLAN.md](PLAN.md)
- 当前源码最终启动回执：[.runs/r50-current-source-final-receipt.json](.runs/r50-current-source-final-receipt.json)
