# 第三方内容说明

源码、第三方规则资料、预设角色和图片需分别处理版权；本文件不是第三方素材的授权文件。

## 头像

- 目录：`toc-builder/public/avatars/labyrpg-1930s/`。
- 来源：[乐博睿《克苏鲁迷踪》免费资源页面](https://labyrpg.com/products/toc/resources.html)的「三十年代角色头像」。
- 共 30 张 JPEG，原图地址和 SHA-256 校验值见该目录 `manifest.json`。
- 图片版权归原权利人所有，用于本工具的非商业角色创建、跑团交流及角色卡导出。
- 若侵权请联系删除，可通过不咕鸟创作交流群（261751459）联系作者。

## 规则文字与预设角色

`toc-builder/src/data/constants.ts`、`equipment.ts`、`skillDescriptions.ts` 以及规则页面包含《克苏鲁迷踪》相关规则资料；`src/data/presetCards/` 中五张角色卡由用户提供的角色文本整理而来。相关规则、角色背景与原资料的版权归各自权利人所有，不因本项目公开而重新授权，也不应被当作项目原创代码使用许可的组成部分。

仓库不包含原始参考 PDF、Excel、职业能力文本及其解析工具。上述功能数据仍用于车卡器，删除参考文件不代表这些文字成为项目原创作品。

## 软件依赖

依赖和版本由 `toc-builder/package.json`、`package-lock.json` 记录，使用时遵循各依赖发布包附带的许可证。依赖安装目录不纳入版本控制。
