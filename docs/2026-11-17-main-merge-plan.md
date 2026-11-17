# 当前构建验证分支合并 main

日期：2026-11-17；性质：用户授权的合并工作包及验收记录；reviewId：`r113-main-merge-20261117-001`；实施 runId：`r114-main-merge-20261117-001`；验证 runId：`r115-main-merge-validation-20261117-001`。状态：`audit-approved-with-changes / local-checks-passed / pr-pending`。

## 目标、基线和授权

用户明确要求将当前分支合并到 main。来源 `codex/full-build-validation-20261116`，输入 HEAD `aee688b755bb03747ebc6e5227768285bfa80d0e` 加本工作包记录的 dirty 内容；目标 `origin/main` 初始为 `a945acb5e912f31895f1ac7366265b838033ec66`。远端 `dexterlu-coder/workdsh-ai-experts` 为 public，默认分支 main；本批仅 Git 合并，不创建发布标签或发布安装包。

参考：r106 已批准的 Windows 上限修复；[当前源码启动证据](2026-11-17-current-source-startup-r108.md)；[平台差异结论](2026-11-17-current-platform-contract-comparison.md)。这些材料分别证明既有修复范围、staging UI 结果、尚未处理的平台风险，不能混称 packaged-runtime 验收。

## 冻结范围

- 收录当前分支两个既有提交、当前已授权的 r106 两个物化脚本及其规则测试、稳定调研/经验文档、索引及 MIT 原版参考快照。原始候选列表见 `.runs/r113-main-merge-20261117-001/pre-snapshot.json`；审核后重新冻结的精确输入、allowlist 和变更前文件以 `.runs/r114-main-merge-20261117-001/pre-snapshot.json` 为准。
- 为使本次合并的现有必需无头检查有意义，只允许两类最小测试修正：`apps/desktop/tests/package-win.spec.ts` 的三个新增 config 期望按测试主机 `path.join` 构造，保留其他参数和凭据隔离断言；`apps/desktop/scripts/materialize-hardlink-limit.test.mjs` 的 fixture 自建/清理，并将此测试接入 `apps/desktop/package.json` 现有 node:test 命令。
- 保留已有品牌、8 专家和启动修复；不实施 macOS/Linux 文件系统策略重构，不改变 staging/materialization 的生产策略，不修改官方文件、依赖/lockfile、CI/分支保护，不降低或绕过检查。
- 不提交 `.runs`、运行目录、生成包、凭据、本机配置和三张未被文档引用的截图。历史参考快照只作为文档来源，不接入产品构建。
- 前述测试修正须在只读审核通过后由 Terra/high 实施；若审核 rejected 或必需检查失败，保留具体 PR/失败证据，不能擅自直接推 main 或强制合并。

## 验收与交付

1. 核对候选文件、输入哈希、许可证、敏感字段和文档引用。历史 `.runs` 链接属于本机原始证据，不承诺随源码发布；稳定报告和参考文件应完整提交。
2. Astra/high 一次只读审查本次实际合并范围，主代理按意见登记修订；范围变化再建新批次。
3. Terra/high 仅做批准的测试修正；聚焦测试、完整 `corepack yarn check`、必要路径断言及文档门禁通过。GUI、完整物化、安装包或发布不作为这次 Git 操作自动启动的副线。
4. 明确 stage allowlist，检查 staged diff 和凭据扫描，提交并推送当前开发分支，创建/附加 PR；记录审查结论和准确测试结果。
5. 查询 PR 检查及实际要求；所有适用必需门禁通过后以保留提交的 merge 方式合并。若远端发生变化先重新对照；不使用 --admin 或 force push。
6. fetch 并验证预期提交在 origin/main 可达；本地 main 安全快进到远端并切换，不覆盖用户残余文件。完成默认分支确认后删除此已合并临时分支，不处理其他历史分支。

## 风险和回滚

macOS symlink 和公共物化风险已经记录，当前用户暂不处理；本工作包不声称其已修复。Windows 完整 packaged-runtime 验收仍待完成，合并源码不等于发布产品。若远端 CI 要求这些制品检查且失败，不假装通过，也不私自跳过。

合并前可关闭未合并 PR并保留分支；提交前按本 run 的 pre-snapshot 精确恢复本次测试改动，保留此前 dirty 资产。合并后需要回滚时创建 revert PR，不改写 main 历史。运行中的窗口、用户数据、输入 runtime 和历史证据不参与回滚。

## 只读审核与重新冻结

Astra/high 只读结论为 `approved-with-changes`。r106 生产修复未发现需扩大的阻断问题；必须完成 host-path 测试修正、唯一 fixture 自建清理、规则测试接入及本次完整门禁。审核发现 r113 初始快照之后登记工作包时，DESIGN/PLAN/索引三文件发生预期文档增量，因而旧快照不再精确；停止旧 run，保留原始快照及差异，以 r114 在文档登记完成后重新冻结。产品范围不变，按审核意见修订不触发第二次全面审查。

fixture 默认放在仓库同级 `<项目名>-runs`，无环境变量也能执行；每次只清理自身唯一子目录，不清空调用方指定根目录。此前 main 的 CI 已在变更分类阶段失败，需核对原因及本次 PR 的实际门禁；不能将历史失败直接算成本次通过。

r114 已仅修改登记的三个测试相关文件，语法/JSON 检查通过。Terra 生成回执时调用 Node→Git 子进程遭 EPERM，原记录保留并停止该 run；主代理最小只读验证确认 Node spawnSync Git 返回 EPERM，而直接 Git 可执行，不归为产品故障。r115 接管回执与验证；需要子进程和同级 fixture 的检查使用获准的工具权限，生产及 Git 合并范围保持不变。

历史 main CI 的确切失败是 README.i18n.yaml 的 README blob 记录过期；本分支既有提交 53edba76ce 已修正。后续仍以本次实际检查结果为准。

## 本次实际本地验证

- Windows package 聚焦测试：7/7 通过，退出码 0。
- hardlink-limit 聚焦 node:test：2/2 通过，退出码 0；默认唯一 fixture 创建后已清理。
- `corepack yarn check`：退出码 0，包含文档/布局/版本门禁、Desktop 构建、类型检查、Vitest 166 通过/1 跳过，以及 node:test 23 通过/1 跳过；新增 hardlink-limit 两项确认在完整命令中执行。
- `git diff --check`：退出码 0；CRLF→LF 提示来自既有 gitattributes，不属于测试失败。
- 原始命令/退出码和日志位于 r115；这些本机原始材料不提交。稳定报告及 MIT 参考快照纳入本次提交，未引用截图和运行/生成目录保持本地。
- 此处只记录本地门禁；PR 和默认分支合并结果以 GitHub PR 的最终状态及其实际检查为准，不预先标记已合并。
