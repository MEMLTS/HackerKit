<script setup lang="ts">
import { ref } from 'vue';
import CustomModal from './CustomModal.vue';
import CryptoJS from 'crypto-js';
import '@assets/styles/tool.css';

// 定义哈希算法类型
type HashType = 'md5' | 'sha1' | 'sha256' | 'sha512' | 'sha3';

// 标题和当前选择的哈希算法
const title = ref('哈希计算工具');
const hashType = ref<HashType>('md5');
const hashTypes = [
    { value: 'md5', label: 'MD5' },
    { value: 'sha1', label: 'SHA1' },
    { value: 'sha3', label: 'SHA3' },
    { value: 'sha256', label: 'SHA256' },
    { value: 'sha512', label: 'SHA512' }
];

// 输入和输出文本
const inputText = ref('');
const outputText = ref('');

// 哈希计算函数
const calculateSHA512 = (text: string) => {
    try {
        outputText.value = CryptoJS.SHA512(text).toString();
    } catch (e: any) {
        outputText.value = '计算失败：' + e.message;
    }
};

const calculateSHA3 = (text: string) => {
    try {
        outputText.value = CryptoJS.SHA3(text).toString();
    } catch (e: any) {
        outputText.value = '计算失败：' + e.message;
    }
};

// 哈希计算函数
const calculateMD5 = (text: string) => {
    try {
        outputText.value = CryptoJS.MD5(text).toString();
    } catch (e: any) {
        outputText.value = '计算失败：' + e.message;
    }
};

const calculateSHA1 = (text: string) => {
    try {
        outputText.value = CryptoJS.SHA1(text).toString();
    } catch (e: any) {
        outputText.value = '计算失败：' + e.message;
    }
};

const calculateSHA256 = (text: string) => {
    try {
        outputText.value = CryptoJS.SHA256(text).toString();
    } catch (e: any) {
        outputText.value = '计算失败：' + e.message;
    }
};

// 哈希计算操作映射
const hashFunctions: Record<HashType, (text: string) => void> = {
    md5: calculateMD5,
    sha1: calculateSHA1,
    sha3: calculateSHA3,
    sha256: calculateSHA256,
    sha512: calculateSHA512
};

// 计算触发器
const calculate = () => {
    hashFunctions[hashType.value]?.(inputText.value);
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
                    <h3>哈希计算功能</h3>
                    <div class="card-content">
                        <div class="input-group">
                            <label>输入文本：</label>
                            <textarea v-model="inputText" rows="3"></textarea>
                        </div>
                        <div class="button-group">
                            <button class="encode-btn" @click="calculate">计算</button>
                            <button class="clear-btn" @click="clear">清除</button>
                            <button class="copy-btn" @click="copyOutput">复制结果</button>
                        </div>
                        <div class="output-group">
                            <label>输出结果：</label>
                            <textarea v-model="outputText" rows="3" readonly></textarea>
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