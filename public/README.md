# 有贝后台管理系统

基于 Vue3 + TypeScript + Element Plus 构建的后台管理系统前端。

## 功能特性

- 🔐 管理员登录认证
- 🔑 密码修改功能
- 👥 用户列表管理
- 📱 响应式设计
- 🎨 现代化UI界面

## 技术栈

- **前端框架**: Vue 3.3+
- **开发语言**: TypeScript
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **HTTP客户端**: Axios
- **构建工具**: Vite

## 开发环境搭建

### 安装依赖

```bash
cd public
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:3001

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
public/
├── src/
│   ├── api/           # API接口
│   ├── stores/        # 状态管理
│   ├── types/         # TypeScript类型定义
│   ├── views/         # 页面组件
│   ├── router/        # 路由配置
│   ├── App.vue        # 根组件
│   └── main.ts        # 入口文件
├── index.html         # HTML模板
├── vite.config.ts     # Vite配置
├── tsconfig.json      # TypeScript配置
└── package.json       # 项目配置
```

## 功能说明

### 登录系统
- 用户名密码验证
- JWT Token认证
- 自动跳转和路由守卫

### 用户管理
- 查看所有用户列表
- 用户信息展示
- 实时数据刷新

### 密码管理
- 安全的密码修改
- 表单验证
- 确认密码校验

## API接口

后端接口基于 NestJS 框架，主要接口：

- `POST /admin/login` - 管理员登录
- `POST /admin/change` - 修改密码  
- `GET /admin/users` - 获取用户列表

## 部署说明

1. 构建项目：`npm run build`
2. 将 `dist` 目录部署到静态服务器
3. 配置代理转发 `/admin` 到后端服务

## 注意事项

- 确保后端服务已启动（默认端口3000）
- 前端开发服务器已配置代理转发
- 登录状态使用localStorage持久化 