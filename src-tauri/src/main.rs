// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tokio::task;
use tokio::sync::RwLock;
use csv::ReaderBuilder;
use lazy_static::lazy_static;
use std::{fs::File, sync::Arc};

lazy_static! {
    static ref CSV_DATA: Arc<RwLock<Vec<i32>>> = Arc::new(RwLock::new(Vec::new()));
}

#[tauri::command]
async fn read_file_into_cache(file_path: String) -> Result<(), String>{
    let file_path_clone = file_path.clone();
    
    // Spawn a blocking thread for file I/O to avoid blocking the main thread.
    let data = task::spawn_blocking(move || load_csv(file_path_clone))
        .await
        .map_err(|e| format!("Failed to join thread: {}", e))??;

    // Store the loaded data into the global cache.
    let mut global_data = CSV_DATA.write().await;
    *global_data = data;  // Replace old data with the new one.

    Ok(())
}

// This function reads the CSV file and returns a vector of integers.
fn load_csv(file_path: String) -> Result<Vec<i32>, String> {
    let file = File::open(&file_path).map_err(|e| format!("Failed to open file: {}", e))?;
    let mut rdr = ReaderBuilder::new().has_headers(false).from_reader(file);

    let mut data = Vec::new();
    for result in rdr.records() {
        let record = result.map_err(|e| format!("CSV parsing error: {}", e))?;
        if let Some(value) = record.get(0) {
            if let Ok(int_value) = value.parse::<i32>() {
                data.push(int_value);
            }
        }
    }
    Ok(data)
}

#[tauri::command]
// Process the file in chunks, returning the average of each chunk.
async fn process_data_chunks(chunk_size: usize) -> Result<Vec<f64>, String> {

    let data = CSV_DATA.read().await;  // Read the cached data concurrently.

    // Spawn a thread to compute averages asynchronously.
    let averages = task::spawn_blocking(move || calculate_averages(&data, chunk_size))
        .await
        .map_err(|e| format!("Failed to join thread: {}", e))?;

    Ok(averages)
}

// Helper function to compute the average of a vector of integers.
fn average(chunk: &[i32]) -> f64 {
    let sum: i32 = chunk.iter().sum();
    sum as f64 / chunk.len() as f64
}

// Helper function to calculate averages for each chunk.
fn calculate_averages(data: &[i32], chunk_size: usize) -> Vec<f64> {
    let mut averages = Vec::new();
    let mut chunk = Vec::new();

    for &value in data {
        chunk.push(value);
        if chunk.len() == chunk_size {
            averages.push(average(&chunk));
            chunk.clear();
        }
    }

    // Handle the remaining chunk if it is not full.
    if !chunk.is_empty() {
        averages.push(average(&chunk));
    }

    averages
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_file_into_cache,
            process_data_chunks,
            
        ])
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
