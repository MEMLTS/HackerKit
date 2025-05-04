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
const allOutputs = ref<Record<string, string>>({});  // 存储所有算法的输出

// 哈希计算函数
const calculateMD5 = (text: string) => {
    try {
        return CryptoJS.MD5(text).toString();
    } catch (e: any) {
        return '计算失败：' + e.message;
    }
};

const calculateSHA1 = (text: string) => {
    try {
        return CryptoJS.SHA1(text).toString();
    } catch (e: any) {
        return '计算失败：' + e.message;
    }
};

const calculateSHA256 = (text: string) => {
    try {
        return CryptoJS.SHA256(text).toString();
    } catch (e: any) {
        return '计算失败：' + e.message;
    }
};

const calculateSHA512 = (text: string) => {
    try {
        return CryptoJS.SHA512(text).toString();
    } catch (e: any) {
        return '计算失败：' + e.message;
    }
};

const calculateSHA3 = (text: string) => {
    try {
        return CryptoJS.SHA3(text).toString();
    } catch (e: any) {
        return '计算失败：' + e.message;
    }
};

const calculateRIPEMD160 = (text: string) => {
    try {
        return CryptoJS.RIPEMD160(text).toString();
    } catch (e: any) {
        return '计算失败：' + e.message;
    }
};

const calculateSHA224 = (text: string) => {
    try {
        return CryptoJS.SHA224(text).toString();
    } catch (e: any) {
        return '计算失败：' + e.message;
    }
};

const calculateSHA384 = (text: string) => {
    try {
        return CryptoJS.SHA384(text).toString();
    } catch (e: any) {
        return '计算失败：' + e.message;
    }
};

// 哈希计算操作映射
const hashFunctions: Record<HashType, (text: string) => string> = {
    md5: calculateMD5,
    sha1: calculateSHA1,
    sha256: calculateSHA256,
    sha512: calculateSHA512,
    sha3: calculateSHA3,
    ripemd160: calculateRIPEMD160,
    sha224: calculateSHA224,
    sha384: calculateSHA384
};

// 计算触发器
const calculate = () => {
    outputText.value = hashFunctions[hashType.value](inputText.value);
};

// 计算所有哈希值
const calculateAll = () => {
    allOutputs.value = {};  // 重置所有输出
    Object.keys(hashFunctions).forEach((key) => {
        const result = hashFunctions[key as HashType](inputText.value);
        allOutputs.value[key] = result;  // 保存每个哈希算法的计算结果
    });
};

const clear = () => {
    inputText.value = '';
    outputText.value = '';
    allOutputs.value = {};  // 清除所有输出
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
                    <div class="card-content">
                        <div class="input-group">
                            <br>
                            <textarea v-model="inputText" placeholder="输入..." rows="5"></textarea>
                        </div>
                        <div class="button-group">
                            <button class="encode-btn" @click="calculate">计算</button>
                            <button class="encode-btn" @click="calculateAll">全部计算</button>
                            <button class="clear-btn" @click="clear">清除</button>
                            <button class="copy-btn" @click="copyOutput">复制结果</button>
                        </div>
                        <div class="output-group">
                            <textarea v-model="outputText" placeholder="输出..." rows="8" readonly></textarea>
                        </div>
                        <!-- 显示全部计算的结果 -->
                        <div class="all-outputs">
                            <div v-for="(result, key) in allOutputs" :key="key">
                                <strong>{{ key }}:</strong>
                                <textarea :value="result" rows="2" readonly></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <CustomModal ref="modal" />
    </div>
</template>

<style scoped></style>
