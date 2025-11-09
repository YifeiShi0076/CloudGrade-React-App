# React 前端项目

本仓库为 React 前端页面项目，用于与后端 API 进行交互。项目支持本地开发和生产环境构建，构建后的静态资源可发布至 Nginx 进行代理访问。

## 项目目录结构

.
├── public
├── src
├── .env.development
├── .env.production
├── package.json
└── README.md

## 环境配置

项目使用 `.env` 文件配置环境变量，需要在项目根目录下创建以下两个文件：

### `.env.development`

用于本地开发环境，内容示例：

REACT_APP_API_BASE_URL=http://后端IP:后端服务接口/api

### `.env.production`

用于生产环境构建，内容示例：

REACT_APP_API_BASE_URL=http://后端IP:后端服务接口/api

> 注意：请将 `后端IP` 和 `后端服务接口` 替换为实际的后端服务地址和接口路径。

## 本地开发

使用 yarn 启动本地开发环境：

```bash
yarn install
yarn start
```

- 本地开发启动时会自动读取 `.env.development` 中的环境变量。  
- 默认开发端口为 3000，可通过修改 `.env.development` 或 `package.json` 配置端口。

## 生产环境构建

使用以下命令构建生产环境：

```bash
yarn build
```

- 构建时会自动读取 `.env.production` 中的环境变量。  
- 构建完成后生成的静态资源位于 `build` 文件夹。

## 部署到 Nginx

将 `build` 文件夹中的所有静态文件发布到 Nginx 服务器对应目录，配置示例：

```nginx
server {
    listen       80;
    server_name  your-domain.com;

    location / {
        root   /path/to/build;
        index  index.html;
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://后端IP:后端服务接口/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

- `root` 指向 `build` 文件夹所在路径。  
- `try_files $uri /index.html;` 保证 React 路由正常工作。  
- `/api/` 配置代理到后端接口。

## 依赖管理

项目使用 Yarn 管理依赖：

```bash
yarn install
yarn add <package_name>
yarn remove <package_name>
```

## 注意事项

1. 确保 `.env.development` 和 `.env.production` 文件内容正确。  
2. 构建前请检查生产环境 API 地址是否配置正确。  
3. Nginx 代理配置需与后端接口地址匹配，避免跨域问题。
