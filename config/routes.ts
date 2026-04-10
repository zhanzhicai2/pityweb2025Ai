/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    title: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
    ],
  },
  {
    path: '/',
    redirect: '/dashboard/workspace',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    icon: 'dashboard',
    routes: [
      {
        path: '/dashboard/workspace',
        name: 'workspace',
        component: './Dashboard/Workspace',
      },
      {
        path: '/dashboard/statistics',
        name: 'statistics',
        component: './Statistics',
      },
    ],
  },
  {
    path: '/ai',
    name: 'AI管理',
    icon: 'Robot',
    authority: ['superAdmin', 'admin'],
    routes: [
      {
        path: '/ai/chat',
        name: 'AI对话',
        component: './AiChat',
      },
      {
        path: '/ai/config',
        name: 'LLM配置',
        component: './LlmConfig',
      },
      {
        path: '/ai/task',
        name: '用例生成',
        component: './AiTask',
      },
    ],
  },
  // {
  //   path: '/ai-app',
  //   name: 'AI智能化',
  //   icon: 'Robot',
  //   authority: ['superAdmin', 'admin'],
  //   routes: [
  //     {
  //       path: '/ai-app/generate',
  //       name: 'AI生成用例',
  //       component: './Ai/GenerateCase',
  //     },{
  //       path: '/ai-app/batch',
  //       name: '批量生成',
  //       component: './Ai/BatchGenerate',
  //     },
  //     {
  //       path: '/ai-app/enhance',
  //       name: '增强断言',
  //       component: './Ai/EnhanceAsserts',
  //     },
  //     {
  //       path: '/ai-app/requirement',
  //       name: '需求文档管理',
  //       component: './Ai/Requirement',
  //     },
  //   ],
  // },
  // {
  //   path: '/notification',
  //   name: '通知管理',
  //   icon: 'notification',
  //   authority: ['superAdmin', 'admin'],
  //   component: './Notification',
  // },
  // {
  //   path: '/openapi',
  //   name: 'OpenAPI导入',
  //   icon: 'api',
  //   component: './OpenAPI',
  // },
  {
    path: '/account/settings',
    name: '个人设置',
    component: './account/settings',
    hideInMenu: true,
  },
  {
    path: '/account/center',
    name: '个人中心',
    component: './UserInfo',
    hideInMenu: true,
  },
  {
    path: '/member/:user_id',
    name: '个人中心',
    component: './UserInfo',
    hideInMenu: true,
  },
  {
    path: '/project',
    name: '项目管理',
    icon: ' P',
    component: './ApiTest/Project',
  },
  {
    path: '/project/:id',
    hideInMenu: true,
    name: '项目详情',
    component: './ApiTest/ProjectDetail',
  },
  // {
  //   path: '/uiTest',
  //   name: 'UI测试',
  //   icon: 'api',
  //   routes: [
  //     {
  //       path: '/uiTest/uitest',
  //       name: '元素管理',
  //       component: './uiTest/TestCaseDirectory',
  //     },
  //     {
  //       path: '/uiTest/testcase',
  //       name: '场景管理',
  //       component: './uiTest/TestCaseDirectory',
  //     },
  //     {
  //       path: '/uiTest/record',
  //       name: '用例录制',
  //       hideInMenu: true,
  //       component: './uiTest/TestCaseRecorder',
  //     },
  //     {
  //       path: '/uiTest/testcase/:directory/add',
  //       name: '添加用例',
  //       hideInMenu: true,
  //       component: './uiTest/TestCaseComponent',
  //     },
  //     {
  //       path: '/uiTest/testcase/:directory/:case_id',
  //       name: '编辑用例',
  //       hideInMenu: true,
  //       component: './uiTest/TestCaseComponent',
  //     },
  //     {
  //       path: '/uiTest/testplan',
  //       name: '计划管理',
  //       component: './uiTest/TestPlan',
  //     },
  //     {
  //       path: '/uiTest/testplan',
  //       name: '测试报告',
  //       component: './uiTest/TestPlan',
  //     },
  //   ],
  // },
  {
    path: '/apiTest',
    name: '接口测试',
    icon: 'api',
    routes: [
      {
        path: '/apiTest/testcase',
        name: '接口用例',
        component: './ApiTest/TestCaseDirectory',
      },
      {
        path: '/apiTest/record',
        name: '用例录制',
        component: './ApiTest/TestCaseRecorder',
      },
      {
        path: '/apiTest/testcase/:directory/add',
        name: '添加用例',
        hideInMenu: true,
        component: './ApiTest/TestCaseComponent',
      },
      {
        path: '/apiTest/testcase/:directory/:case_id',
        name: '编辑用例',
        hideInMenu: true,
        component: './ApiTest/TestCaseComponent',
      },
      {
        path: '/apiTest/testplan',
        name: '测试计划',
        component: './ApiTest/TestPlan',
      },
      {
        path: '/apiTest/openapi',
        name: 'OpenAPI导入',
        icon: 'api',
        component: './OpenAPI',
      },
    ],
  },
  {
    path: '/record',
    icon: 'B',
    name: '测试报告',
    routes: [
      {
        path: '/record/list',
        name: '构建历史',
        component: './BuildHistory/ReportList',
      },
      {
        path: '/record/report/:id',
        hideInMenu: true,
        name: '详细报告',
        component: './BuildHistory/ReportDetail',
      },
    ],
  },
  {
    path: '/notification',
    name: '消息中心',
    hideInMenu: true,
    component: './Notification',
  },
  {
    path: '/config',
    icon: 'Z',
    name: '测试配置',
    authority: ['superAdmin', 'admin'],
    routes: [
      {
        path: '/config/environment',
        name: '环境管理',
        component: './Config/Environment',
      },
      {
        path: '/config/address',
        name: '地址管理',
        component: './Config/Address',
      },
      {
        path: '/config/gconfig',
        name: '全局变量',
        component: './Config/GConfig',
      },
      {
        path: '/config/database',
        name: '数据库配置',
        component: './Config/Database',
      },
      {
        path: '/config/redis',
        name: 'Redis配置',
        component: './Config/Redis',
      },
      {
        path: '/config/oss',
        name: 'oss文件',
        component: './Config/Oss',
      },
    ],
  },
  {
    path: '/system',
    icon: 'lock',
    name: '后台管理',
    authority: ['superAdmin'],
    routes: [
      {
        path: '/system/configure',
        name: '系统设置',
        component: './Config/SystemConfig',
      },
      {
        path: '/system/user',
        name: '用户管理',
        component: './Manager/UserList',
        authority: ['superAdmin'],
      },
      {
        path: '/system/monitor',
        name: '系统监控',
        component: './Monitor',
        authority: ['superAdmin'],
      },
    ],
  },
  {
    path: '/mock',
    icon: 'Api',
    name: 'Mock配置',
    component: './Mock',
  },
  {
    path: '/caseV2',
    icon: 'Solution',
    name: '动态模板',
    routes: [
      {
        path: '/caseV2/list',
        name: '模板用例',
        component: './CaseV2',
      },
    ],
  },
  {
    path: '/scenario',
    icon: 'ShareAlt',
    name: '场景流程',
    routes: [
      {
        path: '/scenario/list',
        name: '场景管理',
        component: './Scenario',
      },
    ],
  },
  {
    path: '/phasex',
    icon: 'PlayCircle',
    name: 'Phase X测试',
    routes: [
      {
        path: '/phasex/plan',
        name: '测试计划',
        component: './PhaseX',
      },
      {
        path: '/phasex/report',
        name: '测试报告',
        component: './PhaseX/Report',
      },
    ],
  },
  {
    path: '/tool',
    name: '实用工具',
    icon: 'tool',
    routes: [
      {
        path: '/tool/request',
        name: 'HTTP测试',
        icon: 'Send',
        component: './Tool/Request',
      },
      {
        path: '/tool/sql',
        name: 'SQL客户端',
        icon: 'database',
        component: './Tool/SqlOnline',
      },
      {
        path: '/tool/redis',
        name: 'Redis客户端',
        icon: 'redis',
        component: './Tool/RedisOnline',
      },
    ],
  },
  // {
  //   path: '/ci',
  //   icon: 'icon-CI',
  //   name: '持续集成',
  //   component: './Building',
  // },
  // {
  //   path: '/precise',
  //   icon: 'icon-jingzhun',
  //   name: '精准测试',
  //   component: './Building',
  // },
  {
    path: '/datafactory',
    icon: 'M',
    name: '数据工厂',
    component: './datafactory',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
