# YgoCardEngine · 游戏王组卡器

在线搜索游戏王卡片、配置卡组，一键生成分享链接，并能把卡组嵌入到任何网站。

- **卡片检索**：卡名 / 效果文本 / 卡号关键词，按类型、属性、种族、字段（系列）、等级、攻守、禁限、地区筛选
- **组卡**：双击、`+` 按钮或拖拽加卡；卡组之间拖动调整；双击 / 右键移除；按禁卡表自动限制数量并校验卡组
- **查看**：点击任意卡片看详情，大图放大查看，`←` `→` 翻页，手机上可左右滑动
- **分享**：分享链接（卡组整个编码在 URL 里，不需要服务器）、`ydke://` 卡组码、`.ydk` 文件导入导出
- **嵌入**：`<ygo-deck>` Web Component 或 iframe，放进博客 / 论坛 / 个人主页
- **其他**：本地保存多个卡组、试抽起手、深色模式、手机适配

## 技术选型

旧版是 ASP.NET Core + EF Core 的后端 API，卡组存在服务器数据库里，还需要单独做前端和用户系统。
重新评估后改为 **纯静态前端**：

| 需求 | 方案 |
| --- | --- |
| 卡片数据库 | 构建时把 YGOPro 的 `cards.cdb` 转成静态 JSON，浏览器内检索（1.5 万张卡，gzip 后约 1.2 MB） |
| 分享卡组 | 卡组编码进链接（`ydke://` 格式，YGOPro / EDOPro 通用），不需要账号和数据库 |
| 嵌入其他网站 | 编译出独立的 Web Component，Shadow DOM 隔离样式，任何网站一个 `<script>` 就能用 |
| 部署 | 任意静态托管（GitHub Pages / Cloudflare Pages / Nginx），零运维 |

语言与框架：**TypeScript + React 19 + Vite**，状态管理用 zustand。

- 组卡器、分享页、iframe 嵌入页、`<ygo-deck>` 组件共用同一套 React 组件（`src/components/`）
- `<ygo-deck>` 是一个原生 Custom Element，内部用 React 渲染到 Shadow DOM，宿主网站不需要装 React
- 数据构建脚本同样用 TypeScript，直接用 Node 内置的 `node:sqlite` 读取 cdb，不需要额外依赖

### 为什么运行时不用数据库

SQLite（cdb）只在**构建时**读一次，转成静态 JSON；运行时浏览器里直接检索 1.5 万张卡，一次检索实测在 30 毫秒以内，
没有服务器、也没有数据库查询，所以不存在数据库性能问题。

以后如果需要账号、云端卡组、短链接、卡组统计等功能，再加一个轻量 API（例如 Node + PostgreSQL），
把卡组存进 PostgreSQL 即可；卡片数据本身仍建议保持静态，前端结构不用改。

## 卡片数据

| 来源 | 说明 |
| --- | --- |
| [mycard/ygopro-database](https://github.com/mycard/ygopro-database) `locales/zh-CN/cards.cdb` | 简体中文卡片库，持续更新（优先使用） |
| [mycard/ygopro](https://github.com/mycard/ygopro) `lflist.conf` | 禁限卡表（OCG / TCG 历年） |
| `data/strings.conf`、`data/lflist.conf` | 仓库内的快照，下载失败时使用 |
| `Database/cards.db` | 旧项目保留的数据（2020 年，约 1 万张），上游数据不可用时的兜底 |

```bash
npm run data:update   # 下载最新数据到 data/cache/ 并生成 public/data/
npm run data          # 不联网，用缓存或仓库自带数据生成
```

卡图体积太大不放进仓库，运行时从公共图床加载（`src/lib/images.ts`），全部失败时显示文字卡面。
可以用环境变量 `VITE_CARD_IMAGES` 换成自己的图床，例如：

```bash
VITE_CARD_IMAGES="https://img.example.com/pics/{id}.jpg" npm run build
```

## 开发

需要 Node.js 22.18+。

```bash
npm install
npm run data:update   # 首次运行：下载最新卡片数据
npm run dev           # 本地开发 http://localhost:5173
npm run check         # 类型检查
npm test              # 单元测试
npm run build         # 构建到 dist/
```

## 部署

`dist/` 是纯静态文件，放到任何静态托管即可（所有路径都是相对路径，可部署在子目录下）。

仓库自带 GitHub Actions（`.github/workflows/deploy.yml`）：推送到 `master` 时自动构建并发布到 GitHub Pages，
并且每天自动拉取一次最新卡片数据重新发布。首次使用需要在仓库 **Settings → Pages** 里把 Source 设为 **GitHub Actions**。

## 嵌入到其他网站

在组卡器里点「分享 / 嵌入」即可复制代码。

### 方式一：Web Component（推荐）

```html
<script type="module" src="https://你的站点/ygo-deck.js"></script>

<ygo-deck name="我的卡组" deck="ydke://..."></ygo-deck>

<!-- 也可以把 YDK 内容直接写在标签里 -->
<ygo-deck name="我的卡组">
#main
14558127
...
</ygo-deck>
```

| 属性 | 说明 |
| --- | --- |
| `deck` | `ydke://` 卡组码或 YDK 文本；不填则读取标签内文本 |
| `name` | 卡组名称 |
| `compact` | 紧凑模式（卡片更小） |
| `toolbar="false"` | 隐藏「复制卡组码 / 下载 YDK / 在组卡器中打开」按钮 |
| `theme="light"` / `theme="dark"` | 固定浅色 / 深色，默认跟随系统 |

高度自适应，样式与宿主页面隔离，点击卡片会在页面上弹出大图。
如需替换卡图地址，在加载脚本前设置 `window.YGO_DECK_IMAGE_SOURCES = ['https://.../{id}.jpg']`。

### 方式二：iframe

```html
<iframe src="https://你的站点/embed.html#deck=ydke%3A%2F%2F...&name=..." style="width:100%;height:640px;border:0"></iframe>
```

hash 参数额外支持 `compact`、`theme=light|dark`。iframe 页面会向父页面发送
`{ type: 'ygo-deck:height', height }` 消息，可用来自动调整 iframe 高度。

## 目录结构

```
Database/              旧项目保留的卡片数据（兜底）
data/                  禁卡表、字段名快照；cache/ 为下载的上游数据（不入库）
scripts/build-data.ts  cdb → 静态 JSON（全量 + 按 id 分片）
src/lib/               卡片模型、卡组格式（YDK / ydke / 链接）、检索、数据加载
src/components/        卡图、卡片详情、放大查看、只读卡组展示（组卡器与嵌入共用，样式在 components.css）
src/app/               组卡器页面（store.ts 为全局状态）
src/embed/             iframe 嵌入页与 <ygo-deck> Web Component
```
