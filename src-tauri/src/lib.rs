use serde::Serialize;
use sysinfo::{CpuExt, System, SystemExt};
mod whois;

#[derive(Serialize)]
struct SystemInfo {
    os_type: String,
    os_release: String,
    os_version: String,
    total_memory: u64,
    free_memory: u64,
    cpu_info: String,
    cpu_usage: f32,
    load_avg_1min: f32,
    load_avg_5min: f32,
    load_avg_15min: f32,
}
#[tauri::command]
fn get_system_info() -> Result<String, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    sys.refresh_cpu();

    // 操作系统信息（通过实例调用）
    let os_type = sys.name().unwrap_or_else(|| "Unknown".into());
    let os_release = sys.long_os_version().unwrap_or_else(|| "Unknown".into());
    let os_version = sys.kernel_version().unwrap_or_else(|| "Unknown".into());

    // 内存计算（保持原样）
    let total_memory = sys.total_memory() / (1024 * 1024);
    let free_memory = sys.available_memory() / (1024 * 1024);

    // CPU信息（保持原样）
    let cpu_info = sys
        .cpus()
        .first()
        .map(|c| c.brand().to_string())
        .unwrap_or_else(|| "Unknown".into());

    // 系统负载（保持原样）
    let load_avg = sys.load_average();

    // CPU使用率（保持原样）
    std::thread::sleep(std::time::Duration::from_millis(500));
    sys.refresh_cpu();
    let cpu_usage = sys.global_cpu_info().cpu_usage();

    // 创建结构体（移除users字段）
    let system_info = SystemInfo {
        os_type,
        os_release,
        os_version,
        total_memory,
        free_memory,
        cpu_info,
        cpu_usage,
        load_avg_1min: load_avg.one as f32,
        load_avg_5min: load_avg.five as f32,
        load_avg_15min: load_avg.fifteen as f32,
    };

    serde_json::to_string(&system_info).map_err(|e| format!("Serialization failed: {}", e))
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            whois::query_whois
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
