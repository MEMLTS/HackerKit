use reqwest::{Client, header};
use serde_json::Value;
use tauri::command;

#[command]
pub async fn query_whois(domain_name: String) -> Result<Value, String> {
    let client = Client::new();

    let url = "https://api.uutool.cn/whois/info/";

    // 设置请求头
    let mut headers = header::HeaderMap::new();
    headers.insert("Accept-Language", header::HeaderValue::from_static("zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6"));

    // 请求体
    let body = [("domain", domain_name)];

    match client.post(url).headers(headers).form(&body).send().await {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<Value>().await {
                    Ok(json_response) => {
                        Ok(json_response)
                    }
                    Err(e) => Err(format!("解析 JSON 响应失败: {}", e)),
                }
            } else {
                Err(format!("请求失败，状态码: {}", response.status()))
            }
        }
        Err(e) => Err(format!("发送请求失败: {}", e)),
    }
}
