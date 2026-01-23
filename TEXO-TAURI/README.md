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

### Ubuntu 24.04 build guide (and pitfalls we hit)
- Node 20.19+ is required (oxc parser bindings fail on Node 18). Example: download Node 20.19.1 and `export PATH="$HOME/.local/node-v20.19.1/bin:$PATH"`.
- Install Rust with rustup (`curl https://sh.rustup.rs -sSf | sh -s -- -y`), then `source ~/.cargo/env`.
- Install desktop build deps (runtime + dev headers):
  ```bash
  sudo apt-get update
  sudo apt-get install -y \
    libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev libgtk-3-dev \
    libayatana-appindicator3-dev librsvg2-dev libsoup-3.0-dev libssl-dev \
    libasound2-dev libx11-dev libxcb1-dev libxrandr-dev libxtst-dev \
    libnotify-dev libgdk-pixbuf-2.0-dev libpango1.0-dev libglib2.0-dev
  # screenshot helper (pick one)
  sudo apt-get install -y flameshot || sudo apt-get install -y gnome-screenshot
  ```
- Build: `pnpm build` in `TEXO-TAURI` (runs Nuxt generate + Tauri).
- Packaging quirk: If install fails due to WebKit deps, run `scripts/fix-deb-dep.sh` after `pnpm build` to rewrite the deb Depends to WebKitGTK 4.1 (Ubuntu 24.04). The script keeps the existing Package/Version and only swaps Depends.
- Wayland vs Xorg: global shortcuts are only reliable on Xorg. If UI is blank on Wayland, try launching with
  `GDK_BACKEND=x11 WEBKIT_DISABLE_DMABUF_RENDERER=1 WEBKIT_DISABLE_COMPOSITING_MODE=1 ./src-tauri/target/release/texo-desktop`.
- To always set the launch env, wrap the binary (or edit your `.desktop` Exec). Pick a path in your `$PATH` (e.g. `~/.local/bin/texo-desktop`) and point to the actual binary you run (deb install often places it in `/usr/bin/texo-desktop`; debug builds live under `src-tauri/target/release/texo-desktop`):
  ```bash
  mkdir -p ~/.local/bin
  cat > ~/.local/bin/texo-desktop <<'EOF'
  #!/usr/bin/env bash
  export GDK_BACKEND=x11
  export WEBKIT_DISABLE_DMABUF_RENDERER=1
  export WEBKIT_DISABLE_COMPOSITING_MODE=1
  exec /usr/bin/texo-desktop "$@"   # deb install default; adjust if running a local build
  EOF
  chmod +x ~/.local/bin/texo-desktop
  ```

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

#### Ubuntu 24.04 编译指引（踩坑总结）
- 需要 Node 20.19+（Node 18 会导致 oxc 原生绑定缺失）。可下载 Node 20.19.1 并在 shell 加 `export PATH="$HOME/.local/node-v20.19.1/bin:$PATH"`。
- 用 rustup 安装 Rust（`curl https://sh.rustup.rs -sSf | sh -s -- -y`），然后 `source ~/.cargo/env`。
- 安装系统依赖（运行库 + 开发头文件）：
  ```bash
  sudo apt-get update
  sudo apt-get install -y \
    libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev libgtk-3-dev \
    libayatana-appindicator3-dev librsvg2-dev libsoup-3.0-dev libssl-dev \
    libasound2-dev libx11-dev libxcb1-dev libxrandr-dev libxtst-dev \
    libnotify-dev libgdk-pixbuf-2.0-dev libpango1.0-dev libglib2.0-dev
  # 截图工具（二选一）
  sudo apt-get install -y flameshot || sudo apt-get install -y gnome-screenshot
  ```
- 在 `TEXO-TAURI` 目录执行 `pnpm build`。
- 打包注意：如果安装时因为 WebKit 依赖报错，可在 `pnpm build` 后运行 `scripts/fix-deb-dep.sh`，自动把 deb 的 Depends 改成 WebKitGTK 4.1（适配 Ubuntu 24.04），保留原有 Package/Version 等元数据。
- Wayland 上全局快捷键不稳定；如界面空白，可用 Xorg，或启动时设置  
  `GDK_BACKEND=x11 WEBKIT_DISABLE_DMABUF_RENDERER=1 WEBKIT_DISABLE_COMPOSITING_MODE=1 ./src-tauri/target/release/texo-desktop`。
- 若希望启动即自动带这些环境变量，可写包装脚本（或改 .desktop 的 Exec）。脚本放在你的 `$PATH`（如 `~/.local/bin/texo-desktop`），并把 `exec` 指向实际可执行文件（deb 安装通常在 `/usr/bin/texo-desktop`，调试版在 `src-tauri/target/release/texo-desktop`）：
  ```bash
  mkdir -p ~/.local/bin
  cat > ~/.local/bin/texo-desktop <<'EOF'
  #!/usr/bin/env bash
  export GDK_BACKEND=x11
  export WEBKIT_DISABLE_DMABUF_RENDERER=1
  export WEBKIT_DISABLE_COMPOSITING_MODE=1
  exec /usr/bin/texo-desktop "$@"   # deb 安装默认路径，如用本地调试版请替换
  EOF
  chmod +x ~/.local/bin/texo-desktop
  ```

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
