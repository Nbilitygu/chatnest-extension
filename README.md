# ChatNest - AI 对话导航

为 AI 对话平台提供极简侧边导航，像 VS Code Minimap 一样在右侧标记你的每一次提问，支持 hover 预览和一键跳转定位。

## 功能特性

- **DeepSeek 风格侧边栏**：右侧窄条标记所有提问，hover 向左展开完整面板，点击快速定位
- **动态标记高度**：基于消息密度自适应，密集时不重叠，稀疏时更醒目
- **5 大平台支持**：ChatGPT、Gemini、Kimi、豆包、腾讯元宝
- **暗色模式自动检测**：根据页面主题自动切换深浅配色
- **弹窗开关控制**：一键开启/关闭导航功能
- **Shadow DOM 兼容**：支持豆包等使用 Shadow DOM 的平台
- **虚拟滚动适配**：支持 Kimi、豆包等使用虚拟滚动的平台，点击跳转稳定可靠

## 支持的 AI 对话平台

| 平台 | 网址 |
|------|------|
| ChatGPT | chatgpt.com |
| Gemini | gemini.google.com |
| Kimi | kimi.com / kimi.moonshot.cn |
| 豆包 | doubao.com |
| 腾讯元宝 | yuanbao.tencent.com |

## 安装方式

### 方式一：Chrome 应用商店（推荐）

> 待上架

### 方式二：开发者模式加载

1. 下载或克隆本仓库
2. 执行 `npm install && npm run build` 构建
3. 打开 Chrome 扩展管理页 `chrome://extensions/`
4. 开启右上角「开发者模式」
5. 点击「加载已解压的扩展程序」，选择 `dist` 文件夹

## 使用说明

1. 打开任意支持的 AI 对话页面
2. 右侧会出现距边 20px 的窄条导航标记
3. **Hover**：鼠标移入窄条，面板向左展开，显示所有提问列表
4. **点击**：点击列表项或标记横条，自动滚动到对应提问
5. **开关控制**：点击扩展图标中的开关，可临时开启/关闭导航

## 技术栈

- TypeScript
- Vite
- Chrome Extension Manifest V3
- 原生 DOM API（无框架依赖，体积轻量）

## 开发构建

```bash
npm install
npm run dev    # 开发模式
npm run build  # 生产构建（输出到 dist/）
```

## 项目结构

```
chatnest-extension/
├── src/
│   ├── content.ts          # 内容脚本入口
│   ├── platforms/          # 各平台 DOM 适配器
│   ├── ui/                 # 侧边栏、样式、Tooltip
│   ├── utils/              # 存储、滚动、节流
│   └── popup/              # 扩展弹窗
├── manifest.json           # 扩展配置
├── vite.config.ts          # 构建配置
└── ...
```

## License

MIT
