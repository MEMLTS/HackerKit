<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import '@assets/styles/tool.css';
import showMessage from '../utils/MessageService';

const title = ref('WebSocket 测试客户端');

// WebSocket 状态
const ws = ref<WebSocket | null>(null);
const connectionStatus = ref('连接关闭');
const serverUrl = ref('ws://127.0.0.1:9501');
const isPaused = ref(false);

// 消息相关
const messages = ref<{ time: string; type: 'sent' | 'received' | 'system'; content: string }[]>([]);
const userInput = ref('PING');
const intervalSeconds = ref(1);
const intervalId = ref<number | null>(null);
const autoSendActive = ref(false);
const decodeJson = ref(true);

// 获取格式化时间
const getFormattedTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
};

// 添加消息
const addMessage = (type: 'sent' | 'received' | 'system', content: string) => {
    if (isPaused.value && type === 'received') return;

    messages.value.push({
        time: getFormattedTime(),
        type,
        content
    });

    // 自动滚动到底部
    setTimeout(() => {
        const messageBox = document.getElementById('message-box');
        if (messageBox) {
            messageBox.scrollTop = messageBox.scrollHeight;
        }
    }, 50);
};

// 连接 WebSocket
const isValidWebSocketUrl = (url: string): boolean => {
    return url.startsWith('ws://') || url.startsWith('wss://');
};

const connectWebSocket = () => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        showMessage('已有活跃连接，请先断开当前连接', { type: 'warning' });
        addMessage('system', '已有活跃连接，请先断开当前连接');
        return;
    }

    if (!isValidWebSocketUrl(serverUrl.value)) {
        showMessage('连接错误', { type: 'warning' });
        addMessage('system', '无效的WebSocket地址，必须以ws://或wss://开头');
        return;
    }

    try {
        if (ws.value) {
            ws.value.close();
        }
        showMessage('连接中...', { type: 'info', duration: 0.2 });
        connectionStatus.value = '正在连接...';
        ws.value = new WebSocket(serverUrl.value);

        ws.value.onopen = () => {
            connectionStatus.value = '已连接';
            addMessage('system', '连接已建立');
        };

        ws.value.onclose = () => {
            connectionStatus.value = '连接关闭';
            showMessage('连接已关闭', { type: 'info', duration: 0.2 });
            addMessage('system', '连接已关闭');
            stopAutoSend();
        };

        ws.value.onerror = (error) => {
            connectionStatus.value = '连接错误';
            showMessage('连接错误', { type: 'error' });
            addMessage('system', `连接错误: ${error}`);
            stopAutoSend();
        };

        ws.value.onmessage = (event) => {
            let content = event.data;

            // 尝试解码 JSON
            if (decodeJson.value && typeof content === 'string') {
                try {
                    const jsonObj = JSON.parse(content);
                    content = JSON.stringify(jsonObj, null, 2);
                } catch (e) {
                    // 如果解析失败，保持原始内容
                }
            }

            addMessage('received', content);
        };
    } catch (error) {
        connectionStatus.value = '连接错误';
        addMessage('system', `创建连接失败: ${error}`);
        showMessage('连接错误', { type: 'error' });
    }
};

// 断开连接
const disconnectWebSocket = () => {
    if (ws.value) {
        ws.value.close();
        ws.value = null;
        stopAutoSend();
    }
};

// 发送消息
const sendMessage = () => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
        showMessage('无法发送消息：WebSocket 未连接', { type: 'warning' });
        addMessage('system', '无法发送消息：WebSocket 未连接');
        return;
    }

    try {
        ws.value.send(userInput.value);
        addMessage('sent', userInput.value);
    } catch (error) {
        showMessage('发送消息失败', { type: 'error' });
        addMessage('system', `发送消息失败: ${error}`);
    }
};

// 自动发送
const startAutoSend = () => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
        showMessage('无法启动自动发送：WebSocket 未连接', { type: 'warning' });
        addMessage('system', '无法启动自动发送：WebSocket 未连接');
        return;
    }

    autoSendActive.value = true;

    // 立即发送一次
    sendMessage();

    // 设置定时器
    intervalId.value = window.setInterval(() => {
        sendMessage();
    }, intervalSeconds.value * 1000);
};

// 停止自动发送
const stopAutoSend = () => {
    if (intervalId.value !== null) {
        clearInterval(intervalId.value);
        intervalId.value = null;
    }
    autoSendActive.value = false;
};

// 切换自动发送状态
const toggleAutoSend = () => {
    if (autoSendActive.value) {
        stopAutoSend();
    } else {
        startAutoSend();
    }
};

// 清空消息
const clearMessages = () => {
    messages.value = [];
};

// 清空输入
const clearInput = () => {
    userInput.value = '';
};

// 组件销毁前关闭 WebSocket 连接
onBeforeUnmount(() => {
    disconnectWebSocket();
});
</script>

<template>
    <div class="tool-container">
        <div class="tool-header">
            <h2>{{ title }}</h2>
        </div>

        <div class="tool-content">
            <div class="websocket-client">
                <!-- 服务器配置 -->
                <div class="config-section">
                    <h3>服务器配置 <span class="status"
                            :class="connectionStatus === '已连接' ? 'connected' : 'disconnected'">状态: {{ connectionStatus
                            }}</span></h3>

                    <div class="server-config">
                        <div class="input-group">
                            <label>服务地址</label>
                            <input type="text" v-model="serverUrl" :disabled="ws !== null">
                            <button @click="connectWebSocket" :disabled="ws !== null">连接</button>
                            <button @click="disconnectWebSocket" :disabled="ws === null">断开</button>
                        </div>
                    </div>
                </div>

                <!-- 发包设置 -->
                <div class="send-section">
                    <h3>发包设置</h3>

                    <div class="auto-send-config">
                        <span>每隔</span>
                        <input type="number" v-model="intervalSeconds" min="0.1" step="0.1" :disabled="autoSendActive">
                        <span>秒发送内容</span>
                        <button @click="toggleAutoSend" :class="{ active: autoSendActive }">
                            {{ autoSendActive ? '停止' : '开始' }}
                        </button>
                    </div>

                    <div class="send-input">
                        <div class="input-label">需要发送到服务端的内容</div>
                        <textarea v-model="userInput" :disabled="autoSendActive"></textarea>
                        <div class="button-group">
                            <button @click="sendMessage" :disabled="!ws || ws.readyState !== 1">发送</button>
                            <button @click="clearInput">清空输入</button>
                        </div>
                    </div>
                </div>

                <!-- 调试消息 -->
                <div class="message-section">
                    <div class="message-header">
                        <h3>调试消息</h3>
                        <div class="controls">
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="decodeJson">
                                JSON解码
                            </label>
                            <button @click="clearMessages">清空消息</button>
                        </div>
                    </div>

                    <div class="message-container" id="message-box">
                        <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.type">
                            <span class="time">{{msg.type === 'sent' ? `[${msg.time}]=>` : msg.type === 'received' ?
                                `[${msg.time}]<=`: `[${msg.time}]`}} </span>
                                    <span class="content">{{ msg.content }}</span>
                        </div>
                        <div v-if="messages.length === 0" class="no-messages">
                            暂无消息记录
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.websocket-client {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
}

h3 {
    margin-top: 0;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.status {
    font-size: 0.8em;
    font-weight: normal;
    padding: 2px 6px;
    border: 1px solid #ddd;
}

.connected {
    color: var(--connected-text, #48fd1b);
    border-color: var(--connected-border, #3ef844);
}

.disconnected {
    color: var(--disconnected-text, #ff8a8a);
    border-color: var(--disconnected-border, #f44336);
}

.server-config,
.send-input {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.input-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.input-group label {
    min-width: 80px;
}

button {
    padding: 6px 12px;
    background-color: #4a6ee0;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

button:hover {
    background-color: #3a5bc7;
}

button:disabled {
    background-color: #b0b0b0;
    cursor: not-allowed;
}

button.active {
    background-color: #dc3545;
}

.auto-send-config {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
}

textarea {
    width: 100%;
    height: 100px;
    padding: 8px;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 4px;
    resize: vertical;
    font-family: monospace;
    background-color: var(--input-bg, #fff);
    color: var(--text-color, #333);
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.controls {
    display: flex;
    align-items: center;
    gap: 15px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
}

.message-container {
    height: 230px;
    overflow-y: auto;
    overflow-x: auto;
    border-radius: 4px;
    padding: 10px;
    font-family: monospace;
    white-space: nowrap;
}

.message {
    margin-bottom: 8px;
    white-space: nowrap;
}

.time {
    font-weight: bold;
    margin-right: 5px;
}

.sent .time {
    color: var(--sent-color, #4caf50);
}

.received .time {
    color: var(--received-color, #00bcd4);
}

.system .time {
    color: var(--system-color, #ff9800);
}

.content {
    margin: 0;
}

.no-messages {
    color: var(--secondary-text, #6c757d);
    text-align: center;
    padding: 20px;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .message-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .controls {
        flex-wrap: wrap;
    }
}
</style>
