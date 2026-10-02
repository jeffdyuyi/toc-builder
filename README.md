# 克苏鲁迷踪车卡器

用于《克苏鲁迷踪》（Trail of Cthulhu / TOC）的中文网页建卡与跑团辅助工具。支持调查员资料、能力配点、点数池、装备笔记和角色卡导出。

[在线使用](https://jeffdyuyi.github.io/toc-builder/) · [源码仓库](https://github.com/jeffdyuyi/toc-builder) · [部署记录](https://github.com/jeffdyuyi/toc-builder/actions)

## 功能与使用

- **建卡与跑团**：支持职业、动力、规则风格、人数与自定义点数预算；能力等级和当前池分开管理。点击能力名称查看详情与检定，名称后的「本职」按钮单独切换本职标记。
- **预设角色**：点击「使用预设角色」载入五位调查员的独立副本。载入会替换当前页面内容，请先保存；不会直接覆盖正式存档，同名手动保存仍会覆盖上一版。
- **头像**：30 张内置三十年代头像随项目部署，也允许上传自定义图片。选用的头像数据随角色存档与 JSON 备份保存，不依赖来源网站在线。
- **装备与笔记**：装备库、道具表、战役备忘录和基础文字格式。
- **保存与导出**：浏览器本地保存、JSON 完整备份及导入、Markdown 和完整 PNG 角色卡导出。
- **手机操作**：底部切换角色资料、能力点数、装备笔记和指南规则；更多导入、导出、读取和等级编辑操作位于顶部菜单。

填写角色并分配能力后，点击「本地保存」。点数完整且无警告时进入跑团模式；其他情况下可确认继续完成，或取消并保存草稿。跑团时能力页显示当前池，可消耗点数或进行 D6 检定。「恢复能力池」恢复至等级，「编辑等级」返回建卡并重置当前池，使用前建议导出 JSON。

## 存档与恢复

编辑后约 0.5 秒自动保存当前草稿，页面隐藏或离开时也会尝试保存。再次打开可恢复草稿或先下载 JSON。草稿与正式角色存档使用独立记录；同名手动保存保留上一版，可在「读取本地」中恢复。

存档绑定当前浏览器和站点地址，无账号与云端同步。清除站点数据、换浏览器或迁移域名不会自动转移记录。存储不可用或空间不足时会提示，请定期导出 JSON。PNG 和 Markdown 不能替代可恢复的 JSON 备份。

支持旧版存档读取；旧版未记录的规则配置使用默认值，已被扣减的原始等级无法自动推算。本项目整理目录不改变存档键或网站地址。

## 本地开发

使用 Node.js 22 和 npm。在仓库根目录执行：

```sh
npm --prefix toc-builder ci
npm --prefix toc-builder run dev
```

按终端提示打开本地地址。验证与构建：

```sh
npm --prefix toc-builder test
npm --prefix toc-builder run lint
npm --prefix toc-builder run build
npm --prefix toc-builder run preview
```

生产文件输出到 `toc-builder/dist/`，无需原始 PDF、Excel、解析工具或开发依赖即可部署。依赖安装目录、构建输出、环境配置和临时文件由根目录 `.gitignore` 排除。

## 项目结构

```text
.github/workflows/deploy.yml       自动验证与 GitHub Pages 部署
README.md                         使用、开发与维护说明
THIRD_PARTY_NOTICES.md             第三方素材与版权范围
toc-builder/
  index.html                      应用入口
  public/favicon.svg              项目图标
  public/avatars/labyrpg-1930s/    头像、来源清单与校验值
  src/App.tsx                     页面协调、保存与导出
  src/components/                 角色、能力、装备、规则与选择器
  src/data/                       数据模型、存档逻辑与规则资料
  src/data/presetCards/            五份预设角色 JSON
  src/index.css                   公共样式与响应式布局
  tests/character.cjs              数据、预设、存档与头像回归检查
```

预设 JSON 是内置角色的唯一数据来源，修改后重新构建即可更新。头像清单 `manifest.json` 记录原始来源和 SHA-256 校验值。规则资料尚未完成逐条原书校对，提示不能替代主持人的判断；罗杰与诺曼预设心智为 12，保留原卡数值并显示默认上限提示。

## 部署

推送 `main` 或 `master` 后，GitHub Actions 使用锁定依赖执行测试、代码检查和构建，再发布 `dist/` 到 GitHub Pages。复用仓库时，将 **Settings → Pages → Source** 设置为 **GitHub Actions**。Vite 使用相对资源路径，支持项目子目录托管。

## 作者与联系

作者：**不咕鸟（哈基米德）**。辅助 AI：**Antigravity Gemini 3.8 / GPT-6.1**。

欢迎直接联系或者加群讨论模组、规则以及造轮子、修 BUG。

- 不咕鸟创作交流群：261751459
- 成都秘密基地 TRPG 俱乐部群：691707475
- [成都秘密基地 TRPG 俱乐部](https://nogubird.top/)
- [为作者加油](https://ifdian.net/a/nogubird)

## 版权与复用

本工具与 TOC 官方无关联。规则文字、预设角色和头像的版权归各自权利人所有，第三方素材不因源码公开而获得重新授权。图片来源为[乐博睿《克苏鲁迷踪》免费资源](https://labyrpg.com/products/toc/resources.html)，若侵权请联系删除。

具体范围见 [第三方说明](THIRD_PARTY_NOTICES.md)。目前仓库未指定原创代码的开源许可证；源码公开不等同于获得任意再分发授权。在作者确认许可证之前，保留原有个人及亲友团、非商业使用范围。
