<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import '@assets/styles/tool.css';
import { createPatch, diffLines, diffWords } from 'diff';

const title = ref('文本对比工具');
const text1 = ref('');
const text2 = ref('');
const diffResult = ref('');
const diffType = ref<'patch' | 'line' | 'word'>('line');
const isLoading = ref(false);
const showLineNumbers = ref(true);
const ignoreWhitespace = ref(false);
const highlightChanges = ref(true);

// 根据当前设置计算样式
const diffStyles = computed(() => ({
    'add-line': highlightChanges.value ? 'background-color: #e6ffed; color: #24292e;' : '',
    'remove-line': highlightChanges.value ? 'background-color: #ffeef0; color: #24292e;' : '',
    'add-word': highlightChanges.value ? 'background-color: #acf2bd; color: #24292e; text-decoration: none;' : '',
    'remove-word': highlightChanges.value ? 'background-color: #fdb8c0; color: #24292e; text-decoration: none;' : '',
}));

// 格式化显示行号
const formatLineNumber = (num: number): string => {
    return num.toString().padStart(4, ' ');
};

// 执行文本对比
async function compareText() {
    if (!text1.value && !text2.value) {
        return;
    }

    isLoading.value = true;

    try {
        // 使用setTimeout让UI有机会更新并显示加载状态
        setTimeout(() => {
            let result = '';
            const text1Clean = ignoreWhitespace.value ? text1.value.trim() : text1.value;
            const text2Clean = ignoreWhitespace.value ? text2.value.trim() : text2.value;

            switch (diffType.value) {
                case 'patch':
                    result = formatPatchDiff(text1Clean, text2Clean);
                    break;
                case 'line':
                    result = formatLineDiff(text1Clean, text2Clean);
                    break;
                case 'word':
                    result = formatWordDiff(text1Clean, text2Clean);
                    break;
            }

            diffResult.value = result;
            isLoading.value = false;
        }, 10);
    } catch (error) {
        console.error('Diff error:', error);
        diffResult.value = `对比出错: ${error instanceof Error ? error.message : String(error)}`;
        isLoading.value = false;
    }
}

// 格式化补丁模式
function formatPatchDiff(oldText: string, newText: string): string {
    const patch = createPatch('Text Comparison', oldText, newText, 'Text 1', 'Text 2');

    // 格式化补丁输出
    return patch
        .split('\n')
        .map(line => {
            if (line.startsWith('+') && line !== '+++') {
                return `<span style="${diffStyles.value['add-line']}">` + escapeHtml(line) + '</span>';
            } else if (line.startsWith('-') && line !== '---') {
                return `<span style="${diffStyles.value['remove-line']}">` + escapeHtml(line) + '</span>';
            }
            return escapeHtml(line);
        })
        .join('\n');
}

// 格式化行对比模式
function formatLineDiff(oldText: string, newText: string): string {
    const diff = diffLines(oldText, newText, { ignoreWhitespace: ignoreWhitespace.value });
    let lineNumber1 = 1;
    let lineNumber2 = 1;

    return diff.map(part => {
        const lines = part.value.split('\n').filter(line => line !== '' || !ignoreWhitespace.value);
        // 最后一个空行特殊处理
        if (part.value.endsWith('\n') && lines.length > 0) {
            lines.pop();
        }

        const result = lines.map(line => {
            let prefix = '';
            if (showLineNumbers.value) {
                if (part.added) {
                    prefix = `<span class="line-number">    | ${formatLineNumber(lineNumber2++)}</span> `;
                } else if (part.removed) {
                    prefix = `<span class="line-number">${formatLineNumber(lineNumber1++)} |    </span> `;
                } else {
                    prefix = `<span class="line-number">${formatLineNumber(lineNumber1++)} | ${formatLineNumber(lineNumber2++)}</span> `;
                }
            }

            if (part.added) {
                return `${prefix}<span style="${diffStyles.value['add-line']}">+ ${escapeHtml(line)}</span>`;
            } else if (part.removed) {
                return `${prefix}<span style="${diffStyles.value['remove-line']}">- ${escapeHtml(line)}</span>`;
            }
            return `${prefix}  ${escapeHtml(line)}`;
        }).join('\n');

        return result;
    }).join('\n');
}

// 格式化单词对比模式
function formatWordDiff(oldText: string, newText: string): string {
    const diff = diffWords(oldText, newText, { ignoreWhitespace: ignoreWhitespace.value });

    return diff.map(part => {
        if (part.added) {
            return `<span style="${diffStyles.value['add-word']}">${escapeHtml(part.value)}</span>`;
        } else if (part.removed) {
            return `<span style="${diffStyles.value['remove-word']}">${escapeHtml(part.value)}</span>`;
        }
        return escapeHtml(part.value);
    }).join('');
}

// HTML转义函数
function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 清空输入和结果
function clearAll() {
    text1.value = '';
    text2.value = '';
    diffResult.value = '';
}

// 交换两个输入框内容
function swapTexts() {
    [text1.value, text2.value] = [text2.value, text1.value];
}

// 文本内容变化时，自动更新对比结果（增加防抖）
let debounceTimer: number | null = null;
watch([text1, text2, diffType, ignoreWhitespace, showLineNumbers, highlightChanges], () => {
    if (debounceTimer) clearTimeout(debounceTimer);

    // 如果两个文本框都有内容，自动更新对比
    if (text1.value && text2.value) {
        debounceTimer = window.setTimeout(() => {
            compareText();
        }, 500);
    }
}, { deep: true });
const diffTypes = [
    { value: 'patch', label: '基于差异' },
    { value: 'line', label: '按行对比' },
    { value: 'word', label: '按词对比' }
];
</script>

<template>
    <div class="tool-container">
        <div class="tool-header">
            <h2>{{ title }}</h2>
        </div>
        <div class="tool-content">
            <div class="feature-card">
                <div class="options-bar">
                    <div class="diff-options">
                        <label>模式</label>
                        <select class="unified-select">
                            <option v-for="type in diffTypes" :key="type.value" :value="type.value">
                                {{ type.label }}
                            </option>
                        </select>

                        <div class="settings-group">
                            <label>
                                <input type="checkbox" v-model="showLineNumbers">
                                显示行号
                            </label>
                            <label>
                                <input type="checkbox" v-model="ignoreWhitespace">
                                忽略空格
                            </label>
                            <label>
                                <input type="checkbox" v-model="highlightChanges">
                                高亮变化
                            </label>
                        </div>
                    </div>

                </div>

                <div class="compare-container">
                    <div class="text-inputs">
                        <div class="text-input-wrapper">
                            <label>文本 1</label>
                            <textarea v-model="text1" placeholder="在此输入第一段文本..."></textarea>
                        </div>
                        <div class="text-input-wrapper">
                            <label>文本 2</label>
                            <textarea v-model="text2" placeholder="在此输入第二段文本..."></textarea>
                        </div>
                    </div>

                    <div class="compare-button-container">
                        <div class="button-group">
                        <button class="encode-btn" @click="compareText" :disabled="isLoading">
                            <span v-if="isLoading">对比中...</span>
                            <span v-else>对比文本</span>
                        </button>
                        <button class="decode-btn" @click="swapTexts" title="交换文本">
                            <span>⇌</span>
                        </button>
                        <button class="clear-btn" @click="clearAll" title="清空">
                            <span>清空</span>
                        </button>
                    </div>
                </div>
                    <div v-if="diffResult" class="diff-result-container">
                        <h3>对比结果</h3>
                        <div class="diff-legend" v-if="highlightChanges">
                            <span class="legend-item">
                                <span class="legend-color" style="background-color: #e6ffed;"></span>
                                <span>添加</span>
                            </span>
                            <span class="legend-item">
                                <span class="legend-color" style="background-color: #ffeef0;"></span>
                                <span>删除</span>
                            </span>
                        </div>
                        <pre class="diff-result" v-html="diffResult"></pre>
                    </div>

                    <div v-else-if="text1 || text2" class="empty-diff-message">
                        <p>请输入文本并点击"对比文本"按钮查看对比结果</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.compare-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.options-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.diff-options {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
}

.tool-buttons {
    display: flex;
    gap: 0.5rem;
}

.text-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.text-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.text-input-wrapper label {
    font-weight: 600;
    color: var(--text-color-secondary, #666);
}

textarea {
    min-height: 250px;
    padding: 0.75rem;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 6px;
    resize: vertical;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-color, #333);
    background-color: var(--bg-color, #fff);
    transition: border-color 0.2s;
}

textarea:focus {
    outline: none;
    border-color: var(--primary-color, #1890ff);
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.compare-button-container {
    display: flex;
    justify-content: center;
}

.diff-result-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.diff-legend {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.9rem;
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.diff-result {
    background: var(--code-bg, #f8f9fa);
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
    border: 1px solid var(--border-color, #ddd);
}

.empty-diff-message {
    text-align: center;
    color: var(--text-color-secondary, #666);
    padding: 1rem;
}

.line-number {
    color: #8c8c8c;
    padding-right: 1rem;
    user-select: none;
}
.encryption-settings,
.key-settings,
.data-format-settings {
    margin-bottom: 1.5rem;
}

.setting-group {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    gap: 1rem;
}

.setting-group label {
    min-width: 80px;
}

select,
input {
    padding: 0.5rem;
    border: 1px solid var(--card-border);
    border-radius: 4px;
    background: var(--card-bg);
    color: var(--text-color);
}

select {
    min-width: 120px;
}

input {
    flex: 1;
}
</style>