# CLAUDE.md

> 请始终使用简体中文与我对话，并在回答时保持专业、简洁

## 项目概述

Pity 前端 — Pity API 测试平台的 React 前端项目。基于 UmiJS v4 (`@umijs/max`)、Ant Design v5、Ant Design Pro Components 构建。后端为 Python FastAPI 应用，目录在 `../backend/`，日志系统在 `../backend/logs/` 目录下。

## 开发命令

```bash
npm run start:dev        # 启动开发服务器 (localhost:8000, 代理到后端 :7777)
npm run build            # 生产构建
npm run lint             # 完整 lint (ESLint + Prettier + TypeScript 检查)
npm run lint:fix         # 自动修复 ESLint 问题
npm run test             # 运行 Jest 测试
npm run test:coverage    # 运行测试并生成覆盖率报告
npx tsc --noEmit         # 仅类型检查
```

## 技术架构

### 框架与构建

- **UmiJS v4** + `@umijs/max` 预设 — 处理路由、状态管理(dva)、请求、构建
- **无 `.umirc.ts`** — 配置拆分到 `config/` 目录 (routes, proxy, defaultSettings)
- **路径别名**: `@/*` → `src/*`, `@@/*` → `src/.umi/*`

### 请求层（双系统并存）

1. **`@umijs/max` request** — 配置在 `src/app.tsx` → `src/requestErrorConfig.ts`（基于 Axios，带拦截器）
2. **`umi-request`** — 自定义封装在 `src/utils/request.js`（大部分 service 文件使用）

大多数 service 文件使用 `umi-request` 封装，通过 `import request from '@/utils/request'` 引入，手动通过 `auth.headers()` 附加认证头（来自 `src/utils/auth.ts`）。

### 认证机制

- JWT token 存储在 `localStorage`，key 为 `pityToken`
- 每个 service 调用手动注入认证头: `headers: auth.headers()`
- 401 响应触发重定向到 `/user/login`（`src/utils/auth.ts` 处理）
- 初始用户状态在 `src/app.tsx` → `getInitialState()` 中获取

### 状态管理 (dva models)

`src/models/` 中的模型遵循 dva 模式: `namespace`, `state`, `reducers`, `effects`。通过 `useModel('modelName')` hook 访问。

核心 model:

- `auth.ts` — 认证状态
- `testcase.js` — 测试用例 CRUD（最大的 model）
- `testplan.js` — 测试计划管理
- `project.js` — 项目状态
- `constructor.js` — 构造器/断言类型
- `notice.ts` — 通知消息
- `recorder.js` — 用例录制
- `gconfig.js` — 全局配置

### 获取项目列表

**推荐方式**：使用自定义 hooks（Phase X 新页面采用）

```javascript
import { useProject } from '@/utils/useProject';

const { projects } = useProject(); // 内部自动调 API 加载数据
```

> 原因：`useModel('project')` 依赖 dva model 初始化时机，新页面用此方式可能导致 projects 为 undefined。`useProject` hook 直接调 service，不依赖 dva model 状态。

**旧方式**：使用 dva model 全局状态

```javascript
import { useModel } from '@umijs/max';

const { projects } = useModel('project'); // 需要 model 已初始化才能拿到数据
```

**直接调用 service**：备选方式

```javascript
import { listProject } from '@/services/project';

// 注意：listProject 返回的 res.data 是数组，不是 {list: [], total: ''} 对象
const res = await listProject({ page: 1, size: 10000 });
if (auth.response(res)) {
  const projects = Array.isArray(res.data) ? res.data : [];
}
```

### 路由

定义在 `config/routes.ts`。路由使用懒加载（字符串组件路径如 `'./ApiTest/TestCaseDirectory'`）。通过 `authority` 属性控制角色访问。详情/编辑页从菜单隐藏 (`hideInMenu: true`)。

主要路由结构:

| 路径           | 说明                 | 权限             |
| -------------- | -------------------- | ---------------- |
| `/user/login`  | 登录                 | 公开             |
| `/dashboard/*` | 工作台、统计         | 已登录           |
| `/project`     | 项目管理             | 已登录           |
| `/apiTest/*`   | 接口用例、录制、计划 | 已登录           |
| `/record/*`    | 构建历史、测试报告   | 已登录           |
| `/config/*`    | 环境、变量、数据库   | admin/superAdmin |
| `/system/*`    | 系统设置、用户管理   | superAdmin       |
| `/tool/*`      | HTTP/SQL/Redis       | 已登录           |
| `/mock`        | Mock 配置            | 已登录           |
| `/datafactory` | 数据工厂             | 已登录           |

### API 代理

`config/proxy.ts` 在开发模式下将所有 API 前缀代理到 `http://0.0.0.0:7777`: `/api/`, `/auth/`, `/testcase/`, `/config/`, `/project/`, `/operation/`, `/workspace/`, `/oss/`, `/notification/`, `/online/`, `/request/`

### 关键配置文件

- `config/defaultSettings.ts` — 布局主题、主色、API/WS 地址、应用标题
- `src/consts/config.ts` — 所有应用常量（角色、优先级、断言类型、用例状态、构造器类型、布局配置等）

## 项目结构

```
src/
├── app.tsx                    # 应用入口、getInitialState、layout 配置
├── requestErrorConfig.ts      # @umijs/max 请求错误处理配置
├── access.ts                  # 权限控制
├── consts/config.ts           # 全局常量
├── models/                    # dva 状态管理
│   ├── auth.ts, testcase.js, testplan.js, project.js
│   ├── constructor.js, notice.ts, recorder.js, gconfig.js
│   └── ...
├── services/                  # API 请求服务（umi-request 封装）
│   ├── auth.ts, user.js, project.js, testcase.js
│   ├── testplan.js, configure.js, online.js
│   └── ...
├── pages/                     # 页面组件（镜像路由结构）
│   ├── ApiTest/               # 接口测试（用例、录制、计划、录制）
│   ├── Dashboard/             # 工作台
│   ├── BuildHistory/          # 测试报告
│   ├── Config/                # 测试配置（环境、数据库、Redis等）
│   ├── Manager/               # 后台管理
│   ├── Tool/                  # 实用工具（HTTP/SQL/Redis）
│   ├── User/                  # 登录
│   └── datafactory/           # 数据工厂
├── components/                # 共享组件
│   ├── TestCase/              # 测试用例相关
│   ├── Project/               # 项目相关
│   ├── PityForm/              # 自定义表单
│   ├── CodeEditor/            # 代码/JSON编辑器
│   ├── Table/                 # 表格组件
│   ├── Tree/                  # 树形组件
│   └── RightContent/          # 右上角用户信息
└── utils/
    ├── auth.ts                # 认证工具（token、401处理）
    ├── request.js             # umi-request 封装
    └── ...
config/
├── routes.ts                  # 路由定义
├── proxy.ts                   # API 代理配置
├── defaultSettings.ts         # 布局/主题/URL 配置
└── config.ts                  # 其他 UmiJS 配置
```

## 编码规范

### Service 模式

`src/services/` 中的 service 文件导出 async 函数，调用方式:

- URL 拼接: `${CONFIG.URL}/endpoint`
- 传入 method、data/params、auth headers
- 响应格式: `{ code: number, data: any, msg: string }`，`code === 0` 表示成功

### 页面组件

页面位于 `src/pages/`，镜像路由结构。标准 CRUD 界面使用 Ant Design Pro 组件 (ProTable, ProForm, ProList)。共享组件位于 `src/components/`。

### 状态管理迁移策略

项目现有 dva model（`namespace`/`reducers`/`effects`）继续保留，不做迁移

```typescript
// 新 model 示例: src/models/newFeature.ts
import { useState, useCallback } from 'react';

export default function useNewFeature() {
  const [list, setList] = useState([]);
  const fetchList = useCallback(async () => {
    /* ... */
  }, []);
  return { list, fetchList };
}
```

两种风格通过 `useModel('name')` 统一消费，可共存无需配置改动。

### 语言

项目使用 **JavaScript** (`.js/.jsx`)，新文件统一使用 JavaScript，旧文件不需要动。

### 日期处理

使用 `moment`（非 dayjs）。

### Ant Design v5 Dropdown 注意

Dropdown 组件的 `menu` prop 在 v5 中期望 config 对象，传递 React 组件需用 `overlay` prop：

```jsx
// ✅ 正确
<Dropdown overlay={<Menu>...</Menu>}>

// ❌ 错误
<Dropdown menu={<Menu>...</Menu>}>

// ✅ 正确
<PageContainer title={false} breadcrumb={null}>

// ❌ 错误
<PageContainer  breadcrumb={{}}>
```

### 前端显示原则

后端返回的数据字段，前端按需取用显示，不在后端数据上做删减。前端负责控制展示内容。

### 代码注释原则

注释掉的代码（`{/* ... */}` 或 `// ...`）必须保留，不删除。

### 可选链原则

访问可能为 `null`/`undefined` 的对象属性时，使用可选链 `?.` 防止报错：

```javascript
// ✅ 使用可选链
const value = editor?.aceEditor?.editor?.getSelectedText();

// ❌ 不使用可选链
const value = editor.aceEditor.editor.getSelectedText(); // 可能报错

// ❌ 错误使用
useEffect(() => {
  fetchData();
}, [fetchData]);

// 你需要立即判断：
// 1. fetchData 是否用 useCallback 包裹了？
// 2. 如果没有，这会导致无限请求循环
// 3. 这是 AI 最常犯的 React 错误之一
// ✅ 使用可选链
const fetchData = useCallback(async () => {
  const res = await api.getData(params);
  setData(res);
}, [params]);
useEffect(() => {
  fetchData();
}, [fetchData]);
```

### 问题解决原则

发现问题后，先解释清楚**原因**，再给出**解决方案**，让用户理解问题所在。

### 常见问题排查

| 问题 | 原因 | 解决方案 |
| --- | --- | --- |
| `缺少参数: token` | UmiJS 代理路径错误或 `pityToken` 未存入 localStorage | 检查 `config/proxy.ts` 是否包含对应前缀，确认用户已登录 |
| `缺少参数: requirement_id`（文件上传） | `auth.headers()` 默认加 `Content-Type: application/json`，FastAPI 无法解析 multipart | 改用 `auth.headers(false)` 跳过 JSON content-type |
| 后端返回 `code: 0` 但前端数据为空 | 后端返回 `data: []`，前端可能用 `res.data?.list` 取值 | 按后端实际返回结构取值，本项目后端直接返回 `data` 数组 |
| 左侧列表不更新 | `currentId` 未重置或 `fetchList` 依赖项遗漏 | 切换项目时 `setCurrentId(null)` 并清空文件列表 |

## 重要规则

1. **不要修改 2025-10-12 之前编写的代码** — 优先创建新文件。如需修改旧代码，需征得同意。
2. 前端开发服务器运行在 `localhost:8000`，后端 API 运行在 `localhost:7777/7778`。
3. `localStorage` 中的 `pityToken` 是 JWT token 的 key。
4. 后端 FastAPI 应用的根目录在 `../backend/`。
5. 路由 icon 使用 Ant Design Icon 名称（如 `dashboard`、`api`、`tool`）。

## 开发阶段

- [x] Phase 1-5: 后端全部完成
- [ ] Phase 11: 前端集成 AI（进行中）

## 工作方式

### 模式选择

| 模式         | 命令                 | 说明                                    |
| ------------ | -------------------- | --------------------------------------- |
| **严格模式** | "pity 前端：" + 任务 | 触发 pity-frontend-patterns，按规范执行 |
| **直接模式** | "直接模式" + 任务    | 不触发技能，自由发挥                    |

### 严格模式

```
"pity 前端：帮我创建用户列表页面"
"Pity frontend：用 TDD 写前端测试"
"pity React 组件开发"
```

严格模式下**必须包含 "pity" 关键字**才会触发 `pity-frontend-patterns`：

- Ant Design Pro Components 模式
- umi-request + auth.headers() 请求模式
- dva + hooks 混合状态管理
- 可选链 `?.` 原则

### 直接模式

```
"直接模式：帮我看看这个组件"
"直接模式：快速修复这个样式"
```

不触发技能，快速响应。

> ⚠️ **触发条件**：必须说 "pity 前端"、"Pity frontend"、"pity React" 等包含 "pity"、"前端"关键字才会激活专属技能

### AI 开发工作流

本项目使用 **Superpowers + gstack** 双技能套件组合工作流，详细说明见父项目 `../CLAUDE.md`：

- `Superpowers:brainstorming` — 构思
- `Superpowers:writing-plans` — 写计划
- `gstack:/autoplan` — 多视角审核
- `Superpowers:subagent-driven-development` — 子智能体开发
- `Superpowers:test-driven-development` — TDD 测试（Jest）
- `gstack:/qa` — 真实浏览器端到端验证（Playwright）
- `gstack:/review` — 代码审查
- `gstack:/ship` — 发布流水线
- `gstack:/canary` — 上线后监控

## Phase 开发流程

每个 Phase 开发遵循以下流程：

### 开始 Phase

1. 在 `/Users/zhanzhicai/Desktop/Obsidian_one/AI学习笔记/pity/frontend/pityweb2025Ai` 创建 Phase 计划文档
2. 文档命名格式：`PhaseX_功能名称实施记录.md`

### 开发过程中

- 发现问题或遗漏功能时，**立即追加**到 Obsidian 计划文档的"后续工作"列表
- 例如：发现"AI 生成用例没有保存到数据库"，立即添加 `- [ ] AI 生成用例保存到数据库`
- 解决一个问题后，更新为 `- [x] AI 生成用例保存到数据库（commit号）`
- 每次开发完成需要测试
  - 语法检查：`npm run lint`
  - 启动前端验证服务正常：`npm start`
  - 核心功能手动测试

### 结束 Phase

1. **扫描遗漏内容**：

- 检查本次 Phase 是否有发现但未记录的问题/功能
- 检查"后续工作"列表中的待办是否都已完成
- 确认所有功能点都已测试

2. 更新 Obsidian 计划文档：

- 标记完成状态
- 记录所有 commit
- 列出新增/修改文件
- 添加测试结果
- 记录遇到的问题和解决方案
- 更新后续工作清单

3. 在 `frontend/CLAUDE.md` 更新开发阶段状态
4. 在 `frontend/CLAUDE.md` 关键约定中添加本次 Phase 的关键架构说明
5. 提交代码：`git add -A && git commit -m "feat: Phase X 功能名称"`

- 注意：推送由用户手动执行（网络问题导致推送失败的情况较多）

### Obsidian 文档标准结构

```markdown
# Phase X：功能名称实施记录

> 日期：YYYY-MM-DD 状态：进行中/已完成分支：dev 最新 Commit：xxxxxx

## 更新记录

| 日期       | Commit | 更新内容 |
| ---------- | ------ | -------- |
| YYYY-MM-DD | xxxxxx | 描述     |

## 完成情况

- [x] 功能点 1
- [ ] 功能点 2

## API 端点

（表格列出所有接口）

## 测试结果

（命令和响应）

## 测试检查清单：核心功能手动测试

(表格列出所有接口）

## 修复的问题

1. 问题描述 - 解决方案

## 后续工作

- [ ] 待办 1
- [ ] 待办 2
```
