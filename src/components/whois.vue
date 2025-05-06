<script setup lang="ts">
import { ref } from 'vue';
import '@assets/styles/tool.css';
import { invoke } from '@tauri-apps/api/core';

const title = ref('WHOIS查询');
const domain = ref('');
const rawData = ref('');
const parsedData = ref<any>(null);
const isLoading = ref(false);
const error = ref('');
const showRaw = ref('parsed'); // 'raw' or 'parsed'

// 查询 WHOIS
const queryWhois = async () => {
    if (!domain.value) {
        error.value = '请输入域名';
        return;
    }

    isLoading.value = true;
    error.value = '';

    try {
        const result:any = await invoke('query_whois', { domainName: domain.value });
        console.log('WHOIS 查询结果:', result);
        if (result.status !== 1) {
            error.value = result.message || '查询失败';
            parsedData.value = null;
            rawData.value = '';
            return;
        }
        parsedData.value = result;
        rawData.value = JSON.stringify(result, null, 2);
    } catch (err) {
        console.error('WHOIS 查询错误:', err);
        error.value = err instanceof Error ? err.message : '查询失败';
        parsedData.value = null;
        rawData.value = '';
    } finally {
        isLoading.value = false;
    }
};

// 切换视图
const toggleView = (view: string) => {
    showRaw.value = view;
};

// 清空数据
const clear = () => {
    rawData.value = '';
    parsedData.value = null;
    domain.value = '';
};
</script>

<template>
    <div class="tool-container">
        <div class="tool-header">
            <h2>{{ title }}</h2>
        </div>

        <div class="tool-content">
            <div class="feature-card">
                <div class="search-box">
                    <input v-model="domain" placeholder="输入域名(如: example.com)" @keyup.enter="queryWhois" />
                    <button class="encode-btn" @click="queryWhois">查询</button>
                    <button class="clear-btn" @click="clear">清空</button>
                </div>

                <!-- 加载状态 -->
                <div v-if="isLoading" class="loading">查询中...</div>

                <!-- 错误提示 -->
                <div v-if="error" class="error">{{ error }}</div>

                <!-- 标签页 -->
                <div v-if="parsedData" class="tabs">
                    <div class="tab" :class="{ active: showRaw === 'parsed' }" @click="toggleView('parsed')">
                        解析数据
                    </div>
                    <div class="tab" :class="{ active: showRaw === 'raw' }" @click="toggleView('raw')">
                        原始数据
                    </div>
                </div>

                <!-- 查询结果 -->
                <div v-if="parsedData" class="result-container">
                    <div v-if="showRaw === 'raw'" class="raw-data">
                        <pre>{{ rawData }}</pre>
                    </div>

                    <div v-else class="parsed-data">
                        <!-- 解析数据以表格形式展示 -->
                        <table>
                            <template v-if="parsedData.status !== undefined">
                                <tr>
                                    <td><strong>查询成功:</strong></td>
                                    <td>{{ parsedData.status === 1 ? '是' : '否' }}</td>
                                </tr>
                            </template>
                            <template v-if="parsedData.data">
                                <tr>
                                    <td><strong>域名</strong></td>
                                    <td>{{ parsedData.data.domain }}</td>
                                </tr>
                                <tr>
                                    <td><strong>注册商</strong></td>
                                    <td>{{ parsedData.data.info.registrar }}</td>
                                </tr>
                                <tr>
                                    <td><strong>注册人</strong></td>
                                    <td>{{ parsedData.data.info.registrant }}</td>
                                </tr>
                                <tr>
                                    <td><strong>注册时间</strong></td>
                                    <td>{{ parsedData.data.info.registrationTime }}</td>
                                </tr>
                                <tr>
                                    <td><strong>到期时间</strong></td>
                                    <td>{{ parsedData.data.info.expirationTime }}</td>
                                </tr>
                                <tr>
                                    <td><strong>域名状态</strong></td>
                                    <td>{{ parsedData.data.info.domainStatus.join(', ') }}</td>
                                </tr>
                                <tr>
                                    <td><strong>DNS 服务器</strong></td>
                                    <td>{{ parsedData.data.info.nameServer[0] }}</td>
                                </tr>
                                <tr>
                                    <td><strong>DNS 服务器</strong></td>
                                    <td>{{ parsedData.data.info.nameServer[1] || '无' }}</td>
                                </tr>
                                <tr>
                                    <td><strong>WHOIS 服务器</strong></td>
                                    <td>{{ parsedData.data.info.whoisServer || '无' }}</td>
                                </tr>
                            </template>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.search-box {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.loading,
.error {
    text-align: center;
    margin: 20px 0;
}

.error {
    color: var(--error-color);
}

.result-container {
    margin-top: 20px;
}

.tabs {
    display: flex;
    border-bottom: 2px solid #ddd;
    margin-bottom: 15px;
}

.tab {
    padding: 10px;
    cursor: pointer;
    font-weight: 600;
    color: #555;
    transition: all 0.3s;
}

.tab.active {
    border-bottom: 2px solid var(--primary-color);
    color: var(--primary-color);
}

.raw-data {
    background-color: var(--code-bg);
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
}

.parsed-data {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 10px 15px;
}

.parsed-data table {
    width: 100%;
    border-collapse: collapse;
}

.parsed-data td {
    padding: 6px 10px;
    border: 1px solid #eee;
}

.parsed-data td strong {
    font-weight: bold;
    color: #333;
}
</style>
