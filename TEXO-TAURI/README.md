# Texo Tauri Shell

This folder provides a thin Tauri desktop shell for the Texo Nuxt app. It keeps
the web UI but adds global shortcuts, system screenshot capture, and
tray/background behavior.

## Features
- Global screenshot hotkey (default: Alt+Q).
- System selection screenshot (Windows snip / macOS screencapture / Linux
  flameshot or gnome-screenshot).
- Screenshot auto-injected into the OCR page, no manual paste needed.
- Clipboard writes work in background (no window focus needed).
- Tray menu (show/hide, screenshot, quit) and close-to-tray.
- Single-instance guard.
- Hotkey UI shown only in desktop builds.

## Requirements
- Node.js + pnpm (see repo root).
- Rust toolchain (cargo) for Tauri builds.
- Linux: install `flameshot` or `gnome-screenshot`.

## Install
From repo root:
```bash
pnpm install
```

From `TEXO-TAURI`:
```bash
pnpm install
```

## Development
```bash
pnpm dev
```
This starts the Nuxt dev server at `http://localhost:1420` and launches the
Tauri shell.

## Build (Desktop)
```bash
pnpm build
```
This runs `nuxi generate` and then `tauri build`. Artifacts are produced in
`src-tauri/target/release/bundle`.

## Web Static Output
If you only want the static web output used by the desktop build:
```bash
pnpm --dir .. exec nuxi generate
```
Static files are written to `.output/public` in the repo root.

## Hotkey
The hotkey input is read-only; click it and press the key combo. Press "Save" to
register the global shortcut. The value is stored in `localStorage` under
`texo.globalShortcut`.

## Notes
- Default entry page: `/ocr`.
- Close hides the window; use tray menu to show it again.

## 中文说明

此目录为 Texo 的 Tauri 桌面壳。保留 Web UI，同时增加全局快捷键、
系统截图以及托盘/后台能力。

### 功能
- 全局截图快捷键（默认 Alt+Q）。
- 系统原生选区截图（Windows Snip / macOS screencapture / Linux flameshot 或 gnome-screenshot）。
- 截图自动注入 OCR 页面，无需手动粘贴。
- 后台也可写入剪贴板（不依赖窗口焦点）。
- 托盘菜单（显示/隐藏、截图、退出），关闭即隐藏到托盘。
- 单实例保护。
- 快捷键设置仅桌面端显示。

### 依赖
- Node.js + pnpm（见仓库根目录）。
- Rust 工具链（cargo）。
- Linux：安装 `flameshot` 或 `gnome-screenshot`。

### 安装
仓库根目录：
```bash
pnpm install
```

`TEXO-TAURI` 目录：
```bash
pnpm install
```

### 开发
```bash
pnpm dev
```
会启动 Nuxt dev server（`http://localhost:1420`）并打开桌面壳。

### 构建（桌面）
```bash
pnpm build
```
会执行 `nuxi generate` 后再 `tauri build`，产物在
`src-tauri/target/release/bundle`。

### 生成 Web 静态资源
```bash
pnpm --dir .. exec nuxi generate
```
静态文件输出到仓库根目录的 `.output/public`。

### 快捷键
快捷键输入框为只读：点击后直接按下组合键，再点 “Save” 保存。
值会写入 `localStorage` 的 `texo.globalShortcut`。

### 备注
- 默认入口为 `/ocr`。
- 关闭窗口会隐藏到托盘，可从托盘菜单再次显示。
