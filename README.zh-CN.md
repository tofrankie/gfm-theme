# gfm-theme

> [English](./README.md) | 中文

这是 [Markdown Preview Enhanced](https://github.com/shd101wyy/vscode-markdown-preview-enhanced) 的 Customize CSS，使预览贴近 GitHub Flavored Markdown（GFM）的原生观感与排版细节。

## 🧭 背景

作者长期使用 Markdown Preview Enhanced 来预览本地 Markdown 文件，但发现其与 GitHub 的原生 Light 主题仍有明显差距。深入发现，扩展内部的样式会覆盖 GitHub Light 主题，导致一些细节（比如字体、排版、边距等）无法按 GitHub 的预期呈现。因此才想到用 [Customize CSS](https://shd101wyy.github.io/markdown-preview-enhanced/#/customize-css) 的方式去修正。

## 🚀 使用方式

1. 在 [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced) 或 [Open VSX](https://open-vsx.org/extension/shd101wyy/markdown-preview-enhanced) 下载安装 Markdown Preview Enhanced 扩展
2. 确保 Markdown Preview Enhanced 扩展的 Preview Theme 是 `github-light` 主题（它是默认主题）
3. 在命令面板输入 `Markdown Preview Enhanced: Customize CSS (Global)` 打开全局 `style.less` 文件。
4. 将 [github-light.less](./github-light.less) 内容覆盖本地的 `style.less` 文件。

全局 `style.less` 文件路径：

- macOS: `~/.local/state/crossnote/style.less`
- Linux: `~/.config/crossnote/style.less`
- Windows: `%USERPROFILE%\.crossnote\style.less`

我的 `settings.json` 配置：

```json
{
  "markdown-preview-enhanced.previewTheme": "github-light.css",
  "markdown-preview-enhanced.codeBlockTheme": "github.css"
}
```

## 🔍 对比

| 🆕 New                      | 🔄 Original                      |
| :-------------------------- | :------------------------------- |
| ![](./images/light-new.png) | ![](./images/light-original.png) |

## 🧩 TODO

- [ ] 适配 GitHub Dark 主题
- [ ] 添加 [Mona Sans VF](https://github.com/github/mona-sans) 字体

## ❤️ 致谢

- [shd101wyy/vscode-markdown-preview-enhanced](https://github.com/shd101wyy/vscode-markdown-preview-enhanced)
- [sindresorhus/github-markdown-css](https://github.com/sindresorhus/github-markdown-css#readme)
