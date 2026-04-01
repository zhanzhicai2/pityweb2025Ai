# AI 辅助开发建议

> **项目技术栈**
>
> - **前端**: WebStorm + React 18 + TypeScript + UmiJS + Ant Design 5
> - **后端**: PyCharm + FastAPI + SQLAlchemy + MySQL + Redis

---

## 🎯 让 AI 更好理解代码的实用方法

### 1. **使用清晰的文件结构**

**当前项目的优势：**

```
pityweb2025Ai/          # 前端 (React)
├── src/
│   ├── pages/         # 页面组件
│   ├── services/      # API 调用层
│   ├── components/    # 公共组件
│   └── models/        # 状态管理

后端目录/               # 后端 (FastAPI)
├── app/
│   ├── routers/       # 路由
│   ├── models/        # 数据模型
│   ├── crud/          # 数据访问层
│   └── utils/         # 工具函数
```

**建议：** 保持这种清晰的前后端分离结构

### 2. **为 AI 提供上下文信息**

**在对话中主动说明：**

```
✅ 好的做法：
"这是一个 React + FastAPI 的项目
前端：React 18 + TypeScript + UmiJS（使用 WebStorm 开发）
后端：FastAPI + SQLAlchemy + MySQL（使用 PyCharm 开发）
现在我在前端的 src/pages/ApiTest/TestCaseComponent.jsx
中遇到了一个 API 调用问题"
```

```
❌ 不好的做法：
"这里有个报错，帮我看看"
```

### 3. **使用项目文档**

你已经有了很好的文档：

- ✅ `CLAUDE.md` - 项目指导文档
- ✅ `新手指南.md` - 新手入门文档
- ✅ `README.md` - 项目说明

**建议：** 在这些文档中添加：

- 技术栈详细版本
- 开发规范
- 常见问题解决方案
- API 接口文档链接

### 4. **建立前后端关联映射**

创建一个 `API映射文档.md`：

```markdown
# 前后端 API 映射

## 用户认证

- 前端: `src/services/auth.ts` → login()
- 后端: `app/routers/auth.py` → /auth/login
- 数据模型: User (app/models/user.py)

## 测试用例

- 前端: `src/services/testcase.js` → listTestCase()
- 后端: `app/routers/testcase.py` → /testcase/list
- 数据模型: TestCase (app/models/testcase.py)
```

### 5. **代码注释最佳实践**

**前端代码注释（WebStorm）：**

```jsx
/**
 * 测试用例编辑组件
 * @param {number} caseId - 用例ID
 * @param {string} directory - 用例目录
 *
 * 调用的后端API:
 * - GET /testcase/query - 查询用例详情
 * - POST /testcase/update - 更新用例
 *
 * @author 你的名字
 * @date 2025-01-06
 */
function TestCaseComponent({ caseId, directory }) {
  // ...
}
```

**后端代码注释（PyCharm）：**

```python
@app.post("/testcase/update", summary="更新测试用例")
async def update_testcase(
    case_id: int,
    request: TestCaseUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    更新测试用例信息

    Args:
        case_id: 用例ID
        request: 更新请求数据
        db: 数据库会话

    Returns:
        更新后的用例信息

    前端调用位置:
    - src/services/testcase.js: updateTestCase()
    - src/pages/ApiTest/TestCaseComponent.jsx

    Author: 你的名字
    Date: 2025-01-06
    """
```

### 6. **使用代码搜索技巧**

**当 AI 需要理解功能时：**

```
✅ 精确描述：
"帮我搜索前端所有调用 /auth/login API 的代码"
"查看后端 @app.post("/testcase") 相关的路由定义"
"找到所有使用 TestCase 数据模型的文件"

❌ 模糊描述：
"搜索登录相关代码"
```

### 7. **提供错误堆栈和日志**

**遇到问题时：**

```
✅ 完整信息：
前端报错（WebStorm）：
位置: src/pages/ApiTest/TestCaseComponent.jsx:45
错误: TypeError: Cannot read property 'data' of undefined
调用栈: [完整堆栈]
相关代码: [粘贴代码片段]

后端日志（PyCharm）：
[2025-01-06 10:30:00] ERROR - traceback...
```

### 8. **使用 AI 工作流的最佳实践**

**典型开发场景：**

```
场景1: 添加新功能
1. 先问 AI 是否理解现有代码结构
2. 让 AI 帮你规划实现步骤
3. 让 AI 生成代码框架
4. 自己填充业务逻辑
5. 让 AI 帮你 review 代码

场景2: 修复 Bug
1. 提供错误信息和相关代码
2. 说明你尝试过的解决方案
3. 让 AI 分析可能的原因
4. 讨论解决方案

场景3: 重构代码
1. 说明重构目标
2. 让 AI 分析影响范围
3. 讨论重构方案
4. 让 AI 帮你生成测试用例
```

### 9. **推荐的项目配置**

**在前端添加 `.ai-help` 文件：**

```markdown
# AI 辅助开发配置

## 项目信息

- 项目名称: Pity 测试平台
- 前端技术: React 18 + TypeScript + UmiJS + Ant Design 5
- 后端技术: FastAPI + SQLAlchemy + MySQL + Redis
- IDE 配置: WebStorm (前端) + PyCharm (后端)

## 目录结构说明

- src/services/ - API 调用层，每个文件对应后端的一个路由模块
- src/pages/ - 页面组件，按功能模块分组
- src/components/ - 可复用组件

## 开发规范

- 所有 API 调用通过 src/services/ 下的服务函数
- 新增页面需要在 config/routes.ts 添加路由
- 需要权限的接口使用 auth.headers() 添加认证

## 重要配置文件

- config/defaultSettings.ts - 前端 API 地址配置
- config/proxy.ts - 开发环境代理配置
- src/consts/config.ts - 业务常量配置

## 快速导航

- 登录相关: src/services/auth.ts ↔ 后端 app/routers/auth.py
- 用例管理: src/services/testcase.js ↔ 后端 app/routers/testcase.py
```

### 10. **实用技巧汇总**

| 场景          | 建议                                       |
| ------------- | ------------------------------------------ |
| 🆕 新功能开发 | 先让 AI 理解需求，再让它分析现有类似功能   |
| 🐛 Bug 修复   | 提供完整错误堆栈 + 相关代码 + 已尝试的方案 |
| 📖 代码理解   | 让 AI 先搜索文件，再逐步解释功能           |
| ✏️ 代码重构   | 说明重构原因，让 AI 分析影响范围           |
| 🧪 测试编写   | 让 AI 根据代码逻辑生成测试用例             |
| 📚 技术学习   | 让 AI 结合你的代码解释技术概念             |

### 11. **IDE 特定技巧**

#### WebStorm（前端）技巧

```bash
1. 使用书签标记重要文件
   - Cmd+Shift+数字: 添加/取消书签
   - Cmd+数字: 跳转到书签

   建议书签：
   - src/services/auth.ts (认证相关)
   - config/routes.ts (路由配置)
   - config/defaultSettings.ts (全局配置)

2. 使用TODO注释让 AI 关注
   // TODO: [AI优化] 这里需要处理错误情况
   // FIXME: [AI协助] 需要优化性能

3. 使用结构化搜索和替换
   - Cmd+Shift+A: 查找操作
   - 结构化搜索: 搜索特定代码模式

4. 使用代码片段（Live Templates）
   - 创建常用代码模板
   - 如: rfc → React函数组件模板
```

#### PyCharm（后端）技巧

```python
1. 使用书签和收藏
   - F11: 添加书签
   - Shift+F11: 查看书签列表
   - Alt+Shift+F: 添加到收藏夹

   建议书签：
   - app/routers/auth.py (认证路由)
   - app/models/ (数据模型)
   - main.py (应用入口)

2. 使用TODO注释
   # TODO: [AI优化] 需要添加输入验证
   # FIXME: [AI协助] SQL查询需要优化

3. 使用数据库工具
   - Database工具窗口直接查看数据
   - SQL脚本生成

4. 使用类型注解（AI 更容易理解）
   def update_testcase(
       case_id: int,
       request: TestCaseUpdate,
       db: AsyncSession = Depends(get_db)
   ) -> TestCaseResponse:
```

### 12. **前后端协作开发流程**

```
【场景：开发新接口】

Step 1: 后端开发（PyCharm）
1. 在 app/routers/ 创建路由文件
2. 在 app/models/ 定义数据模型
3. 在 app/crud/ 编写数据访问层
4. 添加完整的类型注解和文档字符串
5. 测试接口（使用 PyCharm HTTP Client）

Step 2: 前端开发（WebStorm）
1. 在 src/services/ 创建 API 服务函数
2. 在 src/pages/ 创建页面组件
3. 在 config/routes.ts 添加路由
4. 调试前端（使用浏览器 DevTools）

Step 3: AI 辅助
1. 让 AI 生成 API 映射文档
2. 让 AI 检查类型定义是否一致
3. 让 AI 生成测试用例
```

### 13. **与 AI 对话的模板**

```
【当前任务】
我想实现一个 [功能名称]

【技术栈】
前端: React 18 + TypeScript（WebStorm）
后端: FastAPI + SQLAlchemy（PyCharm）

【已有代码】
- 前端文件: src/pages/...
- 后端文件: app/routers/...

【遇到问题】
[描述问题]

【期望结果】
[说明期望]

【我的想法】
[说明你的思路]
```

### 14. **常见开发场景的 AI 辅助流程**

#### 场景 1: 开发新的 CRUD 功能

```
1. 让 AI 生成后端代码框架
   "帮我生成一个用户管理的 CRUD 接口
    使用 FastAPI + SQLAlchemy
    包含创建、查询、更新、删除功能"

2. 让 AI 生成前端代码框架
   "帮我生成用户管理的前端页面
    使用 Ant Design Pro Components
    包含表格、表单、搜索功能"

3. 让 AI 检查一致性
   "检查前后端类型定义是否一致"
```

#### 场景 2: 调试 API 请求问题

```
1. 提供完整错误信息
   "前端请求 /testcase/list 失败
    错误信息: Network Error
    后端日志: [粘贴日志]
    前端代码: [粘贴代码]"

2. 说明环境配置
   "前端配置: apiUrl = 'http://127.0.0.1:7777'
    后端运行在: 0.0.0.0:7777
    CORS配置: [粘贴配置]"

3. 让 AI 逐步排查
```

#### 场景 3: 重构优化代码

```
1. 说明重构目标
   "我想要优化测试用例查询的性能
    当前实现: [粘贴代码]
    数据量: 约10000条记录"

2. 让 AI 分析
   "分析当前代码的性能瓶颈
    提供优化方案"

3. 讨论实施方案
   "这个方案对前后端的影响范围是多少？
   需要修改哪些文件？"
```

### 15. **文档维护建议**

建议创建以下文档帮助 AI 更好理解项目：

```
项目文档/
├── API映射文档.md          # 前后端API对应关系
├── 数据模型映射.md          # 前后端数据模型对照
├── 开发规范.md              # 代码规范和约定
├── 常见问题.md              # FAQ和解决方案
└── AI辅助配置.md            # 本文件
```

### 16. **版本控制与 AI 辅助**

```bash
# Git 工作流

1. 提交前让 AI 检查
   "帮我检查这次改动的潜在问题:
    [粘贴 git diff]"

2. 生成提交信息
   "帮我生成规范的 Git commit message:
    功能: [描述]
    改动: [列出主要文件]"

3. Code Review
   "帮我 review 这段代码:
    [粘贴代码]
    关注点: 性能、安全、可维护性"
```

## 💡 关键要点总结

1. **保持文档更新** - 让 AI 能随时了解最新代码
2. **提供上下文** - 说明技术栈、文件位置、相关代码
3. **明确问题** - 准确描述问题和你尝试过的方案
4. **循序渐进** - 让 AI 逐步理解，不要一次性给太多信息
5. **建立映射** - 明确前后端 API 的对应关系
6. **使用 IDE 特性** - 充分利用 WebStorm 和 PyCharm 的功能
7. **类型注解** - 使用 TypeScript 和 Python 类型注解帮助 AI 理解
8. **文档字符串** - 为函数添加详细的 docstring
9. **注释规范** - 标注前后端关联，方便 AI 追踪

## 🚀 快速参考

### WebStorm 快捷键

- `Cmd+B`: 跳转到定义
- `Cmd+Click`: 查看定义
- `Cmd+Shift+F`: 全局搜索
- `Cmd+Shift+R`: 全局替换
- `Cmd+Alt+L`: 格式化代码

### PyCharm 快捷键

- `Cmd+B`: 跳转到定义
- `Cmd+Click`: 查看定义
- `Cmd+Shift+F`: 全局搜索
- `Cmd+Shift+R`: 全局替换
- `Cmd+Alt+L`: 格式化代码

### 与 AI 高效沟通的关键

1. **明确技术栈**: WebStorm + React / PyCharm + FastAPI
2. **提供文件路径**: 完整的相对路径
3. **说明代码关系**: 前端哪个文件调用后端哪个接口
4. **粘贴完整代码**: 包括导入语句和类型定义
5. **描述环境配置**: API 地址、端口、代理配置等

---

**最后建议**: 定期更新这份文档，记录你和 AI 协作中的经验和最佳实践！
