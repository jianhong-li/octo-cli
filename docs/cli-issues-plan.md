# CLI 修复计划与验收记录

本轮来自 `kanyun-inc/octo-cli` 中 jianhong-li 提交的 12 个 open issues，代码基于 v1.6.0，在 `feature/cli-issues-and-help` 上迭代，推送目标是 `jianhong-li/octo-cli`。当前不向源仓库提交 PR，也不改主 skill 或子 skill 的组织。

## 工作边界

CLI 的 help 承担命令、参数、默认值、限制、示例和输出契约；skill 后续只补最佳实践和任务工作流。无需额外依赖、skill 安装或项目初始化即可查询。保留原有命令与 JSON 响应结构，JSONL/table 修正为记录输出。

## 实施顺序

1. 参数与错误处理：RUM 环境、统一时间解析、Issue source 校验、环境/枚举/数值校验和干净的失败输出。
2. 分页与能力补齐：已由 client 支持的游标、方向、sort 值、排序、topology 入口过滤。
3. 聚合可信度：分组缺失提示、group limit 上限、分析字段语义。
4. 自解释 help：根命令、命令组、所有叶子命令，提供实际默认值、值域、示例和限制。
5. 回归测试、typecheck/lint/test/build、真实进程输出验证、changeset、提交到 fork feature 分支。

## Issue 对照

| Issue | 本轮处理 | 验证入口 |
| --- | --- | --- |
| [#47](https://github.com/kanyun-inc/octo-cli/issues/47) | JSONL 每行记录，table 按记录列显示，JSON 保留原始包装，分页提醒在 stderr | `src/output.test.ts` |
| [#48](https://github.com/kanyun-inc/octo-cli/issues/48) | 文档说明日志 record id 游标；Trace、LLM、RUM、事件暴露 client 支持的 scroll 参数 | `src/cli-regressions.test.ts` |
| [#49](https://github.com/kanyun-inc/octo-cli/issues/49) | RUM detail 增加显式/默认 env，CLI 和内置 MCP 都携带参数，记录 id 做 URL 编码 | `src/cli-regressions.test.ts`、`src/mcp.test.ts` |
| [#50](https://github.com/kanyun-inc/octo-cli/issues/50) | `--at` 与范围时间共享 epoch ms/seconds/ISO 解析，非法输入在 HTTP 前失败 | `src/time.test.ts`、`src/cli-regressions.test.ts` |
| [#51](https://github.com/kanyun-inc/octo-cli/issues/51) | 非法环境报错；孤立 `--to` 报错；`alerts -s all` 是明确别名；有数据但未返回请求分组时警告 | `src/aggregate.test.ts`、`src/cli-regressions.test.ts` |
| [#52](https://github.com/kanyun-inc/octo-cli/issues/52) | async 顶层错误捕获、单行 stderr、退出码 1；`--json-errors` 保留 HTTP status/API code | `src/errors.test.ts` |
| [#53](https://github.com/kanyun-inc/octo-cli/issues/53) | assign/update 共用 log/rum 校验，shared client 也保护非 CLI 调用者 | `src/cli-regressions.test.ts` |
| [#54](https://github.com/kanyun-inc/octo-cli/issues/54) | 补 topology filters、scroll/sort；额外暴露 services list 的 service filter。Issue search 分页尚无可确认接口参数，见下方限制 | `src/cli-regressions.test.ts` |
| [#55](https://github.com/kanyun-inc/octo-cli/issues/55) | 主 skill 工作流重构留到第二阶段；本轮 events help 已提供具体变更事件类型 | 后续 skill 验收 |
| [#56](https://github.com/kanyun-inc/octo-cli/issues/56) | 分析字段、group probe、操作/类型、JSONL、字段实名语义移入 help；主 skill 的本地路由留到第二阶段 | help 覆盖测试；后续 skill 验收 |
| [#57](https://github.com/kanyun-inc/octo-cli/issues/57) | 全命令层级 help；叶子参数值域、真实默认值、实例、语义、API 限制和完整手册入口 | `src/cli-regressions.test.ts` |
| [#58](https://github.com/kanyun-inc/octo-cli/issues/58) | 产品/协议手册与操作 skill 的目录分层留到第二阶段 | 后续 skill 验收 |

## 明确的接口限制

- **Issue search 分页**：`src/client.ts` 的 `issuesSearch`、现有 OpenAPI 手册和托管 OCT-MCP 都没有 limit/page/scroll 参数；不能假设添加字段后就能分页。help 说明当前限制及缩小查询窗口的办法。等待后端源码或新接口契约再完成 #54 的这一项。
- **分组缺失**：可能是字段不可分组，也可能是当前匹配记录不含此字段。因此使用警告而非认定字段非法；已知零条总计和空数组不告警。不额外请求巨大的字段目录，目录成员也不能证明可分组。
- **服务端掩盖故障**：HTTP 失败/API 非零 code 可靠报错；若服务端输出 code=0 的正常空响应，CLI 无法区分内部故障与真实零命中。不声称修复了 #42 的所有后端行为。
- **限流**：本轮文档化 HTTP 429/API -17，但不自动重试，尤其避免重放写操作。
- **线上验证范围**：本轮使用网络 IO mock 与本地 HTTP 服务验证请求和实际 CLI 输出，不对生产数据执行写入。线上跨页结果的完整性仍取决于后端游标实现。

## 第二阶段方向

把主 skill 收敛为短的 CLI 使用/工作流指导：从用户给出的错误/告警/日志/trace id 进入，固定时间窗与环境，确认错误签名，再看 Pod/实例分布和变更时间线；仅证据需要时扩展链路/拓扑。移除必跑的全项目 onboarding、固定宏观巡检路径和重复的 flag 清单。产品/协议参考与操作工作流分层，必要参考通过本地相对链接发现。具体实现留待第一阶段验收后进行。

## 本轮验证

- `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` 全部通过；9 个测试文件，229 个测试（原有 171 个，新增 58 个）。
- 构建后的真实 CLI 通过本地 HTTP 服务验证：无认证/请求的 help、JSONL 逐记录、JSON 包装和游标透传、RUM detail env、metric epoch 参数、API 错误的普通/JSON stderr、HTTP 前非法环境校验、嵌套命令解析错误的退出码和 JSON 格式。
- 真实进程验收发现 Commander 的子命令需要分别设置退出捕获器；已修正并增加嵌套解析错误回归测试。
- `git diff --check` 通过；包含 minor changeset，不手动修改版本号。
