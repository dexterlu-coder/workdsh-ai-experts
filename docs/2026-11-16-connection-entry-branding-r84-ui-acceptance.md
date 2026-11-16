# Desktop 入口页面品牌 r84 验收

日期：2026-11-16（Asia/Shanghai）
材料性质：实验结果、源码事实、稳定验收证据
批次：`r83-connection-entry-branding-20261116-001`
成功运行：`r84-connection-entry-branding-ui-20261116-001`
源提交基线：`2dc6a100d2d16284c981e8a545b87d63f08b16dc`

## 实施结果

- `apps/desktop/src/connection-entry.ts` 集中定义 carrier 静态品牌 header，使用学院建筑 inline SVG 和 `#2458A6`。
- 选择使用方式、个人/企业启动等待和企业登录页的静态标题与品牌均统一为“AI专家办事大厅”；共享 header 传播不改变企业协议或行为。
- `apps/desktop/tests/connection-entry.spec.ts` 增加页面标题、品牌文字、SVG、旧品牌占位符和安全边界断言。
- `workdsh-main.ts`、官方 DSH runtime、Electron 二进制、入口协议、CSP、表单、转义、加载动画和用户数据未修改。

## r84 实际窗口证据

运行根目录：`D:\project\codex\workdsh\r84-connection-entry-branding-ui-20261116-001`。运行复用了已校验 Electron 和稳定 runtime，只隔离 user-data、DSH_HOME、临时目录、日志、端口和进程；只复制小型 Profile/package-cache 测试输入。

1. 选择使用方式页面：窗口原生标题为“AI专家办事大厅”；卡片顶部显示学院建筑图标和“AI专家办事大厅”；个人使用按钮、企业输入框和插件提示保持可用。
2. 点击“个人使用”后，正在启动个人工作区页面显示同一学院图标和标题，加载提示与 spinner 正常。
3. 启动随后进入主界面；侧栏、原生 Conversation、Composer、专家/技能/连接器入口仍可见，证明启动链路没有被品牌修改破坏。
4. Electron UI 进程仍存活，Host `127.0.0.1:3080` 可连接；wrapper PID `31200`，Electron PID `11396`。

## 版本与哈希

- `apps/desktop/src/connection-entry.ts` SHA-256：`D9F92D9421171E9C4D3C0CA61DE665C40B926EC3BD77AE2A4DF95246C65FD9DD`。
- 派生 `apps/desktop/lib/workdsh-main.js` SHA-256：`147C4211188433A8462E598C0BE7C72AA1754B7F356677A43EC8F7C5911AB5B9`。
- 只读输入 `packages/ui/assets/mark-blue.svg` SHA-256：`A78F2B4D1A7B576E12A6BF0AFB86108C2F65D671CEA32E005CF83119F654D757`。
- Electron 43.3.0 SHA-256：`31A0176B7C1A81CF379E55E109C57A56493A4D4A9E9B0D2475A678FD7DF234DC`。

## 检查与分诊

- Desktop 类型检查通过。
- `connection-entry.spec.ts` 通过：4 tests passed。
- `git diff --check` 通过。
- SVG 输入与 inline SVG 关键路径/色值核对通过。
- r83 首次 UI run 曾显示字面量 `${BRAND_NAME}`；根因、影响和停止信息保存在 `D:\project\codex\workdsh\r83-connection-entry-branding-ui-20261116-001\failure-triage.json`。修复后按规则换用 r84，未在原 run 上盲目重试。

## 结论与回滚

状态：`completed / current-source-ui-accepted`。两个目标页面的品牌修改和实际窗口验收均通过。回滚只恢复 `connection-entry.ts`、对应测试和本批次文档/证据，不触碰官方 runtime、Electron、主界面品牌和专家资产。
