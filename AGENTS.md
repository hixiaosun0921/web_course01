# 项目说明

学生选课系统（课程设计）。文档见 `文档/`，界面参考见 `resource/`。

## 原型文件只读约定（重要）

- `原型/选课界面.html` 仅供参考，**禁止在该文件上做任何增、删、改**。
- 后续所有代码（前端、后端、测试等）一律新建文件或目录实现，不得以修改该原型的方式推进。
- 如需调整界面或交互，请在新工程目录中按《系统设计文档》的技术选型重新实现（Vue 3 + Spring Boot + PostgreSQL）。
- 该原型为单文件原生 JS + 内存 mock 数据，仅用于演示视觉与交互，不承载真实业务逻辑。

## 工程结构与运行（前后端分离）

| 目录 | 说明 | 运行方式 |
| --- | --- | --- |
| `frontend/` | Vue 3 + Vite 纯前端（无 mock、无内置服务端） | `npm install` → `npm run dev`（默认 <http://localhost:5173>，`/api` 代理到后端） |
| `backend/` | Spring Boot 3.5 + MyBatis + PostgreSQL，可独立编译运行 | `.\mvnw.cmd package` → `java -jar target/course-select-api-1.0.0.jar`（默认 8080） |

- 本机数据库：免安装 PostgreSQL 17，管理脚本 `backend/tools/db.ps1`（init / start / stop / status / createdb / psql）
- 种子数据：`node backend/tools/generate-seed.mjs` 读取仓库根目录两个 txt，生成 `backend/src/main/resources/db/data.sql`
- 应用启动时自动建表并幂等导入种子数据（`spring.sql.init`），学生初始密码统一 `123456`
- 测试：后端接口 `node backend/tools/api-smoke-test.mjs`；前端端到端 `cd frontend && npm run test:e2e`
