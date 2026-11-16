# 完整构建验收结果（分支验证）

- 日期：2026-11-17（Asia/Shanghai）
- 分支：`codex/full-build-validation-20261116`
- 源码提交：`53edba76ce5701f8d74c33e0469aeee53f87d302`
- 性质：完整构建门禁、发布归档和阻塞分诊
- 状态：`blocked / packaged-runtime-not-accepted`

## 已通过

- `corepack yarn install --immutable`：通过，Yarn `4.18.0`。
- `corepack yarn check`：通过。文档门禁、布局、Desktop/Web DSH 对齐、Desktop 构建、类型检查和测试均通过；测试结果为 29 个文件、166 通过、1 跳过。
- Desktop 入口打包测试同步：4 个测试文件、21/21 通过；修正了实现已传入而测试期望遗漏的 `--config=<desktopRoot>/scripts/electron-builder-config.mjs`。
- Web local release candidate：`sourceDirty=false`，`sourceCommit=53edba76ce5701f8d74c33e0469aeee53f87d302`，包含 13 个 Desktop feature 包；专家归档为 `workdsh-plugin-experts-0.1.0-alpha.9-4061c7247d22feb1.tgz`，SHA-256 `4061C7247D22FEB196039A82D5F0EE46E855BD87461354829CDA7750C48562E8`。
- Desktop carrier 构建：`apps/desktop/lib/workdsh-main.js` SHA-256 `147C4211188433A8462E598C0BE7C72AA1754B7F356677A43EC8F7C5911AB5B9`，包含“AI专家办事大厅”品牌。

## 失败与分诊

1. `r88`：完整 check 首次被仓库既有 `README.i18n.yaml` 过期 Git blob 哈希阻断；在分支上修正为当前 `README.md` blob 哈希。
2. `r89`：修正后完整 check 暴露 7 个打包测试期望滞后；Astra/high 批准后只同步 4 个测试文件，r90 全部通过。
3. `r91`：直接运行 `package:dir` 缺少 `workdsh-profile-manifest.json`；源码定义要求先执行 Web/Profile release 打包。
4. `r92`：标准 `release:pack` 在 Web 依赖清理时因无 TTY 触发 `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`。
5. `r93`：设置 `CI=true` 后完成 Web 依赖、Web 构建、14 个 Web release 包和 13 个 Desktop feature 包；官方 Profile 安装访问配置的 `registry.npmmirror.com` 时持续网络失败，停止并保留日志。
6. `r94`：直接切换到 `registry.npmjs.org` 被自动审查拒绝，因为本机配置存在 npm 认证凭据；没有绕过该拒绝或发送凭据。
7. `r95`：离线 Profile 安装确定失败，缺失 `@deepseek-ai/cordis@4.0.5` tarball。
8. `r96`：改用本机 pnpm store 和 copy 导入后，离线 Web 安装仍确定报告同一缺失 tarball。

## 当前结论

源码门禁和自有 Web/WorkDSH 归档已证明当前分支能生成包含 8 个专家包和品牌 carrier 的构建输入；官方 Profile 安装、Desktop packaged runtime、Electron 窗口、Host ready、主界面和专家入口尚未完成实际验收。由于当前共享 runtime 在失败的 Profile 准备过程中已不再含完整 `node_modules`，不能把它当作可启动运行时，也不能用旧的 r86 受控复用结果替代本次分支的 packaged-runtime 验收。

## 证据与回滚

- r90 完整 check：[`.runs/r90-full-source-build-20261116-001/check.log`](../.runs/r90-full-source-build-20261116-001/check.log)
- r93 Web/Profile 日志位于项目根目录同级的 `D:\project\codex\workdsh\r93-full-local-release-20261116-001\release-pack.log`。
- r95 离线失败回执位于项目根目录同级的 `D:\project\codex\workdsh-ai-experts\.runs\r95-full-local-release-offline-20261116-001\release-pack.log`。
- r96 分诊：[`.runs/r96-full-local-release-local-store-20261116-001/failure-triage.md`](../.runs/r96-full-local-release-local-store-20261116-001/failure-triage.md)。
- 这条验证分支没有推送、没有打 tag、没有发布；产品 `main` 未被修改。源码修正提交保留在分支，回滚可将分支重置到 `a945acb5e9`。
