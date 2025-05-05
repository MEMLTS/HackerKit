<script setup lang="ts">
import { ref } from 'vue';
import CustomModal from './CustomModal.vue';
import CryptoJS from 'crypto-js';
import '@assets/styles/tool.css';

// 定义哈希算法类型
type HashType = 'md5' | 'sha1' | 'sha256' | 'sha512' | 'sha3' | 'ripemd160' | 'sha224' | 'sha384';

// 标题和当前选择的哈希算法
const title = ref('哈希计算工具');
const hashType = ref<HashType>('md5');
const hashTypes = [
    { value: 'md5', label: 'MD5' },
    { value: 'sha1', label: 'SHA1' },
    { value: 'sha256', label: 'SHA256' },
    { value: 'sha512', label: 'SHA512' },
    { value: 'sha3', label: 'SHA3' },
    { value: 'ripemd160', label: 'RIPEMD160' },
    { value: 'sha224', label: 'SHA2-224' },
    { value: 'sha384', label: 'SHA3-384' }
];

// 输入和输出文本
const inputText = ref('');
const outputText = ref('');

// 文件信息
const fileInfo = ref<{ name: string; size: string } | null>(null);
const isFileMode = ref(false);

// 显式列出CryptoJS哈希方法
const hashFunctions: Record<HashType, (text: string) => string> = {
    md5: (text) => CryptoJS.MD5(text).toString(),
    sha1: (text) => CryptoJS.SHA1(text).toString(),
    sha256: (text) => CryptoJS.SHA256(text).toString(),
    sha512: (text) => CryptoJS.SHA512(text).toString(),
    sha3: (text) => CryptoJS.SHA3(text).toString(),
    ripemd160: (text) => CryptoJS.RIPEMD160(text).toString(),
    sha224: (text) => CryptoJS.SHA224(text).toString(),
    sha384: (text) => CryptoJS.SHA384(text).toString()
};

// 计算触发器
const calculate = () => {
    if (!inputText.value && !isFileMode.value) {
        modal.value?.showModal('WARN', '输入不能为空');
        return;
    }
    if (isFileMode.value && fileInfo.value) {
        // 重新计算文件哈希
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
            outputText.value = hashFunctions[hashType.value](wordArray.toString());
        };
        // 重新读取文件内容
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput.files?.[0]) {
            reader.readAsArrayBuffer(fileInput.files[0]);
        }
    } else {
        outputText.value = hashFunctions[hashType.value](inputText.value);
    }
};

const clear = () => {
    inputText.value = '';
    outputText.value = '';
    fileInfo.value = null;
    isFileMode.value = false;
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

// 文件处理
const handleFileInput = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // 更新文件信息
    fileInfo.value = {
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB'
    };
    isFileMode.value = true;

    const reader = new FileReader();
    reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        outputText.value = hashFunctions[hashType.value](wordArray.toString());
    };
    reader.readAsArrayBuffer(file);  // 直接读取为ArrayBuffer
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
                    <div class="hash-type-selector">
                        <label>哈希算法：</label>
                        <select v-model="hashType">
                            <option v-for="type in hashTypes" :key="type.value" :value="type.value">
                                {{ type.label }}
                            </option>
                        </select>
                    </div>
                    <div class="card-content">
                        <div class="input-group" v-if="!isFileMode">
                            <br>
                            <textarea v-model="inputText" placeholder="输入文本..." rows="5"></textarea>
                        </div>
                        <div class="file-info" v-else>
                            <div class="file-details">
                                <p><strong>文件名：</strong>{{ fileInfo?.name }}</p>
                                <p><strong>文件大小：</strong>{{ fileInfo?.size }}</p>
                            </div>
                        </div>
                        <div class="button-group">
                            <button class="encode-btn" @click="calculate">计算</button>
                            <button class="clear-btn" @click="clear">清除</button>
                            <button class="copy-btn" @click="copyOutput">复制</button>
                            <label for="file-input" class="encode-btn">选择文件</label>
                            <input id="file-input" type="file" @change="handleFileInput" accept="*.*"
                                class="file-input">
                        </div>
                        <div class="output-group">
                            <textarea v-model="outputText" placeholder="输出..." rows="8" readonly></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <CustomModal ref="modal" />
    </div>
</template>

<style scoped>
.file-input {
    display: none;
}

.file-info {
    margin: 20px 0;
    padding: 15px;
    border: 1px dashed #ccc;
    border-radius: 8px;
    background-color: #f8f9fa;
}

.file-details {
    text-align: left;
}

.file-details p {
    margin: 8px 0;
    color: #666;
}

.file-details strong {
    color: #333;
    margin-right: 10px;
}
</style>
