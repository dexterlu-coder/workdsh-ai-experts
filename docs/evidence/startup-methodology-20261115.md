# WorkDSH Desktop 启动排查方法论与经验

日期：2026-11-15（Asia/Shanghai）
适用对象：`D:\project\codex\workdsh\workdsh-ai-experts` 原始 Desktop 源码

## 最终成功路径

1. 固定当前源码、Electron 43.3.0、官方 DSH runtime 和 WorkDSH Profile，不混用 Academy 或其他候选目录。
2. 使用标准受保护 DACL 的独立运行根目录，隔离 `TEMP`、`APPDATA`、`LOCALAPPDATA`、`HOME`、`DSH_HOME`、`DSH_AGENTS_HOME` 和 Desktop userData。
3. 通过普通 Node wrapper 启动 Electron；WinApp/UIA 只负责观察窗口，不作为启动器。
4. 启动后先确认 Electron 窗口，再选择“个人使用”，依次等待 Host ready、Web boot 和主界面。
5. 验收必须同时看到 Host ready、真实主界面、个人模式入口和产品插件导航；只看到端口或 loading 页面不算完成。

## 本次发现的两类故障

### Windows/Electron 原生层

当前 `.runs` 目录的 ACL 继承了额外 Codex 沙箱 SID，Chromium Network Service 在 Cache、SharedDictionary 和 Network 目录上出现 `access denied`。相同 Electron、最小页面和 Node wrapper 在标准 DACL 根目录下可以保持运行。`--disable-features=NetworkServiceSandbox` 的 A/B 实验没有消除错误，因此不能把它当作根因。

### Web boot/插件层

`workdsh-plugin-experts` 的 `installExpertPresetMenu()` 使用异步 slot 订阅；回调可能在所属 Cordis Fiber 已失效后调用 `slots.register()`，导致 `cannot create effect on inactive context`，随后 Web boot 报 experts failed。保护方式是回调执行前确认 Fiber active，并在注册竞态中只忽略 `INACTIVE_EFFECT`。

Desktop 的 `startRuntime()` 原先只从 stdout 解析 `dsh web:`。Host ready 也可能出现在 stderr，导致窗口永久停在“正在启动个人工作区”。修复后两路输出共用 ready URL 解析，同时保留各自的脱敏诊断流。

## 分诊与实验纪律

- 先保存命令、工作目录、退出码、完整日志、进程树、版本和哈希，再做下一次有副作用的操作。
- 一个 run 只改变一个主要变量；出现新根因、进程残留、范围扩大或装配失败时新建 `runId`，不在原 run 上盲目重试。
- 先区分 Electron 原生层、Host 层、Web boot 层和 UI 验收层；上一层成功不能证明下一层成功。
- 实验 overlay、生成文件替换和临时 wrapper 必须保存原始哈希、备份和精确恢复回执。
- 当前错误提示保留为现场状态，不把“主界面已可见”解释成所有退出清理或错误提示都已解决。

## 证据入口

- 最终成功验收：[personal-boot-r49-20261115.md](personal-boot-r49-20261115.md)
- 第一性原理分析：[2026-11-14-electron-temporary-environment-first-principles.md](../2026-11-14-electron-temporary-environment-first-principles.md)
- 启动证据索引：[references/startup-evidence-20261114/README.md](../../references/startup-evidence-20261114/README.md)
- 当前设计：[DESIGN.md](../../DESIGN.md)
- 当前计划与回执：[PLAN.md](../../PLAN.md)
