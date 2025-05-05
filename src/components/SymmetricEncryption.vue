<script setup lang="ts">
import { ref } from 'vue';
import CustomModal from '../view/CustomModal.vue';
import showMessage from '../utils/MessageService';
import CryptoJS from 'crypto-js';
import '@assets/styles/tool.css';


// 定义加密类型和模式的类型
type EncryptionType = 'aes' | 'des' | '3des';
type EncryptionMode = 'ecb' | 'cbc' | 'cfb' | 'ofb' | 'ctr';
type KeyFormat = 'raw' | 'hex' | 'base64';

// 定义CryptoJS模式类型映射
type CryptoJSMode = {
    [K in Uppercase<EncryptionMode>]: any;
};

// 定义加密选项接口
interface CryptoOptions {
    mode: any;
    padding: typeof CryptoJS.pad.Pkcs7;
    iv?: CryptoJS.lib.WordArray;
}

// 标题和当前选择的加密类型
const title = ref('对称加密工具');
const encryptionType = ref<EncryptionType>('aes');
const encryptionMode = ref<EncryptionMode>('cbc');
const keyLength = ref<number>(128);
const keyFormat = ref<KeyFormat>('raw');
const ivFormat = ref<KeyFormat>('raw');
const inputFormat = ref<KeyFormat>('raw');
const outputFormat = ref<KeyFormat>('raw');

// 加密类型选项
const encryptionTypes = [
    { value: 'aes', label: 'AES' },
    { value: 'des', label: 'DES' },
    { value: '3des', label: '3DES' }
];

// 加密模式选项
const encryptionModes = [
    { value: 'ecb', label: 'ECB' },
    { value: 'cbc', label: 'CBC' },
    { value: 'cfb', label: 'CFB' },
    { value: 'ofb', label: 'OFB' },
    { value: 'ctr', label: 'CTR' }
];

// 密钥长度选项
const keyLengths = [
    { value: 128, label: '128位(16byte)' },
    { value: 192, label: '192位(24byte)' },
    { value: 256, label: '256位(32byte)' }
];

// 格式选项
const formatOptions = [
    { value: 'raw', label: 'Raw' },
    { value: 'hex', label: 'HEX' },
    { value: 'base64', label: 'Base64' }
];

// 输入和输出
const inputText = ref('');
const outputText = ref('');
const key = ref('');
const iv = ref('');

// 生成随机密钥
const generateKey = () => {
    const keyBytes = keyLength.value / 8;
    const randomKey = CryptoJS.lib.WordArray.random(keyBytes);
    key.value = formatOutput(randomKey, keyFormat.value);
};

// 生成随机IV
const generateIV = () => {
    const ivBytes = 16; // AES块大小为16字节
    const randomIV = CryptoJS.lib.WordArray.random(ivBytes);
    iv.value = formatOutput(randomIV, ivFormat.value);
};

// 格式化输入
const formatInput = (input: string, format: KeyFormat): CryptoJS.lib.WordArray => {
    switch (format) {
        case 'hex':
            return CryptoJS.enc.Hex.parse(input);
        case 'base64':
            return CryptoJS.enc.Base64.parse(input);
        case 'raw':
        default:
            return CryptoJS.enc.Utf8.parse(input);
    }
};

// 格式化输出
const formatOutput = (wordArray: CryptoJS.lib.WordArray, format: KeyFormat): string => {
    switch (format) {
        case 'hex':
            return wordArray.toString(CryptoJS.enc.Hex);
        case 'base64':
            return wordArray.toString(CryptoJS.enc.Base64);
        case 'raw':
        default:
            try {
                // 尝试转换为UTF-8文本，如果失败则返回Base64
                const utf8Text = wordArray.toString(CryptoJS.enc.Utf8);
                return utf8Text;
            } catch (e) {
                return wordArray.toString(CryptoJS.enc.Base64);
            }
    }
};
// 加密函数
const encrypt = () => {
    try {
        if (!inputText.value || !key.value) {
            modal.value?.showModal('错误', '请输入要加密的内容和密钥');
            return;
        }

        if (encryptionMode.value !== 'ecb' && !iv.value) {
            modal.value?.showModal('错误', '请输入初始向量(IV)');
            return;
        }

        const inputData = formatInput(inputText.value, inputFormat.value);
        const keyData = formatInput(key.value, keyFormat.value);
        const ivData = encryptionMode.value === 'ecb' ? null : formatInput(iv.value, ivFormat.value);

        let encrypted;
        const options: CryptoOptions = {
            mode: CryptoJS.mode[encryptionMode.value.toUpperCase() as keyof CryptoJSMode],
            padding: CryptoJS.pad.Pkcs7
        };

        if (ivData) {
            options['iv'] = ivData;
        }

        switch (encryptionType.value) {
            case 'aes':
                encrypted = CryptoJS.AES.encrypt(inputData, keyData, options);
                break;
            case 'des':
                encrypted = CryptoJS.DES.encrypt(inputData, keyData, options);
                break;
            case '3des':
                encrypted = CryptoJS.TripleDES.encrypt(inputData, keyData, options);
                break;
        }

        outputText.value = formatOutput(encrypted.ciphertext, outputFormat.value);
    } catch (e: any) {
        modal.value?.showModal('错误', '加密失败：' + e.message);
    }
};


// 解密函数
const decrypt = () => {
    try {
        if (!inputText.value || !key.value) {
            modal.value?.showModal('错误', '请输入要解密的内容和密钥');
            return;
        }
        // Ensure the IV is provided for modes other than ECB
        if (encryptionMode.value !== 'ecb' && !iv.value) {
            modal.value?.showModal('错误', '请输入初始向量(IV)');
            return;
        }
        // 格式化密钥和IV
        const keyData = formatInput(key.value, keyFormat.value);
        const ivData = encryptionMode.value === 'ecb' ? null : formatInput(iv.value, ivFormat.value);
        // 配置加密选项
        const options: CryptoOptions = {
            mode: CryptoJS.mode[encryptionMode.value.toUpperCase() as keyof CryptoJSMode],
            padding: CryptoJS.pad.Pkcs7
        };
        if (ivData) {
            options.iv = ivData;
        }
        let decrypted;

        // 对于输入，我们需要根据输入格式正确处理
        let cipherParams;
        if (inputFormat.value === 'hex' || inputFormat.value === 'base64') {
            // 如果输入是格式化的密文，需要正确创建CipherParams
            cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: formatInput(inputText.value, inputFormat.value)
            });
        } else {
            // 如果输入是Base64编码的完整加密结果 (CryptoJS默认输出)
            cipherParams = inputText.value;
        }
        switch (encryptionType.value) {
            case 'aes':
                decrypted = CryptoJS.AES.decrypt(cipherParams, keyData, options);
                break;
            case 'des':
                decrypted = CryptoJS.DES.decrypt(cipherParams, keyData, options);
                break;
            case '3des':
                decrypted = CryptoJS.TripleDES.decrypt(cipherParams, keyData, options);
                break;
            default:
                throw new Error('不支持的加密类型');
        }
        // 确保输出格式正确
        outputText.value = formatOutput(decrypted, outputFormat.value);
    } catch (e: any) {
        modal.value?.showModal('错误', '解密失败：' + e.message);
        console.error('解密错误:', e); // 添加控制台错误日志以便调试
    }
};

// 清空函数
const clear = () => {
    inputText.value = '';
    outputText.value = '';
};

// 弹窗组件
const modal = ref<InstanceType<typeof CustomModal> | null>(null);
const copyOutput = () => {
    try {
        if (!outputText.value) {
            modal.value?.showModal('提示', '没有可复制的内容');
            return;
        }
        navigator.clipboard.writeText(outputText.value);
        showMessage('复制成功', { type: 'success' });
    } catch (e) {
        showMessage('复制失败!', { type: 'error' });
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
                    <div class="encryption-settings">
                        <div class="setting-group">
                            <label>加密算法：</label>
                            <select v-model="encryptionType">
                                <option v-for="type in encryptionTypes" :key="type.value" :value="type.value">
                                    {{ type.label }}
                                </option>
                            </select>
                            <label>加密模式：</label>
                            <select v-model="encryptionMode">
                                <option v-for="mode in encryptionModes" :key="mode.value" :value="mode.value">
                                    {{ mode.label }}
                                </option>
                            </select>
                        </div>
                        <div class="setting-group" v-if="encryptionType === 'aes'">
                            <label>密钥长度：</label>
                            <select v-model="keyLength">
                                <option v-for="length in keyLengths" :key="length.value" :value="length.value">
                                    {{ length.label }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="key-settings">
                        <div class="setting-group">
                            <label>密钥</label>
                            <select v-model="keyFormat">
                                <option v-for="format in formatOptions" :key="format.value" :value="format.value">
                                    {{ format.label }}
                                </option>
                            </select>
                            <input v-model="key" placeholder="输入密钥" />
                            <button @click="generateKey">生成</button>
                        </div>

                        <div class="setting-group" v-if="encryptionMode !== 'ecb'">
                            <label>IV</label>
                            <select v-model="ivFormat">
                                <option v-for="format in formatOptions" :key="format.value" :value="format.value">
                                    {{ format.label }}
                                </option>
                            </select>
                            <input v-model="iv" placeholder="输入IV" />
                            <button @click="generateIV">生成</button>
                        </div>
                    </div>

                    <div class="data-format-settings">
                        <div class="setting-group">
                            <label>输入格式：</label>
                            <select v-model="inputFormat">
                                <option v-for="format in formatOptions" :key="format.value" :value="format.value">
                                    {{ format.label }}
                                </option>
                            </select>
                            <label>输出格式：</label>
                            <select v-model="outputFormat">
                                <option v-for="format in formatOptions" :key="format.value" :value="format.value">
                                    {{ format.label }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="input-output-area">
                        <div class="input-group">
                            <textarea v-model="inputText" placeholder="输入要加密/解密的内容" rows="3"></textarea>
                        </div>

                        <div class="button-group">
                            <button class="encode-btn" @click="encrypt">加密</button>
                            <button class="decode-btn" @click="decrypt">解密</button>
                            <button class="clear-btn" @click="clear">清除</button>
                            <button class="copy-btn" @click="copyOutput">复制结果</button>
                        </div>

                        <div class="output-group">
                            <textarea v-model="outputText" placeholder="输出结果" rows="6" readonly></textarea>
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
