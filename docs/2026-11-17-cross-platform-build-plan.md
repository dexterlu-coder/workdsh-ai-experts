# 本轮构建修改的跨平台兼容方案

日期：2026-11-17。性质：源码审查与待实施方案。状态：`proposed / not-implemented`。当前仅整理方案，不变更构建源码或已运行窗口。关联历史：r90 测试同步、r106 硬链接上限修复、r109 Windows 检查。

## 目标与判断

2026-11-17 r112 进一步核对：[P01—P20 当前契约对照](2026-11-17-current-platform-contract-comparison.md)及[Windows 流程/路径地图](2026-11-17-current-windows-packaging-map.md)。本轮 75 个相关路径已固定当前 dirty 输入哈希。静态确认新增文件 symlink 拒绝与原版契约冲突、共享入口强制物化、无条件大小写归一化及 start/builder 前置差异。Linux Desktop 是原版缺口，不能默认为本次要补的发布能力。下列旧 allowlist/方案仅保留为历史提案，**尚未覆盖当前发现，不可直接进入实施**；新设计需先确定链接/大小写/物化和输出路径边界，再按标准流程审核。本轮没有启动源码修改。

2026-11-17 补充：已按用户要求完成[二次开发前基线比较](2026-11-17-original-baseline-platform-comparison.md)，对应 r110。新增发现包括公共 macOS 构建链被接入物化、文件 symlink 契约冲突及无条件大小写归一化。下述原有最小范围不足以覆盖这些发现；实施前需以基线报告修订设计和 allowlist 并重新审核，不能直接按旧范围开工。

修正本轮引入的跨平台测试问题，将 Windows 故障修复收敛到实际所需边界，并通过对应平台的检查证明兼容性。目标不是建立第二套构建系统，也不是新增 Linux Desktop 支持。

源码事实：`package-win.ts` 使用当前执行系统的 `node:path.join`；`package-win.spec.ts` 的 3 处新增 `--config` 期望写死 Windows 反斜杠。Windows 本机匹配；POSIX 主机执行该测试夹具时会生成混合分隔符，与期望不匹配。Windows 上测试通过不能证明其他主机也通过。

源码事实：新 hardlink-limit 判定含 `platform === 'win32'`，但当前补丁的 `COPYFILE_EXCL`、额外 stat、回执 reason/重复路径校验位于共享流程。不能以一个平台判断推导整批修改对其他系统行为不变。

本项目已有 Linux 无头检查、Windows Desktop 和 macOS Desktop CI，见 `.github/workflows/ci.yml`。优先复用这些门禁，不另起构建体系。

## 方案

1. **修测试的路径假设。** 用测试夹具的 `desktopRoot` 及标准 `path.join` 形成配置路径期望，与 macOS 测试现有写法一致；不以生产函数返回值生成 expected，不只为通过测试而修改实际打包命令。继续检查参数的值、位置和只出现一次，保留签名凭据隔离断言。
2. **收窄运行行为变化。** 保留原有 EPERM 复制路径；新 stat、阈值判断、独占复制、哈希与身份验证限定于 Windows 链接上限分支。其他平台、未知错误码、未达到阈值、身份改变均不得进入新分支。没有本次故障依据的共享行为加严不混入此批；若确需保留，单独列明兼容性理由和测试。
3. **兼容原回执。** 旧 `EPERM+nlink>1` reason 按原契约验真；新 `win32-hardlink-limit` reason 必须包含失败时平台、错误码、nlink、源身份、长度和 SHA-256。未知 reason 仍拒绝。不得将源/目标身份验证弱化为仅校对文件长度。
4. **分层验证。** 本机先聚焦路径/参数和新 fallback 的正反例，再运行完整 check；用 POSIX 与 Windows 路径例子说明字符串契约，但不把模拟结果当成 macOS 实机通过。随后复用既有 Linux/macOS/Windows CI，记录各自结果；macOS 和 Windows 实际打包验收依其现有流程，避免把每次纯测试修改都升级为耗时完整安装包构建。

## 待实施范围与门禁

- 默认 allowlist：`apps/desktop/tests/package-win.spec.ts`、两个物化/验真脚本及其新增规则测试、关联设计/计划与证据文档。
- 不修改：业务功能、专家/Skill 资产、官方 DSH 文件、生产打包命令参数、用户目录、依赖版本、lockfile 和全局系统配置。现有 dirty 文档及图片保留。
- 实施前：按仓库标准流程登记新批次、输入哈希和 pre-snapshot，完成 Astra/high 审核后由 Terra/high 实施；已有历史通过结果仅作输入，不当新修复验收。
- 验收：3 个新增路径期望可在 Windows/POSIX 主机运行；Windows 上限正例接受，其他平台和非法证据拒绝；旧 EPERM 契约保持；完整无头检查及实际可用平台 CI 通过。无原生平台或尚未触发 CI 时标明未验证，不称跨平台已完成。
- 回滚：只恢复本批 allowlist 的修改；不使用全仓 reset，不撤销此前品牌/专家功能，不停止已成功的 r108 窗口。
- 合并：经过评审的 PR 和必需检查后才进入 main。验证分支内未完成的物化资产不能被描述为已验证发布修复。

## 参考

- [本轮全过程报告](2026-11-17-build-process-report.md)：源码启动与安装包边界及实施不足。
- [硬链接修复记录](2026-11-17-materialize-hardlink-limit-r106.md)：已实施规则、测试和实际物化尚未完成的限制。
- [DESIGN](../DESIGN.md)、[PLAN](../PLAN.md)：当前有效产品边界与实施记录。
