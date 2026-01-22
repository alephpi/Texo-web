// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    process::Command,
    sync::Mutex,
    time::{Duration, Instant},
};

use arboard::{Clipboard, ImageData};
use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use image::{codecs::png::PngEncoder, ColorType, ImageEncoder};
use serde::Serialize;
use single_instance::SingleInstance;
use tauri::{
    async_runtime::spawn, AppHandle, CustomMenuItem, GlobalShortcutManager, Manager, State,
    SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem, WindowEvent, Wry,
};
use tokio::time::sleep;

#[derive(Clone, Serialize)]
struct ScreenshotPayload {
    data_url: String,
    reason: String,
}

const DEFAULT_HOTKEY: &str = "Alt+Q";

struct HotkeyState {
    accelerator: Mutex<String>,
}

impl HotkeyState {
    fn new(default_hotkey: &str) -> Self {
        Self {
            accelerator: Mutex::new(default_hotkey.to_string()),
        }
    }
}

#[tauri::command]
async fn capture_screenshot(app: AppHandle<Wry>) -> Result<String, String> {
    capture_and_emit(&app, "command").await
}

#[tauri::command]
fn write_image_to_clipboard(data_url: String) -> Result<(), String> {
    write_image_to_clipboard_impl(&data_url)
}

#[tauri::command]
fn write_text_to_clipboard(text: String) -> Result<(), String> {
    let mut clipboard = Clipboard::new().map_err(|e| format!("Failed to open clipboard: {e}"))?;
    clipboard
        .set_text(text)
        .map_err(|e| format!("Failed to write clipboard text: {e}"))
}

#[tauri::command]
fn get_global_shortcut(state: State<HotkeyState>) -> Result<String, String> {
    state
        .accelerator
        .lock()
        .map(|value| value.clone())
        .map_err(|_| "Failed to read hotkey state".to_string())
}

#[tauri::command]
fn set_global_shortcut(
    app: AppHandle<Wry>,
    state: State<HotkeyState>,
    accelerator: String,
) -> Result<String, String> {
    let accelerator = accelerator.trim().to_string();
    if accelerator.is_empty() {
        return Err("Hotkey cannot be empty".into());
    }

    let mut current = state
        .accelerator
        .lock()
        .map_err(|_| "Failed to lock hotkey state".to_string())?;
    if *current == accelerator {
        return Ok(accelerator);
    }

    let previous = current.clone();
    let mut manager = app.global_shortcut_manager();
    if !previous.is_empty() {
        let _ = manager.unregister(previous.as_str());
    }

    let app_for_hotkey = app.clone();
    if let Err(err) = manager.register(accelerator.as_str(), move || {
        start_capture_task(&app_for_hotkey, "hotkey");
    }) {
        if !previous.is_empty() {
            let app_for_hotkey = app.clone();
            let _ = manager.register(previous.as_str(), move || {
                start_capture_task(&app_for_hotkey, "hotkey");
            });
        }
        return Err(format!("Failed to register global shortcut: {err}"));
    }

    *current = accelerator.clone();
    update_tray_hotkey(&app, &accelerator);
    Ok(accelerator)
}

fn main() {
    let instance = match build_single_instance() {
        Ok(instance) => instance,
        Err(err) => {
            eprintln!("Failed to initialize single instance guard: {err}");
            return;
        }
    };
    if !instance.is_single() {
        return;
    }

    let tray = build_tray();

    tauri::Builder::default()
        .manage(instance)
        .manage(HotkeyState::new(DEFAULT_HOTKEY))
        .system_tray(tray)
        .on_system_tray_event(handle_tray_event)
        .invoke_handler(tauri::generate_handler![
            capture_screenshot,
            get_global_shortcut,
            set_global_shortcut,
            write_text_to_clipboard,
            write_image_to_clipboard
        ])
        .setup(|app| {
            if let Err(err) = register_hotkey(&app.handle(), DEFAULT_HOTKEY) {
                eprintln!("Failed to register global shortcut: {err}");
            }
            Ok(())
        })
        .on_window_event(|event| {
            if let WindowEvent::CloseRequested { api, .. } = event.event() {
                api.prevent_close();
                let _ = event.window().hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn build_single_instance() -> Result<SingleInstance, String> {
    #[cfg(target_os = "macos")]
    {
        let lock_path = std::env::temp_dir().join("texo-desktop.lock");
        let lock_path = lock_path
            .to_str()
            .ok_or_else(|| "Failed to build lock file path".to_string())?;
        return SingleInstance::new(lock_path)
            .map_err(|e| format!("Failed to create lock file: {e}"));
    }
    #[cfg(not(target_os = "macos"))]
    {
        return SingleInstance::new("com.texo.desktop")
            .map_err(|e| format!("Failed to create single instance guard: {e}"));
    }
}

fn build_tray() -> SystemTray {
    let show = CustomMenuItem::new("show".to_string(), "Show/Hide");
    let screenshot = CustomMenuItem::new(
        "screenshot".to_string(),
        format!("Screenshot ({DEFAULT_HOTKEY})"),
    );
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(screenshot)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    SystemTray::new().with_menu(menu)
}

fn update_tray_hotkey(app: &AppHandle<Wry>, accelerator: &str) {
    let title = format!("Screenshot ({accelerator})");
    let _ = app.tray_handle().get_item("screenshot").set_title(title);
}

fn handle_tray_event(app: &AppHandle<Wry>, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            let _ = toggle_window(app);
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "show" => {
                let _ = toggle_window(app);
            }
            "screenshot" => start_capture_task(app, "tray"),
            "quit" => app.exit(0),
            _ => {}
        },
        _ => {}
    }
}

fn register_hotkey(app: &AppHandle<Wry>, accelerator: &str) -> Result<(), String> {
    let mut manager = app.global_shortcut_manager();
    let app_for_hotkey = app.clone();
    manager
        .register(accelerator, move || {
            start_capture_task(&app_for_hotkey, "hotkey");
        })
        .map_err(|e| format!("Failed to register global shortcut: {e}"))?;
    update_tray_hotkey(app, accelerator);
    Ok(())
}

fn start_capture_task(app: &AppHandle<Wry>, reason: &str) {
    let reason = reason.to_string();
    let handle = app.clone();
    spawn(async move {
        if let Err(err) = capture_and_emit(&handle, &reason).await {
            let _ = handle.emit_all("screenshot-error", err);
        }
    });
}

fn toggle_window(app: &AppHandle<Wry>) -> Result<(), String> {
    if let Some(window) = app.get_window("main") {
        let is_visible = window.is_visible().unwrap_or(true);
        if is_visible {
            window
                .hide()
                .map_err(|e| format!("Failed to hide window: {e}"))?;
        } else {
            window
                .show()
                .map_err(|e| format!("Failed to show window: {e}"))?;
            let _ = window.set_focus();
        }
        return Ok(());
    }
    Err("Main window not found".into())
}

async fn capture_and_emit(app: &AppHandle<Wry>, reason: &str) -> Result<String, String> {
    let data_url = capture_and_encode().await?;
    let payload = ScreenshotPayload {
        data_url: data_url.clone(),
        reason: reason.to_string(),
    };
    app.emit_all("screenshot-captured", payload)
        .map_err(|e| format!("Failed to emit screenshot event: {e}"))?;
    Ok(data_url)
}

async fn capture_and_encode() -> Result<String, String> {
    trigger_system_screenshot()?;
    wait_for_clipboard_image(Duration::from_secs(15), Duration::from_millis(150)).await
}

fn trigger_system_screenshot() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        return trigger_windows_snip();
    }
    #[cfg(target_os = "macos")]
    {
        return trigger_macos_snip();
    }
    #[cfg(target_os = "linux")]
    {
        return trigger_linux_snip();
    }
    #[allow(unreachable_code)]
    Err("Screenshot is not implemented for this OS".into())
}

#[cfg(target_os = "windows")]
fn trigger_windows_snip() -> Result<(), String> {
    // Windows 11/10 built-in snip tool (copies to clipboard).
    if Command::new("explorer.exe")
        .arg("ms-screenclip:")
        .status()
        .is_ok()
    {
        return Ok(());
    }
    Command::new("snippingtool.exe")
        .arg("/clip")
        .status()
        .map(|_| ())
        .map_err(|e| format!("Failed to invoke system screenshot: {e}"))
}

#[cfg(target_os = "macos")]
fn trigger_macos_snip() -> Result<(), String> {
    Command::new("screencapture")
        .args(["-i", "-c"])
        .status()
        .map_err(|e| format!("Failed to invoke screencapture: {e}"))
        .and_then(|status| {
            if status.success() {
                Ok(())
            } else {
                Err("System screenshot tool exited with error".into())
            }
        })
}

#[cfg(target_os = "linux")]
fn trigger_linux_snip() -> Result<(), String> {
    let candidates = [
        ("flameshot", vec!["gui", "-c"]),
        ("gnome-screenshot", vec!["-a", "-c"]),
    ];
    for (cmd, args) in candidates {
        if let Ok(status) = Command::new(cmd).args(args).status() {
            if status.success() {
                return Ok(());
            }
        }
    }
    Err("No screenshot tool found. Install flameshot or gnome-screenshot.".into())
}

async fn wait_for_clipboard_image(
    timeout: Duration,
    interval: Duration,
) -> Result<String, String> {
    let start = Instant::now();
    loop {
        match read_clipboard_image_as_data_url() {
            Ok(data_url) => return Ok(data_url),
            Err(err) => {
                if start.elapsed() > timeout {
                    return Err(format!("Waiting for screenshot timed out: {err}"));
                }
            }
        }
        sleep(interval).await;
    }
}

fn read_clipboard_image_as_data_url() -> Result<String, String> {
    let mut clipboard = Clipboard::new().map_err(|e| format!("Failed to open clipboard: {e}"))?;
    let image = clipboard
        .get_image()
        .map_err(|e| format!("Failed to read clipboard image: {e}"))?;

    let mut buffer = Vec::new();
    {
        let encoder = PngEncoder::new(&mut buffer);
        encoder
            .write_image(
                &image.bytes,
                image.width as u32,
                image.height as u32,
                ColorType::Rgba8.into(),
            )
            .map_err(|e| format!("Failed to encode PNG: {e}"))?;
    }

    Ok(format!("data:image/png;base64,{}", BASE64.encode(buffer)))
}

fn write_image_to_clipboard_impl(data_url: &str) -> Result<(), String> {
    let base64_part = data_url
        .split_once(',')
        .map(|(_, data)| data)
        .unwrap_or(data_url);
    let raw = BASE64
        .decode(base64_part.trim())
        .map_err(|e| format!("Failed to decode base64: {e}"))?;

    let img = image::load_from_memory(&raw).map_err(|e| format!("Failed to decode image: {e}"))?;
    let rgba = img.to_rgba8();
    let (width, height) = rgba.dimensions();
    let mut clipboard = Clipboard::new().map_err(|e| format!("Failed to open clipboard: {e}"))?;
    clipboard
        .set_image(ImageData {
            width: width as usize,
            height: height as usize,
            bytes: rgba.into_vec().into(),
        })
        .map_err(|e| format!("Failed to write clipboard image: {e}"))
}
