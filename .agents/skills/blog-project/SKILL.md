---
name: blog-project
description: Conventions and structure for this Astro blog (QuincySnow). Use when editing the blog, adding pages or links, changing navigation, or working in site/ or content. Covers base path, internal links, i18n, layout, static assets (images/, gif/), package manager (Bun required—must use Bun, not npm/yarn/pnpm), and Find Skills (use bunx, not npx).
---

# Blog 项目约定

本 Skill 描述本仓库中 Astro 博客的目录与约定，便于增改页面、链接与内容时保持一致。

## 包管理器：必须使用 Bun

- **本仓库规定：必须使用 Bun**，禁止使用 npm、yarn、pnpm 等。所有与本仓库相关的命令、文档、Skill 示例均以 Bun 为准。
- 安装依赖：`bun install`（在 `site/` 下执行）。
- 开发：`bun run dev`；构建：`bun run build`；其它脚本一律用 `bun run <script>`。
- 添加依赖时用 `bun add <pkg>` 或 `bun add -d <pkg>`，禁止写 `npm install` / `npm i` / `yarn` / `pnpm` 等。
- 文档、注释、Skill 中的示例命令均必须使用 Bun；本仓库内所有 Skills（含 astro、deploy-to-vercel、browser-debugging 等）的 CLI 示例一律为 `bunx`/`bun run`，禁止使用 `npx`/`npm run`。

### 查找与添加 Skills（Find Skills）

- **查找 / 添加社区 Skills**（如从 [SkillsMP](https://skillsmp.com/) 或 GitHub 安装）时，一律使用 **`bunx`**，不用 `npx`：
  - 添加 Skill：`bunx skills add <owner/repo>` 或 `bunx skillsmp add …`
  - 不要写 `npx add-skill`、`npx skills add`、`npm install -g` 等。
- 本仓库内涉及「找 Skill / 装 Skill」的说明与示例均以 `bunx` 为准。

## 项目位置与 base

- 站点源码在 **`site/`** 下；构建输出为 `site/dist/`。
- 配置了 **`base: '/blog'`**（`site/astro.config.mjs`），站点部署在子路径 `/blog` 下（如 GitHub Pages）。
- **所有站内链接必须带 base 前缀**，不能写死 `/about`、`/search` 等，否则在子路径部署下会失效。

## 内部链接：必须用 withBase

- **`site/src/consts.ts`** 提供：
  - `BASE_PATH`：当前 base（如 `/blog`）
  - **`withBase(path: string): string`**：给路径加上 base 前缀
- 规则：
  - 所有站内 **`href`**（导航、列表、搜索页、资源链接等）一律用 **`withBase('/...')`** 生成。
  - 示例：`href={withBase('/')}`、`href={withBase('/about')}`、`href={withBase(\`/posts/${post.id}/\`)}`。
- 已统一使用 withBase 的位置：
  - **Header**：站名、首页/博客/关于（通过 HeaderLink）、搜索按钮
  - **HeaderLink.astro**：对传入的 `href` 用 `withBase(href)` 再输出
  - **BaseHead**：favicon、sitemap、RSS、字体 preload
  - **首页 / 博客列表 / 搜索页**：文章链接、“全部文章”链接
- **新增页面或新链接时**：从 `../consts`（或 `../../consts`，视文件位置）引入 `withBase`，用 `href={withBase('/your-path')}`，不要写裸 `/your-path`。

## 路由与页面

- 首页：`site/src/pages/index.astro` → `/`（实际访问为 `/blog/`）
- 文章列表：`site/src/pages/posts/index.astro` → `/posts`
- 文章详情：`site/src/pages/posts/[...slug].astro` → `/posts/:slug`
- 关于：`site/src/pages/about.astro` → `/about`（含开源作品集，详见下方「关于页与开源作品集」）。
- 标签列表：`site/src/pages/tags.astro` → `/tags`
- 标签详情（某标签下的文章列表）：`site/src/pages/tags/[tag].astro` → `/tags/:tag`，链接用 `withBase('/tags/' + encodeURIComponent(tagName))`。
- 文章内与标签页的标签均指向 **`/tags/[tag]`**，不再使用 `?search=` 搜索。
- 搜索为 Header 内弹窗，无独立 `/search` 页面。
- 新增页面时，在导航或其它入口用 **`withBase('/your-route')`** 链接过去。

## 导航与 active 状态

- **Header.astro**：站名、HeaderLink（Home/Blog/About）、搜索按钮；所有链接已用 withBase。
- **HeaderLink.astro**：接收“逻辑路径”（如 `/`、`/blog`、`/about`），内部用 `withBase(href)` 输出真实 href；active 判断基于去掉 base 后的 pathname，无需在调用处再写 base。
- 若在客户端脚本里根据 pathname 做分支（如设置 document.title），需先去掉 base 再比较；Header 中已通过 `define:vars={{ basePath: BASE_PATH }}` 传入并做字符串截断。

## 静态资源：images 与 gif

- **`site/public/images/`**：存放文章或页面用到的静态图片（PNG、JPG、WebP 等）。直接放入即可，构建时原样输出。
- **`site/public/gif/`**：存放动图（GIF 等）。同上，原样输出。
- **引用方式**：`public/` 下文件部署后对应站点根路径；因配置了 `base: '/blog'`，在 Markdown 或组件中引用时需带 base：
  - 图片：`withBase('/images/文件名.png')` 或 Markdown：`![alt](url)` 中 url 使用绝对路径 `/blog/images/xxx.png`（或通过布局注入 base 的完整 URL）。
  - 动图：`withBase('/gif/文件名.gif')`。
- 文章正文内引用：若使用 Markdown 图片语法，可写 `![描述](/blog/images/xxx.png)`；若在 Astro 组件里用 `<img>`，用 `src={withBase('/images/xxx.png')}`。

## 资源与 head

- **BaseHead.astro**：canonical、favicon、sitemap、RSS、字体 preload 等均已使用 `withBase(...)`。
- 新增 head 内资源（如新 favicon、新字体）时，**href 使用 `withBase('/path/to/asset')`**，保证在子路径下可正确加载。

## 内容与 i18n

- 博客正文：`site/src/content/blog/`（MD/MDX）。
- 全局文案与多语言在 **`site/src/i18n.ts`**，通过 `data-i18n`、`data-i18n-placeholder` 与 Header 内脚本中的 `i18n` 使用（中/英）。
- 新增需翻译的 UI 时，在 i18n 中增加对应 key，并在组件上使用 `data-i18n="key"` 或占位符 key。

## 文章语言（lang）与中英文版本

- **Frontmatter**：每篇文章在 **`site/src/content.config.ts`** 的 blog schema 中支持可选字段 **`lang: 'zh' | 'en'`**。中文文章必须写 **`lang: zh`**，英文文章必须写 **`lang: en`**。
- **中文原文**：放在 `site/src/content/blog/` 下，文件名如 `YYYY-MM-DD-slug.md`，frontmatter 中包含 **`lang: zh`**。
- **英文版本**：同一主题的英文文章使用独立文件，文件名带 **`-en`** 后缀，如 `YYYY-MM-DD-slug-en.md`，frontmatter 中包含 **`lang: en`**。标题、描述与正文为英文；正文可为完整译文或摘要 +「详见中文版」链接。
- **站内互链**：在英文版正文中引用中文版时，使用**相对路径**（同目录 slug），例如 `[Chinese version](slug-without-en)`，以便在 `base: '/blog'` 下正确解析。
- **日期与 UI**：站点根据当前界面语言（中/英）显示日期格式（`dateLocale` 在 i18n 中配置）；列表与文章页的日期会随语言切换更新。

## 文章内部链接

在 Markdown 文章正文中引用站内其他文章时，应使用**带 base 的绝对路径**：

- **中文文章引用中文文章**：`[Fan Control 使用指南](/blog/posts/zh/2026-04-19-fan-control-ddu-guide)`
- **英文文章引用英文文章**：`[Fan Control Guide](/blog/posts/en/2026-04-19-fan-control-ddu-guide-en)`
- **英文文章引用中文文章**：使用 `/blog/posts/zh/` 前缀，如 `[中文版](/blog/posts/zh/2026-04-19-fan-control-ddu-guide)`

**注意**：因为每篇文章构建后位于独立子目录（如 `/blog/posts/zh/2026-04-19-amd-driver-install-guide/index.html`），相对路径会指向错误的子目录，必须使用带 base 前缀的绝对路径。

**错误示例**：
```markdown
[DDU](2026-04-19-fan-control-ddu-guide)  ❌ 相对路径会指向子目录
```

**正确示例**：
```markdown
[DDU](/blog/posts/zh/2026-04-19-fan-control-ddu-guide)  ✅
[DDU](/blog/posts/en/2026-04-19-fan-control-ddu-guide-en)  ✅
```

## 布局与样式

- 通用布局：**`site/src/layouts/BlogPost.astro`**（文章与关于页共用）；含代码块顶栏、TOC、全局样式等。
- 全局样式：**`site/src/styles/global.css`**；组件内使用 `<style>` 或 `is:global` 按需。
- 正文与 TOC 比例：正文区约 75–80%，右侧目录约 20–25%；大屏下正文 max-width 980px，目录 300px。

## 关于页与开源作品集

- **关于页**：`site/src/pages/about.astro`。当前内容为「我的开源作品集」：项目列表在 frontmatter 的 **`projects`** 数组（每项含 `slug`、`github`、`demoUrl`、`demoLabelKey`、`nameKey`、`descKey`、`techKey`）。
- **文案**：中英文均在 **`site/src/i18n.ts`** 的 `about` 下（如 `portfolioTitle`、`portfolioIntro`、`linkGitHub`、`linkDemo`、`devSetupName`、`focusFlowName` 等）。新增项目时在 `projects` 增加一项并在 i18n 的 `about` 中增加对应 `*Name` / `*Desc` / `*Tech`（中英各一份）。
- **模板注意**：模板中不要写 `as Record<string, string>`（Astro 会把 `>` 当标签结束），在 frontmatter 里用 `metaZhMap` / `metaEnMap` 做键值访问。
- **GitHub**：本站作者 GitHub 用户名为 **QuincySnow**，作品集外链使用 `https://github.com/QuincySnow/<repo>`。

## 检查清单（改链接或加页面时）

- [ ] 新链接使用 `withBase('/...')`，未写死根路径 `/xxx`
- [ ] 若在 Header/导航加入口，使用 HeaderLink 或带 withBase 的 `<a>`
- [ ] 新 head 资源（favicon、字体等）使用 withBase
- [ ] 新图片/动图放入 `site/public/images/` 或 `site/public/gif/`，引用时用 `withBase('/images/...')` 或 `withBase('/gif/...')`
- [ ] 新文章：中文稿加 `lang: zh`；英文稿用 `-en.md` 且加 `lang: en`；正文内跨语言引用用绝对路径
- [ ] 文章内部链接使用带 base 的绝对路径（如 `/blog/posts/zh/2026-04-19-fan-control-ddu-guide`）
- [ ] 关于页新增项目：在 `projects` 与 i18n `about` 中补全，避免在模板中使用 `Record<string, string>` 类型断言
- [ ] 构建通过：`cd site && bun run build`（必须用 Bun，不要用 npm run build）

## 检查清单（从 AI 草稿创建文章时）

- [ ] 创建中文版 `site/src/content/blog/zh/YYYY-MM-DD-slug.md`，frontmatter 含 `lang: zh`
- [ ] 删除 AI 生成的「建议」「推荐」等非内容段落
- [ ] 创建英文版 `site/src/content/blog/en/YYYY-MM-DD-slug-en.md`，frontmatter 含 `lang: en`
- [ ] description 含冒号时加引号：`description: "内容"`
- [ ] 构建通过：`cd site && bun run build`

## 从 AI 草稿创建文章

当用户提供了 AI 生成的草稿内容时，按以下流程处理：

1. **创建中文版**：在 `site/src/content/blog/zh/` 下创建 `YYYY-MM-DD-slug.md`，frontmatter 包含 `lang: zh`
2. **清理 AI 内容**：删除草稿中的「写博客建议」「相关阅读推荐」等 AI 输出痕迹段落，保留纯内容
3. **创建英文版**：在 `site/src/content/blog/en/` 下创建 `YYYY-MM-DD-slug-en.md`，frontmatter 包含 `lang: en`
4. **验证构建**：`cd site && bun run build` 确保通过

### YAML 注意事项

- frontmatter 中的 description 包含冒号时必须加引号：`description: "内容"`
- 避免使用未转义的冒号导致解析错误

## Markdown 锚点语法注意事项

**禁止使用** `{#anchor}` 语法！此语法会导致标题渲染异常（显示为纯文本而非 `<h2>`/`<h3>` 标签）。

**正确做法**：使用 `<span id="anchor"></span>` HTML 锚点：

```markdown
## 标题<span id="my-anchor"></span>
```

或直接省略锚点，依赖自动生成的 slug（如 `## 我的标题` → `#我的-标题`）。

**错误示例**：
```markdown
## 我的标题 {#my-anchor}  ❌ 会导致标题渲染异常
```

**正确示例**：
```markdown
## 我的标题<span id="my-anchor"></span>  ✅
```

**注意**：不要在 Markdown 标题前插入 `<div>` 等块级元素，会打断解析。
