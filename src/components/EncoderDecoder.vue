<script setup lang="ts">
import { ref } from 'vue';
import CustomModal from '../view/CustomModal.vue';
import CryptoJS from 'crypto-js';
import punycode from 'punycode';
import showMessage from '../utils/MessageService';

import '@assets/styles/tool.css';

// 定义编码类型的联合类型
type EncodeType = 'base64' | 'url' | 'hex' | 'unicode' | 'ascii' | 'punycode';

// 标题和当前选择的编码类型
const title = ref('编码解码工具');
const encodeType = ref<EncodeType>('base64');
const encodeTypes = [
    { value: 'base64', label: 'Base64' },
    { value: 'url', label: 'URL' },
    { value: 'hex', label: 'HEX' },
    { value: 'unicode', label: 'Unicode' },
    { value: 'ascii', label: 'ASCII/Native' },
    { value: 'punycode', label: 'Punycode' }
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
        showMessage('编码失败', { type: 'error' });
    }
};

const decodeBase64 = (text: string) => {
    try {
        outputText.value = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(text));
    } catch (e) {
        outputText.value = '解码失败：无效的Base64字符串';
        showMessage('解码失败', { type: 'error' });
    }
};

const encodeURL = (text: string) => {
    try {
        outputText.value = encodeURIComponent(text);
    } catch (e: any) {
        outputText.value = '编码失败：' + e.message;
        showMessage('编码失败', { type: 'error' });
    }
};

const decodeURL = (text: string) => {
    try {
        outputText.value = decodeURIComponent(text);
    } catch (e) {
        outputText.value = '解码失败：无效的URL字符串';
        showMessage('解码失败', { type: 'error' });
    }
};

const encodeHex = (text: string) => {
    try {
        outputText.value = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(text));
    } catch (e: any) {
        outputText.value = '编码失败：' + e.message;
        showMessage('编码失败', { type: 'error' });
    }
};

const decodeHex = (text: string) => {
    try {
        outputText.value = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(text));
    } catch (e) {
        outputText.value = '解码失败：无效的HEX字符串';
        showMessage('解码失败', { type: 'error' });
    }
};

// 处理 Unicode 字符串
const encodeUnicode = (text: string) => {
    try {
        // 使用 SHA256 哈希处理 Unicode 字符串
        outputText.value = CryptoJS.SHA256(text).toString(CryptoJS.enc.Base64);
    } catch (e: any) {
        outputText.value = '编码失败：' + e.message;
        showMessage('编码失败', { type: 'error' });
    }
};

const decodeUnicode = (text: string) => {
    try {
        // 解码 Unicode 字符串
        outputText.value = text.replace(/\\u([\dA-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    } catch (e) {
        outputText.value = '解码失败：无效的Unicode字符串';
        showMessage('解码失败', { type: 'error' });
    }
};

// 处理 ASCII 字符串
const encodeASCII = (text: string) => {
    try {
        // 使用 SHA256 哈希处理 ASCII 字符串
        outputText.value = CryptoJS.SHA256(text).toString(CryptoJS.enc.Base64);
    } catch (e: any) {
        outputText.value = '编码失败：' + e.message;
        showMessage('编码失败', { type: 'error' });
    }
};

const decodeASCII = (text: string) => {
    try {
        outputText.value = text.split(' ').map(c => String.fromCharCode(parseInt(c))).join('');
    } catch (e) {
        outputText.value = '解码失败：无效的ASCII字符串';
        showMessage('解码失败', { type: 'error' });
    }
};

//* 编码解码操作映射

// 处理 Punycode 字符串
const encodePunycode = (text: string) => {
    try {
        outputText.value = punycode.encode(text);
    } catch (e: any) {
        outputText.value = '编码失败：' + e.message;
        showMessage('编码失败', { type: 'error' });
    }
};

const decodePunycode = (text: string) => {
    try {
        outputText.value = punycode.decode(text);
    } catch (e) {
        outputText.value = '解码失败：无效的Punycode字符串';
        showMessage('解码失败', { type: 'error' });
    }
};

const encodeDecodeFunctions: Record<EncodeType, { encode: (text: string) => void; decode: (text: string) => void }> = {
    base64: { encode: encodeBase64, decode: decodeBase64 },
    url: { encode: encodeURL, decode: decodeURL },
    hex: { encode: encodeHex, decode: decodeHex },
    unicode: { encode: encodeUnicode, decode: decodeUnicode },
    ascii: { encode: encodeASCII, decode: decodeASCII },
    punycode: { encode: encodePunycode, decode: decodePunycode }
};

// 编码解码触发器
const encode = () => {
    if (!inputText.value) {
        modal.value?.showModal('WARN', '输入不能为空');
        return;
    }
    encodeDecodeFunctions[encodeType.value]?.encode(inputText.value);
};

const decode = () => {
    if (!inputText.value) {
        modal.value?.showModal('WARN', '输入不能为空');
        return;
    }
    encodeDecodeFunctions[encodeType.value]?.decode(inputText.value);
};

const clear = () => {
    inputText.value = '';
    outputText.value = '';
    showMessage('已清空', { type: 'success' });
};

const swap = () => {
    const temp = inputText.value;
    inputText.value = outputText.value;
    outputText.value = temp;
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
        showMessage('复制成功！', { type: 'success' });
    } catch (e) {
        showMessage('复制失败，请手动复制', { type: 'error' });
    }
};
</script>

<template>
    <div>
        <div class="tool-container">
            <div class="tool-header">
                <h2>{{ title }}</h2>
            </div>
            <div class="tool-content">
                <div class="feature-card">
                    <div class="setting-group">
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
                            <button class="encode-btn" @click="swap">↑ ↓</button>
                        </div>
                        <div class="output-group">
                            <textarea v-model="outputText" placeholder="输出..." rows="12" readonly></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <CustomModal ref="modal" />
    </div>
</template>

<style scoped></style>
