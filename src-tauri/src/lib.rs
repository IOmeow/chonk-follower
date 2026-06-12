mod cursor;
mod tray;
mod window;
mod command;
mod multi_screen;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .setup(|app| {
            #[cfg(desktop)]
            {
                cursor::start_mouse_watcher(app.handle().clone());
                multi_screen::spawn_all_monitors(&app.handle());
                tray::setup(app)?;
                Ok(())
            }
        })
        .on_tray_icon_event(|app, event| {
            if let tauri::tray::TrayIconEvent::Click {
                button: tauri::tray::MouseButton::Left,
                button_state: tauri::tray::MouseButtonState::Up,
                ..
            } = event
            {
                window::toggle_window(app, "control");
            }
        })
        .invoke_handler(tauri::generate_handler![
            command::hide_window,
            command::quit_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
