# r74 打包与显示补丁经验归档

日期：2026-11-15（Asia/Shanghai）
范围：固定 DSH `0.2.1-rc.5`、Windows、AI专家办事大厅显示补丁
性质：源码事实、实验结果、错误分诊和后续门禁

## 结论

当前需求只是确认显示修改是否正确，因此完整 Desktop 打包不是第一步。最小验收链是：固定 rc.5 目标哈希 → staging/materialized receipt → Electron 加载 materialized runtime → 实际 UI 检查。完整 `package:dir`、安装包和发布门禁属于后续发布阶段。

完整打包仍有一个独立价值：它能证明 Electron Builder 把 runtime 复制到 `resources/workdsh-runtime` 后，路径、Junction、Native Node 和 Host 依赖仍然成立。staging 验收通过不能代替这项发布边界验收。

## 已验证的失败与教训

| 批次 | 现象 | 根因/事实 | 后续规则 | 证据 |
| --- | --- | --- | --- | --- |
| r74-001/002/003 | 全树 SHA manifest 长时间无回执 | 官方 runtime 约 970 MB、41822 文件；Windows 逐文件哈希 I/O 不适合作为第一层门禁 | 先用 hardlink/只读 vendor copy 和目标文件 SHA；不要在旧 run 原地重试 | [`r74-003 分诊`](../.runs/r74-ai-expert-branding-staging-20261115-003/failure-triage-r74-hash-size.json) |
| r74-004 | `mkdir staging/workdsh-runtime` 返回 `EEXIST` | pre-snapshot 预创建了空 leaf，而脚本也尝试创建 leaf | 允许空 leaf 后由脚本重建；非空目录必须 fail closed | [`r74-004 分诊`](../.runs/r74-ai-expert-branding-staging-20261115-004/failure-triage-r74-eexist.json) |
| r74-005 | `fs.link` 对 `acp.d.ts` 返回 `EPERM` | pnpm store 文件已有多个硬链接并受只读 ACL 保护；fixture 本身能创建 hardlink/Junction | 仅 `EPERM+nlink>1` 允许登记 copy fallback；`EXDEV`、`EACCES`、`nlink<=1` 仍失败 | [`r74-005 分诊`](../.runs/r74-ai-expert-branding-staging-20261115-005/failure-triage-r74-readonly-hardlink.json) |
| r74-006 | staging 成功 | 8255 hardlinks、33565 vendor copies、3752 Junction mappings、2 个物理目标补丁 | receipt 必须记录 counts、source/staging manifest 和目标 SHA | [`r74-006 receipt`](../.runs/r74-ai-expert-branding-staging-20261115-006/display-patch-receipt.json) |
| r74-007 | receipt digest mismatch | 生成器哈希规范化 JSON，验证器哈希格式化文件原文 | manifest digest 必须对解析后的规范化数组计算 | [`r74-007 分诊`](../.runs/r74-ai-expert-branding-staging-20261115-007/failure-triage-r74-receipt-digest.json) |
| r74-007 | Desktop build 拒绝 tray 颜色 | 下游 Windows 图标生成器固定要求 `#176BFF`，学院 mark 源色是 `#2458A6` | UI 学院资源可保留原色；native tray 生成链必须显式转换到固定系统色 | [`r74-007 build 分诊`](../.runs/r74-ai-expert-branding-staging-20261115-007/failure-triage-build-tray-color.json) |
| r74-008 | two-seam verifier 拒绝合法组合哈希 | 旧 verifier 只接受 `F7C22...`，不知道 frame patch 叠加 display patch 后的 `E0C7...` | 已登记的组合哈希必须显式加入 verifier，不能放宽为任意字节 | [`r74-008 分诊`](../.runs/r74-ai-expert-branding-staging-20261115-008/failure-triage-packaged-frame-case.json) |
| r74-009 | 打包后 Junction 指向 `.runs/.../staging` | Electron Builder 会保留 Windows Junction；staging 可运行不等于 packaged resources 自包含 | 发布打包前增加 materialized regular-only runtime，并在包内扫描 realpath/reparse | [`r74-009 分诊`](../.runs/r74-ai-expert-branding-staging-20261115-009/failure-triage-packaged-junction-escape.json) |
| v9/v10 materialization | 递归 manifest 栈溢出 | 展开 pnpm Junction 后树深度超过递归调用栈 | 深层 runtime 遍历必须使用显式 stack；materialized v10 生成 261381 个 regular files | [`v9 分诊`](../.runs/r74-package-materialization-v9-20261115-001/failure-triage-manifest-stack.json)、[`v10 receipt`](../.runs/r74-package-materialization-v10-20261115-001/materialized-receipt.json) |
| v10 package | afterPack 内 bundled Node `spawnSync` 返回 EPERM | 品牌/realpath/Hash 门禁已通过；打包结束后同一 Node 手工 `--version` 返回 0，属于 Windows 时序/句柄待验证问题 | 当前显示验证不依赖该发布门禁；正式发布时单独复现并保留进程/句柄证据 | [`v10 packaged Node 分诊`](../.runs/r74-package-materialization-v10-20261115-001/failure-triage-packaged-node-eperm.json) |

## 当前推荐的验证分层

1. 目标文件和 receipt：验证页面标题、Hero 标题的固定 before/after SHA、materialized output 无 reparse、目标 occurrence 全部命中。
2. Electron 运行：使用当前源码构建的 `apps/desktop/lib` 和 materialized runtime 启动，不执行 installer、签名或发布流程。
3. UI：检查窗口标题、`document.title`、侧栏名称/图标、Hero 名称/图标，以及 `pXSMma_previewBadge` 的 computed style 和布局。
4. 发布前：再执行 `package:dir`、Native Node/Host smoke、安装包和插件安装/移除重启持久性验收。

## 回滚与引用规则

- 删除某个 run 的 materialized/staging 目录和 build pointer，不修改 `build/workdsh-runtime` 源目录。
- 每次真正失败、超时、路径越界或进程残留必须保留原命令、工作目录、退出码、stderr、进程状态、输入/输出路径和哈希，并换新 runId。
- 新报告、分诊和 receipt 必须回写 [`docs/RESEARCH_INDEX.md`](RESEARCH_INDEX.md)；长期结论写入 `DESIGN.md`/`PLAN.md`，一次性输出留在 `.runs`。
