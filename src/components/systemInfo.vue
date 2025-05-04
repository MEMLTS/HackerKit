<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { invoke } from '@tauri-apps/api/core';

const title = ref('系统信息');
const systemInfo = ref({
    os_type: '',
    os_release: '',
    os_version: '',
    total_memory: 0,
    free_memory: 0,
    cpu_info: '',
    cpu_usage: 0,
    load_avg_1min: 0,
    load_avg_5min: 0,
    load_avg_15min: 0,
});

const loading = ref(true);

// 获取系统信息的函数
const fetchSystemInfo = async () => {
    try {
        const response = await invoke('get_system_info');
        // 确保 response 是字符串再解析
        if (typeof response === 'string') {
            systemInfo.value = JSON.parse(response);
        } else {
            console.error('Unexpected response type:', typeof response);
        }
    } catch (error) {
        console.error('Failed to fetch system info:', error);
    } finally {
        loading.value = false;
    }
};

// 在组件挂载时调用 fetchSystemInfo 获取数据
onMounted(fetchSystemInfo);
</script>

<template>
    <div>
        <div class="tool-header">
            <h2>{{ title }} <span class="emoji">💻</span></h2>
        </div>

        <div class="tool-content">
            <!-- 系统信息展示 -->
            <div class="feature-card" v-if="!loading">
                <span class="emoji">🖥️</span>
                <h3>操作系统信息</h3>
                <div class="card-content">
                    <p><strong>操作系统类型:</strong> {{ systemInfo.os_type }}</p>
                    <p><strong>操作系统版本:</strong> {{ systemInfo.os_release }} {{ systemInfo.os_version }}</p>
                </div>
            </div>

            <div class="feature-card" v-if="!loading">
                <span class="emoji">💾</span>
                <h3>内存信息</h3>
                <div class="card-content">
                    <p><strong>总内存:</strong> {{ systemInfo.total_memory }} MB</p>
                    <p><strong>空闲内存:</strong> {{ systemInfo.free_memory }} MB</p>
                </div>
            </div>

            <div class="feature-card" v-if="!loading">
                <span class="emoji">🧑‍💻</span>
                <h3>CPU 信息</h3>
                <div class="card-content">
                    <p><strong>CPU 信息:</strong> {{ systemInfo.cpu_info }}</p>
                    <p><strong>CPU 使用率:</strong> {{ systemInfo.cpu_usage }}%</p>
                </div>
            </div>

            <div class="feature-card" v-if="!loading">
                <span class="emoji">📊</span>
                <h3>系统负载</h3>
                <div class="card-content">
                    <p><strong>负载均值 (1 min):</strong> {{ systemInfo.load_avg_1min }}</p>
                    <p><strong>负载均值 (5 min):</strong> {{ systemInfo.load_avg_5min }}</p>
                    <p><strong>负载均值 (15 min):</strong> {{ systemInfo.load_avg_15min }}</p>
                </div>
            </div>

            <!-- 加载中提示 -->
            <div v-if="loading" class="loading">
                <p>加载系统信息... <span class="emoji">⏳</span></p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tool-header {
    font-size: 2.5rem;
    color: var(--text-color);
    transition: color 0.3s ease;

    @media (prefers-color-scheme: dark) {
        color: var(--dark-text-color);
    }

    display: flex;
    justify-content: center;
    align-items: center;
}

.tool-header .emoji {
    font-size: 2.5rem;
    margin-left: 10px;
}

.tool-content {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    /* 每行两个卡片，卡片宽度自适应 */
    gap: 1.5rem;
    padding: 1rem;
    margin-top: 1rem;
}

.feature-card {
    background: var(--card-bg);
    transition: background-color 0.3s ease;

    @media (prefers-color-scheme: dark) {
        background: var(--dark-card-bg);
    }

    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px var(--card-border);
    transition: box-shadow 0.3s ease;

    @media (prefers-color-scheme: dark) {
        box-shadow: 0 4px 12px var(--dark-card-border);
    }

    transition: transform 0.3s ease,
    box-shadow 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 18px var(--hover-bg);
}

.feature-card .emoji {
    font-size: 2rem;
    margin-right: 10px;
}

.feature-card h3 {
    font-size: 1.5rem;
    color: var(--text-color);
    transition: color 0.3s ease;

    @media (prefers-color-scheme: dark) {
        color: var(--dark-text-color);
    }

    margin-bottom: 1rem;
}

.card-content {
    font-size: 1.1rem;
    color: var(--text-color);
    transition: color 0.3s ease;

    @media (prefers-color-scheme: dark) {
        color: var(--dark-text-color);
    }
}

.card-content p {
    margin: 8px 0;
}

.loading {
    text-align: center;
    font-size: 1.2rem;
    color: var(--text-color);
    transition: color 0.3s ease;

    @media (prefers-color-scheme: dark) {
        color: var(--dark-text-color);
    }
}

@media (max-width: 768px) {
    .tool-header {
        font-size: 2rem;
    }

    .feature-card h3 {
        font-size: 1.3rem;
    }

    .card-content p {
        font-size: 1rem;
    }
}
</style>
