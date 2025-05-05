<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import * as jose from 'jose';
import showMessage from '../utils/MessageService';

const title = ref('JWT工具');

// 输入和输出文本
const inputText = ref('');
const outputText = ref('');
const errorMessage = ref('');
// 是否为加密模式
const isencode = computed(() => operationType.value === 'encode');

// 操作类型
const operationType = ref<'encode' | 'decode' | 'verify'>('encode');

// 签名算法
const algorithmType = ref('HS256');
const algorithmOptions = [
    { value: 'HS256', label: 'HS256 (HMAC-SHA256)' },
    { value: 'HS384', label: 'HS384 (HMAC-SHA384)' },
    { value: 'HS512', label: 'HS512 (HMAC-SHA512)' },
    { value: 'RS256', label: 'RS256 (RSA-SHA256)' },
    { value: 'RS384', label: 'RS384 (RSA-SHA384)' },
    { value: 'RS512', label: 'RS512 (RSA-SHA512)' },
    { value: 'PS256', label: 'PS256 (RSASSA-PSS-SHA256)' },
    { value: 'PS384', label: 'PS384 (RSASSA-PSS-SHA384)' },
    { value: 'PS512', label: 'PS512 (RSASSA-PSS-SHA512)' },
    { value: 'ES256', label: 'ES256 (ECDSA-SHA256)' },
    { value: 'ES384', label: 'ES384 (ECDSA-SHA384)' },
    { value: 'ES512', label: 'ES512 (ECDSA-SHA512)' },
];

// 判断是否为对称算法
const isSymmetricAlgorithm = computed(() => {
    return algorithmType.value.startsWith('HS');
});

// 格式化JSON显示
const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2);
};
// 密钥
const secretKey = ref('');
const privateKey = ref('');
const publicKey = ref('');

const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);
const getOneDayLaterTimestamp = () => getCurrentTimestamp() + 86400; // 一天后的时间戳

const defaultPayload = computed(() => {
    return {
        username: 'memlts',
        sub: 'demo',
        iat: getCurrentTimestamp(),
        exp: getOneDayLaterTimestamp()
    };
});

// 显示加载状态
const isLoading = ref(false);

// JWT解析后的数据
const jwtHeader = ref({});
const jwtPayload = ref({});

// 初始化默认值
const initializeDefaultValues = () => {
    if (operationType.value === 'encode') {
        inputText.value = formatJSON(defaultPayload.value);
    }
};

// 监听操作类型变化，设置默认值
watch(operationType, (newValue) => {
    if (newValue === 'encode') {
        initializeDefaultValues();
    }
});

// 监听算法类型变化
watch(algorithmType, () => {
    if (operationType.value === 'encode') {
        // 如果是编码模式，更新输入框中的默认值
        initializeDefaultValues();
    }
});

// 监听输入变化，自动解析JWT
watch(inputText, (newValue) => {
    if (operationType.value !== 'encode' && newValue) {
        try {
            const parts = newValue.split('.');
            if (parts.length >= 2) {
                // 解析头部
                const headerStr = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
                jwtHeader.value = JSON.parse(headerStr);

                // 解析载荷
                const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
                jwtPayload.value = JSON.parse(payloadStr);
            }
        } catch (e) {
            // 解析失败，清空数据
            jwtHeader.value = {};
            jwtPayload.value = {};
        }
    }
});

// 组件挂载时初始化
initializeDefaultValues();


// JWT处理
const processData = async () => {
    if (!inputText.value.trim()) {
        showMessage('请输入要处理的内容', { type: 'warning' });
        return;
    }

    isLoading.value = true;
    errorMessage.value = '';

    try {
        if (operationType.value === 'encode') {
            outputText.value = await encodeJWT(inputText.value);
            showMessage('JWT编码成功', { type: 'success' });
        } else if (operationType.value === 'decode') {
            outputText.value = await decodeJWT(inputText.value);
            showMessage('JWT解码成功', { type: 'success' });
        } else {
            outputText.value = await verifyJWT(inputText.value);
            showMessage('JWT验证成功', { type: 'success' });
        }
    } catch (error) {
        console.error('处理失败:', error);
        showMessage(`处理失败: ${error instanceof Error ? error.message : String(error)}`, { type: 'error' });
    } finally {
        isLoading.value = false;
    }
};

// 生成密钥对
const generateKeyPair = async () => {
    try {
        let keyPair;
        if (algorithmType.value.startsWith('RS') || algorithmType.value.startsWith('PS')) {
            // 生成RSA密钥对
            keyPair = await jose.generateKeyPair(algorithmType.value, {
                extractable: true
            });
        } else if (algorithmType.value.startsWith('ES')) {
            // 生成EC密钥对
            const curve = algorithmType.value === 'ES256' ? 'P-256' :
                algorithmType.value === 'ES384' ? 'P-384' : 'P-521';
            keyPair = await jose.generateKeyPair(algorithmType.value, {
                crv: curve,
                extractable: true
            });
        } else {
            showMessage('不支持的算法类型', { type: 'warning' });
            throw new Error('不支持的算法类型');
        }

        // 导出私钥为PEM格式
        const pkcs8 = await jose.exportPKCS8(keyPair.privateKey);
        privateKey.value = pkcs8;

        // 导出公钥为PEM格式
        const spki = await jose.exportSPKI(keyPair.publicKey);
        publicKey.value = spki;

        showMessage('密钥对生成成功', { type: 'success' });
    } catch (error) {
        console.error('生成密钥对失败:', error);
        showMessage(`生成密钥对失败: ${error instanceof Error ? error.message : String(error)}`, { type: 'error' });
    }
};

// JWT编码
const encodeJWT = async (text: string): Promise<string> => {
    try {
        let payload;
        try {
            payload = JSON.parse(text);
        } catch (e) {
            showMessage('编码失败: JSON格式不正确', { type: 'error' });
            throw new Error('编码失败: JSON格式不正确');
        }

        // 获取当前时间戳
        const iat = Math.floor(Date.now() / 1000);
        const exp = iat + 60 * 60; // 默认1小时过期

        // 如果payload中没有iat和exp，则添加
        if (!payload.iat) payload.iat = iat;
        if (!payload.exp) payload.exp = exp;

        const jwtInstance = new jose.SignJWT(payload)
            .setProtectedHeader({ alg: algorithmType.value, typ: 'JWT' })
            .setIssuedAt(iat)
            .setExpirationTime(exp);

        let token;
        if (isSymmetricAlgorithm.value) {
            // 对称算法使用密钥
            if (!secretKey.value) {
                showMessage('编码失败: 请输入密钥', { type: 'error' });
                throw new Error('请输入密钥');
            }
            const secret = new TextEncoder().encode(secretKey.value);
            token = await jwtInstance.sign(secret);
        } else {
            // 非对称算法使用私钥
            if (!privateKey.value) {
                showMessage('编码失败: 请输入私钥', { type: 'error' });
                throw new Error('请输入或生成私钥');
            }
            const privateKeyObj = await jose.importPKCS8(privateKey.value, algorithmType.value);
            token = await jwtInstance.sign(privateKeyObj);
        }

        return token;
    } catch (error) {
        console.error('编码失败:', error);
        throw error;
    }
};

// JWT解码
const decodeJWT = async (token: string): Promise<string> => {
    try {
        // 使用 jose 的 jwtDecode 方法解码 JWT
        const decoded = jose.decodeJwt(token);
        return formatJSON(decoded);
    } catch (error) {
        console.error('解码失败:', error);
        throw new Error('解码失败: 无效的 JWT');
    }
};

// JWT验证
const verifyJWT = async (token: string): Promise<string> => {
    try {
        let payload;
        if (isSymmetricAlgorithm.value) {
            // 对称算法使用密钥验证
            if (!secretKey.value) {
                showMessage('请输入密钥', { type: 'warning' });
                throw new Error('请输入密钥');
            }
            const secret = new TextEncoder().encode(secretKey.value);
            const result = await jose.jwtVerify(token, secret, {
                algorithms: [algorithmType.value]
            });
            payload = result.payload;
        } else {
            // 非对称算法使用公钥验证
            if (!publicKey.value) {
                showMessage('请输入公钥', { type: 'warning' });
                throw new Error('请输入公钥');
            }
            const publicKeyObj = await jose.importSPKI(publicKey.value, algorithmType.value);
            const result = await jose.jwtVerify(token, publicKeyObj, {
                algorithms: [algorithmType.value]
            });
            payload = result.payload;
        }
        return formatJSON(payload);
    } catch (error) {
        console.error('验证失败:', error);
        showMessage('验证失败: 无效的 JWT 或密钥不正确', { type: 'error' });
        throw new Error('验证失败: 无效的 JWT 或密钥不正确');
    }
};

// 复制结果到剪贴板
const copyResult = () => {
    if (!outputText.value) {
        showMessage('没有内容可复制', { type: 'warning' });
        return;
    }

    navigator.clipboard.writeText(outputText.value)
        .then(() => {
            showMessage('已复制到剪贴板', { type: 'success' });
        })
        .catch(err => {
            console.error('复制失败:', err);
            showMessage('复制失败，请手动复制', { type: 'error' });
        });
};

// 清空输入输出
const clearAll = () => {
    inputText.value = '';
    outputText.value = '';
    errorMessage.value = '';
    jwtHeader.value = {};
    jwtPayload.value = {};
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
                    <!-- 操作类型选择 -->
                    <div class="operation-toggle">
                        <button :class="{ active: operationType === 'encode' }"
                            @click="operationType = 'encode'; clearAll()">
                            JWT 加密
                        </button>
                        <button :class="{ active: operationType === 'decode' }"
                            @click="operationType = 'decode'; clearAll()">
                            JWT 解密
                        </button>
                        <button :class="{ active: operationType === 'verify' }"
                            @click="operationType = 'verify'; clearAll()">
                            JWT 校验
                        </button>
                    </div>

                    <!-- 错误提示 -->
                    <div v-if="errorMessage" class="error-message">
                        {{ errorMessage }}
                    </div>

                    <!-- 设置区域 -->
                    <div class="settings-group">
                        <div class="setting-group">
                            <label>签名算法:</label>
                            <select v-model="algorithmType">
                                <option v-for="option in algorithmOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <!-- 对称算法密钥设置 -->
                    <div v-if="isSymmetricAlgorithm" class="setting-group">
                        <label>对称密钥</label>
                        <input v-model="secretKey" placeholder="请输入密钥" />
                    </div>

                    <!-- 非对称算法密钥设置 -->
                    <div v-if="!isSymmetricAlgorithm" class="key-settings">
                        <div class="setting-group">
                            <label>私钥</label>
                            <textarea v-model="privateKey" placeholder="请输入私钥或点击生成按钮" rows="3"></textarea>
                        </div>
                        <div class="setting-group">
                            <label>公钥</label>
                            <textarea v-model="publicKey" placeholder="请输入公钥或点击生成按钮" rows="3"></textarea>
                        </div>
                    </div>
                    <!-- 输入区域 -->
                    <div class="input-group">
                        <textarea v-model="inputText"
                            :placeholder="operationType === 'encode' ? '输入要加密的JSON...' : '输入要处理的JWT...'"
                            rows="6"></textarea>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="button-group">
                        <button @click="processData" :disabled="isLoading" class="encode-btn">
                            {{ isLoading ? '处理中...' : operationType === 'encode' ? '加密' : operationType === 'decode' ?
                                '解密'
                                : '验证' }}
                        </button>
                        <button @click="clearAll" class="clear-btn">
                            清空
                        </button>
                        <button @click="copyResult" class="copy-btn">
                            复制
                        </button>
                        <button @click="generateKeyPair" class="generate-btn"
                            v-if="!isSymmetricAlgorithm">生成密钥对</button>
                    </div>

                    <!-- JWT解析显示区域 -->
                    <div v-if="operationType !== 'encode' && Object.keys(jwtHeader).length > 0" class="jwt-parsed-info">
                        <div class="jwt-section">
                            <h3>头部 (Header)</h3>
                            <div class="jwt-content">
                                <table>
                                    <tr v-for="(value, key) in jwtHeader" :key="key">
                                        <td class="key">{{ key }}</td>
                                        <td class="value">{{ value }}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <div class="jwt-section">
                            <h3>载荷 (Payload)</h3>
                            <div class="jwt-content">
                                <table>
                                    <tr v-for="(value, key) in jwtPayload" :key="key">
                                        <td class="key">{{ key }}</td>
                                        <td class="value">
                                            {{ key === 'iat' || key === 'exp' || key === 'nbf' ? new Date(value *
                                                1000).toLocaleString() : value }}
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- 输出区域 -->
                    <div class="output-group" v-if="isencode">
                        <textarea v-model="outputText" placeholder="处理结果将显示在这里..." rows="6" readonly></textarea>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.jwt-parsed-info {
    margin: 15px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
}

.jwt-section {
    margin-bottom: 10px;
}

.jwt-section h3 {
    background-color: #f5f5f5;
    padding: 8px 12px;
    margin: 0;
    font-size: 14px;
    border-bottom: 1px solid #ddd;
}

.jwt-content {
    padding: 10px;
    background-color: #fff;
    overflow-x: auto;
}

.jwt-content table {
    width: 100%;
    border-collapse: collapse;
}

.jwt-content td {
    padding: 6px 10px;
    border-bottom: 1px solid #eee;
}

.jwt-content td.key {
    font-weight: bold;
    width: 120px;
    color: #555;
}

.jwt-content td.value {
    word-break: break-all;
}

/* 新增样式 */
.key-settings {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
}

.key-settings textarea {
    width: 100%;
    font-family: monospace;
    font-size: 12px;
    resize: vertical;
}

.preview-content {
    background-color: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    font-family: monospace;
    font-size: 12px;
    white-space: pre-wrap;
    max-height: 150px;
    overflow-y: auto;
}
</style>
