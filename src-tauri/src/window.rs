use tauri::{AppHandle, Manager, WebviewWindowBuilder};

pub struct WindowConfig {
    pub label: String,
    pub url: String,
    pub width: f64,
    pub height: f64,
    pub x: f64,
    pub y: f64,
    pub transparent: bool,
    pub decorations: bool,
    pub always_on_top: bool,
    pub resizable: bool,
    pub skip_taskbar: bool,
    pub visible: bool,
}

pub fn spawn_window(app: &AppHandle, cfg: WindowConfig) {
    let window = WebviewWindowBuilder::new(app, cfg.label, tauri::WebviewUrl::App(cfg.url.into()))
        .title("Chonk Break")
        .inner_size(cfg.width, cfg.height)
        .position(cfg.x, cfg.y)
        .decorations(cfg.decorations)
        .transparent(cfg.transparent)
        .always_on_top(cfg.always_on_top)
        .resizable(cfg.resizable)
        .skip_taskbar(cfg.skip_taskbar)
        .visible(cfg.visible)
        .build();

    if let Ok(win) = window {
        let _ = win.set_background_color(Some(tauri::window::Color(0, 0, 0, 0)));
        let _ = win.set_ignore_cursor_events(true);
        let _ = win.show();
    }
}

pub fn close_all_windows(app: &AppHandle) {
    for (_, window) in app.webview_windows() {
        let _ = window.close();
    }
}

pub fn toggle_window(app: &AppHandle, label: &str) {
    if let Some(window) = app.get_webview_window(label) {
        match window.is_visible() {
            Ok(true) => {
                let _ = window.hide();
            }
            _ => {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
    }
}
