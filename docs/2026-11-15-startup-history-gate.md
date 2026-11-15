# 历史成功启动经验固化与启动前门禁

日期：2026-11-15（Asia/Shanghai）
关联批次：`r50-current-source-personal-20261115-001`、`r60-current-source-expert-integration-20261115-001`
材料性质：项目经验总结、源码事实、实验结果；不替代具体运行回执。

## 固化结论

历史成功启动不是“换一个临时文件夹”这一条技巧，而是一组必须同时满足的条件：

1. Electron、Desktop 源码、DSH Profile 和 primary runtime 必须来自同一批次，并记录路径、版本和哈希。
2. user-data、`DSH_HOME`、`DSH_AGENTS_HOME`、`TEMP`、`TMP`、`APPDATA` 和 `LOCALAPPDATA` 必须使用本次 run 的独立目录。
3. 运行根目录必须使用标准受保护 DACL。当前工作区 `.runs` 带有额外 Codex 沙箱 SID 时，不得把它当作 Electron ACL 对照环境。
4. Electron 必须由普通 Node wrapper 启动。wrapper 只保留启动所需环境变量，清除 `ELECTRON_RUN_AS_NODE`、`NODE_OPTIONS` 以及 Provider、API、Token 和 Secret 变量。
5. `--no-sandbox`、`--disable-gpu` 等参数只属于已登记的测试环境例外，不能被解释为产品修复，也不能替代 DACL 和环境隔离。
6. 启动验收必须分层完成：Electron 窗口、个人入口、Host ready、Web boot、主界面、专家/技能/连接器入口、退出清理。端口监听或 loading 页面单独通过都不算成功。

## 启动前门禁

下一次启动前，必须先生成新的 `runId` 和 pre-snapshot，并记录以下字段：

- `sourceCommit`、工作目录、Desktop app root、Electron 路径/版本/SHA-256；
- Profile、primary runtime、Node 路径和 DSH 版本；
- 独立运行根目录及其 DACL 摘要；
- user-data、`DSH_HOME`、`DSH_AGENTS_HOME` 和临时目录的绝对路径；
- wrapper 的原始命令、清洁环境变量清单和启动参数；
- 启动前 `3080` 端口、Electron/Node/Host 进程和旧窗口状态。

门禁未通过时不得启动。尤其禁止直接用默认 PowerShell 环境把 `corepack yarn start` 当作第一次 UI 启动实验，也禁止为了释放端口而关闭含未发送内容的旧窗口；应优先使用隔离 user-data 和独立运行根目录。

## 失败处理

失败后先保存原始命令、工作目录、退出码、完整 stdout/stderr、进程树、存活状态、端口、输入/输出路径、版本和哈希，再区分 Electron 原生层、Host 层、Web boot 层和 UI 层。发现新根因、残留进程、路径/版本/哈希不一致或范围扩大时，停止当前 run 并新建 runId，不在原 run 上盲目重试。

## 当前证据边界

- `r61` 矩阵证明：`.runs` 的额外 ACL 会伴随 `mojo/network_sandbox` 拒绝；单独增加 `--disable-features=NetworkServiceSandbox` 不能消除该错误。
- `r50` 回执证明：当前源码曾在标准 DACL 根目录、历史 Node wrapper 和测试环境例外下进入个人主界面。
- `r60` 复现证明：当前整合提交使用历史 wrapper 可以打开 `WorkDSH` 入口页；个人主界面和 DeepSeek API 仍需单独验收。
- 旧 Host 占用 `127.0.0.1:3080` 属于残留进程/旧状态问题，不能作为当前专家包故障的证据。

## 回滚与保留

本规则只增加文档和启动纪律，不修改 Electron、DSH Host、官方 runtime 或产品 UI。历史回执、旧窗口和用户草稿保留；若后续新增可执行门禁脚本，必须单独登记范围、输入哈希和回滚方式。
