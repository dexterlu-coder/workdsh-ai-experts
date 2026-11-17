# Profile 安装网络诊断

日期：2026-11-17；性质：本机实验结果；关联 runId：`r99-network-probe-20261117`、`r100-profile-http-20261117-001`。输入提交 `aee688b755bb03747ebc6e5227768285bfa80d0e`。

此前镜像、离线缓存及认证边界失败保留在 [完整构建报告](2026-11-17-full-build-validation.md)，不因续跑而覆盖。

本机实验：npm 官方 registry 探针成功；同一 registry 的 pnpm 11 元数据请求在 `proxy_on` 的 SOCKS5 配置下报告 `ERR_PNPM_META_FETCH_FAIL`，在同一 127.0.0.1:10808 端口改为 HTTP 代理后返回 `4.0.5`。该比较支持代理协议与 pnpm 请求失败有关，不证明所有网络故障均由此造成。原始输出分别见 [SOCKS 探针](../.runs/r99-network-probe-20261117/probe-r2.log) 和 [HTTP 探针](../.runs/r99-network-probe-20261117/probe-http.log)。

`r100` 使用无凭据的独立 npm 配置以及 HTTP 代理完成 Profile 安装，退出码 0，[原始日志](../.runs/r100-profile-http-20261117-001/prepare.log)记录结果。r108 staging UI 后续实际通过，packaged runtime 仍待验收，见 [启动报告](2026-11-17-current-source-startup-r108.md)。配置不包含登录凭据，不修改用户配置。计划和回滚边界见 [PLAN.md](../PLAN.md) 与 [DESIGN.md](../DESIGN.md)。
