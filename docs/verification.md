# 验收记录

日期：2026-09-26。当前是可运行的预览版本，**尚未正式上线**。

## 已验证

- Node.js 24.1.0，Astro 7.3.5，锁文件已生成。
- `npm run verify` 通过：6 项内容规则测试；Astro 检查 0 errors / 0 warnings / 0 hints；完整静态构建成功。
- 18 个 HTML 页面生成；首页、About、Topics、Notes、Research、Practice、Archive、7 个主题页、3 篇示例、404 齐全。
- 最终产物检查：内部链接、锚点、metadata、canonical、JSON-LD、HTML 解析、标题层级、主 landmark、图片 alt、草稿隔离、零客户端 JavaScript。
- sitemap 与 RSS 已通过 XML 解析；21 个页面/机器入口 HTTP 200，缺失地址 HTTP 404。
- 浏览器：桌面与 390×844 手机尺寸检查 12 个主要页面，未发现横向溢出；320px 窄屏首页显示正常。
- 原生目录展开/折叠、目录锚点跳转正常；桌面首页与移动端长文截图已目视检查。
- 隔离生产测试副本：三个创建命令成功；重复 slug 创建失败；3 个草稿不进入生成页面或聚合；Person / Organization / Article、正式 canonical 与 robots 正常。
- 故意插入失效内部链接时检查失败；真实项目在身份/域名未配置且仍有公开示例时，生产构建被正确阻止。
- 全站静态文件约 86.6 KB（未经 HTTP 压缩，示例内容规模）。

生产测试使用隔离的虚构 QA 身份与 `.test` 域名，未上传；这些数据不属于网站正式内容。

## Git 与远程交付

- 私有 GitHub 仓库：https://github.com/KKkevin666/personal-knowledge
- GitHub Actions：push main / pull_request 触发完整验证并保留静态构建 artifact。
- 首次远程 CI 已成功（Linux，代码提交 `faf56bd`）：https://github.com/KKkevin666/personal-knowledge/actions/runs/36229963118 。包括 npm ci、6 项测试、Astro 检查、build、最终产物检查和 artifact 上传。
- 本地 main 已推送并跟踪 origin/main；仓库保持私有，使用 GitHub noreply 提交邮箱。

## 尚待本人参与

- Cloudflare 页面当前需要登录；尚未完成 Git 集成、测试部署和自动发布验证。
- 尚未提供个人正式域名、公开姓名、联系邮箱及可选公司信息。
- 尚未连接自定义域名、修改 DNS、签发/验证正式 HTTPS。
- 示例内容仍保留用于验收；正式发布前须删除或设为 draft。
- Analytics / Google Search Console / Bing Webmaster Tools 尚未启用，待正式域名就绪后连接。
- 未运行 Lighthouse 或完整 WCAG 审计；已完成基础静态可访问性与浏览器响应式检查，不将其等同于全面认证。

未创建任何付费资源。`dist/` 可直接移到普通静态服务器；保留域名与 URL 即可维持引用。

## 2026-09-27 宽屏适配修复

- 移除全站 1160px 固定最大宽度，改为全宽容器和 24–96px 自适应边距；1600px 以上主题索引使用三列。
- 文章正文仍保持最大 740px 阅读行宽，目录限制最大 280px，避免宽屏无限拉长文字。
- `npm run verify` 通过，18 个页面及链接/metadata 检查通过。
- 浏览器验证首页、Topics、研究文章在 320、390、768、1440、1920、2560px 六种宽度下均无横向溢出。1920px 首页左右内容边距约 77px。
- 仅更新本地预览与 Git 源码；Cloudflare 和正式域名的未完成状态不变。

## 2026-09-27 中文界面

- 导航、栏目名、主题名称、首页辅助文案、首发/更新日期和永久链接标签改为中文。
- 保留文章中的必要专业术语及英文稳定 URL；slug、type、发布日期不变。
- `npm run verify` 通过：6 项测试、类型检查、18 页构建及链接/metadata 检查。
- 部署状态不变，尚未连接 Cloudflare 与正式域名。

## 2026-10-01 上线（临时域名）

- 代码推送到新建的公开仓库 https://github.com/KKkevin666/longvars（main 分支，41 个文件，一次提交）。
- Cloudflare Pages 项目 `longvars` 已连接该仓库并部署成功：
  - 构建命令 `npm run build`，输出目录 `dist`，NODE_VERSION=22。
  - 环境变量：SITE_URL=https://www.qingheai.top；未设置 SITE_MODE，站点保持 noindex 预览状态（含"预览版本"提示条）。
  - pages.dev 地址 https://longvars.pages.dev，HTTP 200 已验证。
- 临时域名 www.qingheai.top 已在 Pages → Custom domains 绑定并激活，SSL 正常；HTTP 200、标题"长期主义"已验证。
- 阿里云 DNS 为 qingheai.top 新增 www CNAME → longvars.pages.dev（TTL 10 分钟）；其余原有记录未动，未转 Nameserver，未碰 apex。
- 未备案：站点托管在境外（Cloudflare），无需备案。注意微信生态会拦截未备案域名，对外传播暂用 pages.dev 地址或等正式域名。

## 尚待办（外部步骤）

- package-lock.json 未能推送到仓库（182KB，超出推送工具单参数 128KB 上限）；Cloudflare 构建时 `npm install` 会重新生成，不影响部署。以后可在本地补上：clone 仓库后把 package-lock.json 复制进去提交推送。
- longvars.com 在 Cloudflare 的注册若完成：在 Pages → Custom domains 添加该域名，把 SITE_URL 环境变量改为 https://longvars.com 后重新部署；并把 site.config.mjs 里的 url 占位符 https://example.com 换成正式域名。
- 正式发布前：site.config.mjs 补 author/email；删除示例内容或设为 draft；设置 SITE_MODE=production（解除 noindex）。
