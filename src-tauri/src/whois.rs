use reqwest::{Client, header};
use serde_json::Value;
use tauri::command;

#[command]
pub async fn query_whois(domain_name: String) -> Result<Value, String> {
    let client = Client::new();

    let url = format!(
        "https://whois.aliyun.com/whois/api_whois_info?domainName={}",
        domain_name
    );

    // 设置请求头部，添加 Accept-Language
    let mut headers = header::HeaderMap::new();
    headers.insert("Accept-Language", header::HeaderValue::from_static("zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6"));

    // 发送请求获取 WHOIS 信息
    match client.get(&url).headers(headers).send().await {
        Ok(response) => {
            // 检查响应状态
            if response.status().is_success() {
                // 尝试解析 JSON 响应
                match response.json::<Value>().await {
                    Ok(json_response) => {
                        // 直接将 JSON 响应返回给前端
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
