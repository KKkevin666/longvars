# 部署、迁移与账户操作

## 部署步骤与当前进度

1. **已完成**：GitHub CLI 已授权。未来凭证失效时，在自己的终端执行 `gh auth login -h github.com`；不要把密码/Token 发进对话。
2. **已完成**：私有仓库 `KKkevin666/personal-knowledge` 已创建，main 已推送，首次 GitHub CI 已通过。
3. 登录 Cloudflare，在 Workers & Pages → Create → Pages → Connect to Git 连接指定仓库。安装授权只选这个仓库。
4. 选择 main；构建命令 `npm run verify`，输出 `dist`，Node 24，初次 `SITE_MODE=preview`。部署通过后访问 `*.pages.dev` 验收。
5. 提供已持有域名，或本人在注册商购买并保持所有权。**添加自定义域名及修改 DNS 前需本人确认具体记录**。
6. 根据 Pages 控制台给出的当前 DNS 指示连接域名；不要盲目替换现有邮件 MX/TXT。等待证书签发，检查 HTTPS 和重定向。
7. 更新 site.config.mjs 的正式身份与域名，隐藏/删除示例，在生产环境切换 `SITE_MODE=production` 并重新部署。
8. 验证正式 canonical、robots、sitemap、RSS，提交搜索引擎 sitemap；若 pages.dev 仍可访问，正式 canonical 应指向个人域名。
9. 做一次真实 Markdown 提交到 main，确认 build → deploy 自动完成，记录 commit 与部署 URL。

无需永久保存主账号密码。Git 集成不要求向代码添加 Cloudflare Token。若未来必须用 CLI，使用仅限目标账户 Pages 编辑的短期 Token，通过安全环境注入，用完撤销。

## 普通 Nginx 示例

替换域名、路径及证书。证书由服务器维护工具管理，不提交进 Git。

```nginx
server {
    listen 443 ssl;
    server_name YOUR_DOMAIN;
    root /srv/knowledge/current;
    index index.html;
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    location / { try_files $uri $uri/ =404; }
    error_page 404 /404.html;
}
server {
    listen 80;
    server_name YOUR_DOMAIN;
    return 301 https://$host$request_uri;
}
```

服务器应包含 MIME 配置，正确提供 XML、SVG、CSS，404 必须返回真实 404 状态。对象存储需要配置目录索引/重写，否则 `/research/slug/` 无法对应 `research/slug/index.html`。CDN 不应把缺失页面统一改写首页返回 200。

建议每次部署新版本目录，验证后原子切换 current 软链接。对 `_astro/` 带 hash 资源可长缓存，HTML 短缓存或 revalidate。复制发布产物不需要 Node，只有构建机器需要 Node。

## 平台迁移核对

- 旧域名继续归本人所有；HTTPS 有效；保持原路径和尾斜杠。
- 对比 sitemap 中每个 URL 的状态码、标题、canonical。
- 转换已有 301 规则，配置真实 404；检查 RSS/robots/llms。
- 不把旧域名改成新托管商域名，不修改文章 slug。
- 关键 DNS 修改需本人确认，旧站保留到传播与回滚窗口结束。
- 大陆部署的备案、账号与法定手续由本人办理并确认；代码无境外字体、运行时 API 等硬依赖。

## 费用

本地和开源构建工具无需付费。计划使用 GitHub 与 Pages 的免费额度；实际额度以账户和服务商当前规则为准，达到限制时先停下来讨论，不自动升级。只可能需要购买/续费域名；本项目没有创建任何付费资源。
