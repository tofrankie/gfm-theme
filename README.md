# gfm-theme

> English | [中文](./README.zh-CN.md)

This repo provides a **Customize CSS** stylesheet for [Markdown Preview Enhanced](https://github.com/shd101wyy/vscode-markdown-preview-enhanced), making the preview experience closer to GitHub Flavored Markdown (GFM) with GitHub’s native look and spacing details.

## 🧭 Background

I’ve been using Markdown Preview Enhanced for a long time to preview local Markdown files, but noticed it still differs a lot from GitHub’s native Light theme. After digging in, I found that the extension’s built-in styles override parts of the GitHub Light theme, so some details (fonts, layout, spacing, etc.) don’t render as expected on GitHub.

That’s why this project uses [Customize CSS](https://shd101wyy.github.io/markdown-preview-enhanced/#/customize-css) to patch and align the styles.

## 🚀 Usage

1. Install the Markdown Preview Enhanced extension from [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced) or [Open VSX](https://open-vsx.org/extension/shd101wyy/markdown-preview-enhanced)
2. Make sure the Preview Theme is set to `github-light` or `github-dark`
3. In the command palette, run `Markdown Preview Enhanced: Customize CSS (Global)` to open the global `style.less`
4. Replace the content of your local `style.less` with the content from [github-markdown.less](./shd101wyy.markdown-preview-enhanced/github-markdown.less)

Global `style.less` file locations:

- macOS: `~/.local/state/crossnote/style.less`
- Linux: `~/.config/crossnote/style.less`
- Windows: `%USERPROFILE%\\.crossnote\\style.less`

Example `settings.json`:

```json
{
  "markdown-preview-enhanced.previewTheme": "github-light.css",
  "markdown-preview-enhanced.codeBlockTheme": "github.css"
}
```

## 🔍 Comparison

| 🆕 New                      | 🔄 Original                      |
| :-------------------------- | :------------------------------- |
| ![](./images/light-new.png) | ![](./images/light-original.png) |

## 🧩 TODO

- [x] Support GitHub Dark theme
- [ ] Add the [Mona Sans VF](https://github.com/github/mona-sans) font

## ❤️ Acknowledgements

- [shd101wyy/vscode-markdown-preview-enhanced](https://github.com/shd101wyy/vscode-markdown-preview-enhanced)
- [sindresorhus/github-markdown-css](https://github.com/sindresorhus/github-markdown-css#readme)
