use serde::Serialize;
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

#[derive(Clone, Copy, Serialize)]
struct CursorPosition {
    x: i32,
    y: i32,
}

#[cfg(windows)]
fn get_cursor_position() -> Option<CursorPosition> {
    use windows::Win32::Foundation::POINT;
    use windows::Win32::UI::WindowsAndMessaging::GetCursorPos;

    let mut point = POINT::default();
    unsafe {
        GetCursorPos(&mut point).ok()?;
    }

    Some(CursorPosition {
        x: point.x,
        y: point.y,
    })
}

#[cfg(not(windows))]
fn get_cursor_position() -> Option<CursorPosition> {
    None
}

pub fn start_mouse_watcher(app: AppHandle) {
    thread::spawn(move || {
        loop {
            if let Some(position) = get_cursor_position() {
                let _ = app.emit("mouse-position", position);
            }

            thread::sleep(Duration::from_millis(16));
        }
    });
}