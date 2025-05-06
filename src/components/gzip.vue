<script setup lang="ts">
import { ref } from 'vue';
import showMessage from '../utils/MessageService';

// 页面标题
const title = ref('压缩/解压缩工具');

// 输入和输出文本
const inputText = ref('');
const outputText = ref('');
const errorMessage = ref('');

// 压缩选项
const compressionType = ref<'gzip' | 'deflate'>('gzip');
const encodingType = ref<'hex' | 'base64' | 'utf8'>('base64');
const operationType = ref<'compress' | 'decompress'>('compress');

// 可用压缩算法
const compressionAlgorithms = [
    { value: 'gzip', label: 'Gzip' },
    { value: 'deflate', label: 'Deflate' }
];

// 可用编码格式
const encodingFormats = [
    { value: 'hex', label: 'Hex' },
    { value: 'base64', label: 'Base64' },
    { value: 'utf8', label: 'UTF-8' }
];

// 显示加载状态
const isLoading = ref(false);

// 压缩/解压缩处理
const processData = async () => {
    if (!inputText.value.trim()) {
        showMessage('请输入要处理的内容', { type: 'warning' })
        return;
    }

    isLoading.value = true;
    errorMessage.value = '';

    try {
        if (operationType.value === 'compress') {
            outputText.value = await compress(inputText.value);
        } else {
            outputText.value = await decompress(inputText.value);
        }
    } catch (error) {
        console.error('处理失败:', error);
        showMessage('处理失败', { type: 'error' });
    } finally {
        isLoading.value = false;
    }
};

// 压缩函数
const compress = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    let compressedStream: ReadableStream<Uint8Array>;

    try {
        compressedStream = new Blob([data]).stream().pipeThrough(
            new CompressionStream(compressionType.value)
        );
    } catch (error) {
        throw new Error(`不支持的压缩算法: ${compressionType.value}`);
    }

    const compressedData = await new Response(compressedStream).arrayBuffer();
    const compressedBytes = new Uint8Array(compressedData);

    return encodeData(compressedBytes);
};

// 解压缩函数
const decompress = async (encodedText: string): Promise<string> => {
    let bytes: Uint8Array;

    try {
        bytes = decodeData(encodedText);
    } catch (error) {
        throw new Error('解码失败: 输入数据格式不正确');
    }

    let decompressedStream: ReadableStream<Uint8Array>;

    try {
        decompressedStream = new Blob([bytes]).stream().pipeThrough(
            new DecompressionStream(compressionType.value)
        );
    } catch (error) {
        throw new Error(`解压缩失败: 可能使用了错误的算法或数据已损坏`);
    }

    return await new Response(decompressedStream).text();
};

// 数据编码
const encodeData = (data: Uint8Array): string => {
    switch (encodingType.value) {
        case 'hex':
            return bufferToHex(data);
        case 'base64':
            return btoa(String.fromCharCode(...data));
        case 'utf8':
            return new TextDecoder().decode(data);
        default:
            throw new Error('不支持的编码格式');
    }
};

// 数据解码
const decodeData = (text: string): Uint8Array => {
    switch (encodingType.value) {
        case 'hex':
            return hexToBuffer(text);
        case 'base64':
            return new Uint8Array(atob(text).split('').map(c => c.charCodeAt(0)));
        case 'utf8':
            return new TextEncoder().encode(text);
        default:
            throw new Error('不支持的编码格式');
    }
};

// Hex <=> Buffer 转换
const bufferToHex = (buffer: Uint8Array): string => {
    return Array.from(buffer)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
};

const hexToBuffer = (hex: string): Uint8Array => {
    if (hex.length % 2 !== 0) {
        throw new Error('Hex字符串长度必须为偶数');
    }

    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
};

// 复制结果到剪贴板
const copyResult = () => {
    if (!outputText.value) {
        showMessage('没有内容可复制', { type: 'warning' });
        return;
    }

    navigator.clipboard.writeText(outputText.value)
        .then(() => {
            showMessage('复制成功', { type: 'success' });
        })
        .catch(err => {
            console.error('复制失败:', err);
            errorMessage.value = '复制失败，请手动复制';
        });
};

// 清空输入输出
const clearAll = () => {
    inputText.value = '';
    outputText.value = '';
    errorMessage.value = '';
};
</script>

<template>
    <div class="tool-container">
        <div class="tool-header">
            <h2>{{ title }}</h2>
        </div>

        <div class="tool-content">
            <div class="feature-card">
                <!-- 操作类型选择 -->
                <div class="operation-toggle">
                    <button :class="{ active: operationType === 'compress' }" @click="operationType = 'compress'">
                        压缩
                    </button>
                    <button :class="{ active: operationType === 'decompress' }" @click="operationType = 'decompress'">
                        解压缩
                    </button>
                </div>

                <!-- 错误提示 -->
                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>

                <!-- 设置区域 -->
                <div class="settings-group">
                    <div class="setting-group">
                        <label>算法:</label>
                        <select v-model="compressionType">
                            <option v-for="algo in compressionAlgorithms" :key="algo.value" :value="algo.value">
                                {{ algo.label }}
                            </option>
                        </select>
                    </div>

                    <div class="setting-group">
                        <label>编码:</label>
                        <select v-model="encodingType">
                            <option v-for="format in encodingFormats" :key="format.value" :value="format.value">
                                {{ format.label }}
                            </option>
                        </select>
                    </div>
                </div>

                <!-- 输入区域 -->
                <div class="input-group">
                    <textarea v-model="inputText"
                        :placeholder="operationType === 'compress' ? '输入要压缩的内容...' : '输入要解压缩的数据...'"
                        rows="6"></textarea>
                </div>

                <!-- 操作按钮 -->
                <div class="button-group">
                    <button @click="processData" :disabled="isLoading" class="encode-btn">
                        {{ isLoading ? '处理中...' : operationType === 'compress' ? '压缩' : '解压缩' }}
                    </button>
                    <button @click="clearAll" class="clear-btn">
                        清空
                    </button>
                    <button @click="copyResult" class="copy-btn">
                        复制
                    </button>
                </div>

                <!-- 输出区域 -->
                <div class="output-group">
                    <textarea v-model="outputText" placeholder="处理结果将显示在这里..." rows="6" readonly></textarea>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>