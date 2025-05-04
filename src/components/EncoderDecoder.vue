<script setup lang="ts">
import { ref } from 'vue';
import CustomModal from './CustomModal.vue';
import CryptoJS from 'crypto-js';

import '@assets/styles/tool.css';

// 定义编码类型的联合类型
type EncodeType = 'base64' | 'url' | 'hex' | 'unicode' | 'ascii';

// 标题和当前选择的编码类型
const title = ref('编码解码工具');
const encodeType = ref<EncodeType>('base64');
const encodeTypes = [
    { value: 'base64', label: 'Base64' },
    { value: 'url', label: 'URL' },
    { value: 'hex', label: 'HEX' },
    { value: 'unicode', label: 'Unicode' },
    { value: 'ascii', label: 'ASCII/Native' }
];

// 输入和输出文本
const inputText = ref('');
const outputText = ref('');

// 编码解码函数
const encodeBase64 = (text: string) => {
    try {
        outputText.value = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
    } catch (e: any) {
        outputText.value = '编码失败：' + e.message;
    }
};

const decodeBase64 = (text: string) => {
    try {
        outputText.value = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(text));
    } catch (e) {
        outputText.value = '解码失败：无效的Base64字符串';
    }
};

const encodeURL = (text: string) => {
    try {
        outputText.value = encodeURIComponent(text);
    } catch (e: any) {
        outputText.value = '编码失败：' + e.message;
    }
};

const decodeURL = (text: string) => {
    try {
        outputText.value = decodeURIComponent(text);
    } catch (e) {
        outputText.value = '解码失败：无效的URL字符串';
    }
};

const encodeHex = (text: string) => {
    try {
        outputText.value = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(text));
    } catch (e: any) {
        outputText.value = '编码失败：' + e.message;
    }
};

const decodeHex = (text: string) => {
    try {
        outputText.value = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(text));
    } catch (e) {
        outputText.value = '解码失败：无效的HEX字符串';
    }
};

// 处理 Unicode 字符串
const encodeUnicode = (text: string) => {
    try {
        // 使用 SHA256 哈希处理 Unicode 字符串
        outputText.value = CryptoJS.SHA256(text).toString(CryptoJS.enc.Base64);
    } catch (e: any) {
        outputText.value = '编码失败：' + e.message;
    }
};

const decodeUnicode = (text: string) => {
    try {
        // 解码 Unicode 字符串
        outputText.value = text.replace(/\\u([\dA-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    } catch (e) {
        outputText.value = '解码失败：无效的Unicode字符串';
    }
};

// 处理 ASCII 字符串
const encodeASCII = (text: string) => {
    try {
        // 使用 SHA256 哈希处理 ASCII 字符串
        outputText.value = CryptoJS.SHA256(text).toString(CryptoJS.enc.Base64);
    } catch (e: any) {
        outputText.value = '编码失败：' + e.message;
    }
};

const decodeASCII = (text: string) => {
    try {
        outputText.value = text.split(' ').map(c => String.fromCharCode(parseInt(c))).join('');
    } catch (e) {
        outputText.value = '解码失败：无效的ASCII字符串';
    }
};

// 编码解码操作映射
const encodeDecodeFunctions: Record<EncodeType, { encode: (text: string) => void; decode: (text: string) => void }> = {
    base64: { encode: encodeBase64, decode: decodeBase64 },
    url: { encode: encodeURL, decode: decodeURL },
    hex: { encode: encodeHex, decode: decodeHex },
    unicode: { encode: encodeUnicode, decode: decodeUnicode },
    ascii: { encode: encodeASCII, decode: decodeASCII }
};

// 编码解码触发器
const encode = () => {
    encodeDecodeFunctions[encodeType.value]?.encode(inputText.value);
};

const decode = () => {
    encodeDecodeFunctions[encodeType.value]?.decode(inputText.value);
};

const clear = () => {
    inputText.value = '';
    outputText.value = '';
};

// 按钮弹窗
const modal = ref<InstanceType<typeof CustomModal> | null>(null);
const copyOutput = () => {
    try {
        if (!outputText.value) {
            modal.value?.showModal('提示?', '空的你复制个鸡毛');
            return;
        }
        navigator.clipboard.writeText(outputText.value);
        modal.value?.showModal('提示', '复制成功！');
    } catch (e) {
        modal.value?.showModal('错误', '复制失败，请手动复制');
    }
};
</script>

<template>
    <div>
        <div class="tool-container">
        <div class="tool-header">
            <h2>{{ title }}</h2>
        </div>
        <div class="feature-card">
        <div class="card-content">
          <p>这里是编码解码工具主要功能区域</p>
        </div>
    </div>
        <div class="tool-content">
            <div class="feature-card">
                <div class="encode-type-selector">
                    <label>编码类型：</label>
                    <select v-model="encodeType">
                        <option v-for="type in encodeTypes" :key="type.value" :value="type.value">
                            {{ type.label }}
                        </option>
                    </select>
                </div>
                <h3>编码解码功能</h3>
                <div class="card-content">
                    <div class="input-group">
                        <textarea v-model="inputText" placeholder="输入..." rows="3"></textarea>
                    </div>
                    <div class="button-group">
                        <button class="encode-btn" @click="encode">编码</button>
                        <button class="decode-btn" @click="decode">解码</button>
                        <button class="clear-btn" @click="clear">清除</button>
                        <button class="copy-btn" @click="copyOutput">复制结果</button>
                    </div>
                    <div class="output-group">
                        <textarea v-model="outputText" placeholder="输出..." rows="6" readonly></textarea>
                    </div>
                </div>
            </div>
        </div>
        </div>
        <CustomModal ref="modal" />
    </div>
</template>

<style scoped>
</style>
