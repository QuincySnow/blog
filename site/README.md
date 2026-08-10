# Astro Blog（Bun）

使用 Bun 创建的 Astro 博客，文章来自 `src/content/blog/`，frontmatter 使用 `pubDatetime`、`modDatetime`、`tags`、`draft`（已通过 schema 映射为 `pubDate`/`updatedDate`）。草稿文章不会出现在列表和路由中。

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and Open Graph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun dev`             | Starts local dev server at `localhost:4321`      |
| `bun build`           | Build your production site to `./dist/`          |
| `bun preview`         | Preview your build locally, before deploying     |
| `bun run test`        | 运行 Vitest 单元测试                             |
| `bun run test:watch`  | Vitest 监听模式                                  |
| `bun run test:e2e`    | 运行 Playwright E2E 测试（会先启动 preview 端口 4323） |
| `bun run test:e2e:ui`| Playwright 交互 UI 运行 E2E                      |
| `bun lighthouse`      | 本地 Lighthouse 测评（需先 `bun run preview`，且本机已安装 Chrome/Chromium） |
| `bun astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI                     |

## 🧪 测试（Vitest + Playwright）

- **单元**：Vitest，配置在 `vitest.config.ts`，用例在 `src/**/*.test.ts`。
  - `consts.test.ts`：`SITE_TITLE`、`BASE_PATH`、`withBase` 各种路径与纯度。
  - `i18n.test.ts`：`DEFAULT_LANG`、i18n 结构、`getStoredLang`/`setStoredLang`、`getStoredTheme`/`setStoredTheme`（含 SSR 与 localStorage mock）。
- **E2E**：Playwright，配置在 `playwright.config.ts`，用例在 `e2e/*.spec.ts`。
  - `home.spec.ts`：首页标题、导航链接（含 base 前缀）、主题/语言按钮、文章列表页。
  - `about.spec.ts`：关于页、作品集标题、GitHub 链接。
  - `tags.spec.ts`：标签列表页与标题。
  - `blog-post.spec.ts`：文章详情页、标题与目录/正文、返回列表。
  - `interaction.spec.ts`：搜索弹窗（打开、输入、Escape 关闭）、主题切换（`data-theme`）、语言切换（`lang` 与导航文案）。
- 会自动执行 `bun run preview -- --port 4323` 并访问 `http://localhost:4323/blog`；若本机已有 preview 在 4323，会复用（`reuseExistingServer`）。
- 首次跑 E2E 需安装浏览器：`bunx playwright install chromium`（或 `bunx playwright install` 装全部）。

## 📊 本地 Lighthouse 测评

1. 构建并启动预览：`bun run build && bun run preview`（预览默认在 `http://localhost:4321`）。
2. 另开终端执行：`bun run lighthouse`。会检测 `http://localhost:4321/blog` 并生成 `lighthouse-report.html`，完成后自动在浏览器打开。

**注意**：Lighthouse 依赖本机已安装的 **Chrome 或 Chromium**。若在 WSL 下报 “No Chrome installations found”：
- 在 WSL 内安装 Chromium：`sudo apt install chromium-browser`，或
- 在 Windows 上打开 Chrome，访问 [Chrome 的 Lighthouse](https://developer.chrome.com/docs/lighthouse/)（DevTools → Lighthouse），对 `http://localhost:4321/blog` 测评（需确保 WSL 的 4321 端口已转发到 Windows）。

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
