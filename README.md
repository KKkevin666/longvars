# 长期个人知识库

Astro 生成的纯静态个人网站。Markdown 是内容源；Git Repository 是 source of truth；`dist/` 可由任何普通静态 Web Server 托管。没有数据库、CMS、运行时 API 或浏览器 JavaScript。

## 当前交付状态

源码、本地检查、预览与部署配置见 `docs/verification.md`。远程仓库、Cloudflare Pages 连接、个人域名与 HTTPS 必须实际完成后才能标记上线，不能用本地成功代替。

## 目录

```text
content/
  notes/               # 短观点 Markdown
  research/            # 研究 Markdown
  practice/            # 实践 Markdown
  topics/              # 长期主题 Markdown
src/
  content.config.ts    # frontmatter 类型与日期校验
  lib/content.ts       # 查询、排序、关联、URL
  layouts/             # HTML、metadata、结构化数据
  components/          # 内容列表
  pages/               # 页面、RSS、sitemap、robots、llms.txt
  styles/              # 本地 CSS，无外部字体
public/                # 自有静态资源；图片放 public/images/
scripts/               # 创建文章、内容与构建产物检查
site.config.mjs        # 公开身份、站点名称、永久域名
.github/workflows/     # 自动检查
```

## 本地运行

使用 Node.js 24 LTS（`.nvmrc`），npm。初次运行：

```sh
npm install
npm run dev
```

打开终端显示的本地 URL。已存在锁文件时，CI 和恢复环境使用 `npm ci`。依赖升级应单独提交并运行检查；不必频繁追随框架升级。

```sh
npm run verify        # Astro 类型校验 → 内容检查 → build → HTML/链接检查
npm run build         # 含 prebuild、postbuild；完整产物 dist/
npm run preview       # 预览构建产物（Astro 7 启动后台预览进程）
npm exec astro -- preview stop  # 不再预览时停止本机服务
```

默认预览模式：所有页面 noindex、robots 禁止抓取。noindex 不是访问控制，预览地址不要包含机密信息。draft 内容不会生成页面，但公开仓库中源文件仍可见。

## 写作与发布

```sh
npm run new:note -- enterprise-ai-context-ownership "企业上下文由谁负责"
npm run new:research -- memory-governance "长期记忆的治理"
npm run new:practice -- deployment-review "一次交付复盘"
```

也可以只运行 `npm run new:note`，按提示输入 slug 与标题。默认 `draft: true`，不会公开。日常流程：

1. 写 Markdown，补齐 description、topics 和正文。
2. AI 可辅助整理；作者核实事实、引用、公司信息与观点。
3. 更新旧文章时保留 slug、type 与 date，只修改 updated 和正文。
4. 本人审核后设置 `draft: false`；执行 `npm run verify`。
5. 提交分支/PR，检查通过后合并 main；Cloudflare Git 集成自动检查、构建和发布。

不需要修改前端代码。没有定时发布服务，未来日期文章应保留草稿，发布当天再修改。Git 保存每次修订历史；页面显示首发和最近更新，不自动伪造 updated。

## 内容 schema

所有日期必须用引号包围的 `YYYY-MM-DD`，按上海时区记录。

```yaml
---
title: "文章标题"
description: "准确说明本文的问题、范围或结论。"
slug: permanent-english-slug
date: "2026-09-26"
updated: "2026-09-26"
type: research
topics: [enterprise-ai, ai-context]
tags: []
draft: true
company_related: false
example: false
featured: false
# canonical: https://original.example/article/
---

## 从二级标题开始

正文。
```

| 字段 | 规则 |
| --- | --- |
| title / description | 必填非空字符串 |
| slug | 必填小写 ASCII 字母、数字、单连字符；所有文章之间不可重复 |
| date | 首次发布日，必填 |
| updated | 可选，不早于 date；未填时展示 date |
| type | note / research / practice，须与目录对应 |
| topics | 至少一个已存在 Topic 的 slug |
| tags | 可选辅助标签数组，不生成标签站点 |
| draft | 必填 boolean；true 从页面、聚合、feed 中排除 |
| canonical | 可选完整 HTTPS URL；默认自动生成自身永久 URL。只用于真实的转载/原始来源归属，不用于更改本站地址 |
| company_related | 必填 boolean；true 展示个人/公司立场说明 |
| example | 默认 false；true 明确标注示例，生产构建拒绝公开示例 |
| featured | 默认 false；research 中为 true 的文章进入首页代表性研究 |

采用普通 Markdown，不默认引入 MDX：它更容易迁移，不混入框架组件。图片使用 `/images/...` 的本地地址，填写 alt。正文不用一级标题（标题自动渲染 H1）；长文有至少三个 H2/H3 时自动显示目录。正文内部链接使用永久站内 URL，不链接源 `.md` 文件。

## 新增 Topic

复制 `content/topics/` 下任一 Markdown，修改 title、description、slug、order；在文章 topics 中引用新 slug。无需维护列表或路由。Topic 页按内容类型聚合，更新时间取关联文章的最新 updated/date，草稿不参与。没有内容的主题保留明确空态，不虚构文章。相关文章依据共同 Topic 数量与更新时间，最多三篇。

## URL 契约

- note → `/notes/<slug>/`
- research → `/research/<slug>/`
- practice → `/practice/<slug>/`
- Topic → `/topics/<slug>/`

URL 不含日期、不由标题推导，始终保留尾斜杠。发布后 **slug 和 type 都视为永久字段**。重命名标题或源文件不改变 URL。确需移动时，保留旧地址并配置 HTTP 301；在 Cloudflare 可用 `public/_redirects`，迁移时转换为新服务器规则。不要通过 canonical 代替重定向。

## 正式发布前

1. 编辑 `site.config.mjs`：author、email、url（自己的 HTTPS 域名）、名称。company 默认为 null，仅本人确认后填写公司 name/url/role。
2. 删除三篇示例，或把它们设为 draft。不要仅把 example 改成 false 冒充正式研究。
3. 自己确认 About 文案、署名、联系信息和所有公开内容。
4. 在正式环境设置 `SITE_MODE=production`；不设置 SITE_URL，或令其等于 site.url。
5. 执行 `SITE_MODE=production npm run verify`。身份、域名、示例不满足要求时主动失败。

Person 与公司关系仅在真实身份配置后生成；不输出虚构身份。公司关联文章标注个人观点，官方事实链接到公司源材料。

## GitHub + Cloudflare Pages 自动部署

完整步骤见 [部署与迁移](docs/deployment.md)。推荐使用 Cloudflare 的 **Git 集成**，避免在仓库中保存部署 Token。

- 仓库：自己的 GitHub Repository；可以私有，不含任何账号密码。
- main：正式发布分支；PR：预览与检查。
- Framework：Astro；build command：`npm run verify`；output directory：`dist`。
- Node：24；Production 环境变量：`SITE_MODE=production`；Preview：`SITE_MODE=preview`。
- Preview 可设置 `SITE_URL` 为准确预览地址，仅影响预览链接，不能带入正式环境。
- 初次测试尚未接正式域名时，main 的 Pages 环境也先用 preview；完成上线前检查后切换 production。

Pages 只有在 `npm run verify` 全部通过后才部署。GitHub Actions 为 PR 和 main 再提供一个独立可见的检查。建议开启 main 分支保护，要求 Validate website 成功；是否可用取决于 GitHub 账号计划和仓库可见性。

## SEO 与机器读取

静态 HTML、每页 description/canonical、OpenGraph、X summary card、Article/Person JSON-LD、`/sitemap.xml`、`/robots.txt`、`/rss.xml`、`/llms.txt`。未要求制作分享图片，因此不伪造 og:image。RSS 使用永久 URL 作为 GUID，首发日期为 pubDate，updated 用于排序及 lastBuildDate；订阅器是否重新通知修改文章由订阅器决定。

llms.txt 是可选实验性目录，不保证 AI 引用或排名。索引与引用不能保证；正式上线后在 Google Search Console、Bing Webmaster Tools 验证域名并提交 sitemap。预览始终不申请收录。

## Analytics

第一阶段代码不加载任何第三方追踪脚本。上线后可启用 Cloudflare Web Analytics 的免费基础统计（浏览、来源、长期页面访问），由本人在账号中确认；搜索发现使用 Google Search Console 与 Bing Webmaster Tools。不开启广告、会话回放、用户画像或跨站追踪。启用后重新检查隐私说明、免费额度及跨境可达性；迁移大陆前可完全移除统计脚本，不影响内容和 URL。

## 迁移与恢复

```sh
git clone <your-repository-url>
cd <repository>
npm ci
SITE_MODE=production npm run verify
```

把 `dist/` 内容部署到 Nginx、对象存储+CDN或任意静态托管。保留原域名、HTTPS、目录索引、尾斜杠与重定向，URL 不变。没有 Cloudflare runtime、Functions、数据库或服务器秘密依赖。先验证新源站，再由本人确认关键 DNS 修改；不要提前删除旧站。中国大陆托管应先完成适用备案手续，本项目不自动处理备案。

GitHub 不应是唯一备份：定期在另一台设备保存完整 clone 或 `git bundle create knowledge-backup.bundle --all`，连同必要静态资源备份；重要图片留在 public，避免唯一副本放在 SaaS。不要将 bundle 提交回网站仓库。恢复：`git clone knowledge-backup.bundle restored-site`，再按以上命令构建。维护好域名续费、恢复邮箱和账号 2FA，凭证由本人管理。

回滚优先 `git revert <commit>` 后推送，自动重新构建；不要强制改写发布历史。也可以临时回退托管版本，但随后要让 Git 与线上版本重新一致。

## 检查范围与限制

自动检查 schema、重复 slug、Topic 引用、目录/type、未来日期、空正文、HTML H1/heading 层级、主内容 landmark、图片 alt、canonical、metadata、JSON-LD、站内链接和锚点、站点地图目标及零客户端 JS。外部网站可能限流或发生变化，不在每次发布阻塞式检查；作者审核引用。浏览器响应式/可访问性检查结果见 verification.md。没有引入数据库、Docker、CMS、测试服务或付费依赖。
