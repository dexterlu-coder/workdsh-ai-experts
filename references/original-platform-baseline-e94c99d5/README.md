# 二次开发前跨平台源码参考快照

日期：2026-11-17；性质：外部源码节选和校验清单；runId：`r111-original-three-platform-audit-20261117-001`。

本目录用于固定后续平台差异比对的原始输入，不是另一套可构建项目，也不应被产品、测试或打包入口导入。

- 上游仓库：`https://github.com/techflag/workdsh`。
- 固定提交：`e94c99d5f9e143fb67fec84a74978eb8218daf32`；提交时间：2026-10-31 20:55:58 +08:00。
- 本地来源：`D:\project\codex\workdsh-main.zip`，53,268,823 字节。
- ZIP SHA-256：`4ab764957cffbc9c52dfc36cea0429af46033163e9087bd21a986a9c1bcbec37`。
- ZIP 注释与上述提交一致；57 个节选文件均与本地现存的该提交 Git 对象逐文件核对通过，比较时只归一化 CRLF/LF。
- `source/` 保存 ZIP 内原始字节；[source-manifest.json](source-manifest.json) 保存每个文件的 SHA-256、大小和核对结果，共 335,042 字节。没有复制整套仓库、node_modules 或 Electron 运行时。
- 许可证：[原始 MIT LICENSE](source/LICENSE)，Copyright (c) 2026 Anywhere Labs。源码原有注释、许可证和历史局限均保留。

详细结论、源码行号及后续比对表见[三平台原版基线报告](../../docs/2026-11-17-original-three-platform-baseline.md)；[总目录](../../docs/RESEARCH_INDEX.md)为长期入口。原版与当前工作树的初步差异见[上一轮比较](../../docs/2026-11-17-original-baseline-platform-comparison.md)。

该快照只证明所检查文件的历史内容与来源，不证明上游在三个操作系统上均完成过实际构建、安装或 UI 验收。后续新增参考必须创建可识别的新快照，不能覆盖本目录中的原始字节。
