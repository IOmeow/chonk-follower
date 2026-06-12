use tauri::AppHandle;

use crate::window::{spawn_window, WindowConfig};

pub fn spawn_all_monitors(app: &AppHandle) {
    let monitors = match app.available_monitors() {
        Ok(m) => m,
        Err(_) => return,
    };

    let mut min_x = i32::MAX;
    let mut min_y = i32::MAX;
    let mut max_x = i32::MIN;
    let mut max_y = i32::MIN;

    for monitor in &monitors {
        let size = monitor.size();
        let pos = monitor.position();
        min_x = min_x.min(pos.x);
        min_y = min_y.min(pos.y);
        max_x = max_x.max(pos.x + size.width as i32);
        max_y = max_y.max(pos.y + size.height as i32);
    }

    if min_x == i32::MAX || min_y == i32::MAX || max_x == i32::MIN || max_y == i32::MIN {
        return;
    }

    spawn_window(
        app,
        WindowConfig {
            label: "chonk-overlay".to_string(),
            url: "#/".to_string(),
            width: (max_x - min_x) as f64,
            height: (max_y - min_y) as f64,
            x: min_x as f64,
            y: min_y as f64,
            transparent: true,
            decorations: false,
            always_on_top: true,
            resizable: false,
            skip_taskbar: true,
            visible: false,
        },
    );
}
