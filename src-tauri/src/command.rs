#[tauri::command]
pub fn hide_window(window: tauri::WebviewWindow) {
    window.hide().unwrap();
}

#[tauri::command]
pub fn quit_app(app: tauri::AppHandle) {
    crate::window::close_all_windows(&app);
}
