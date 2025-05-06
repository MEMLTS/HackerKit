<script setup lang="ts">
import { computed } from 'vue';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '请输入JSON数据...'
  }
});

const emit = defineEmits(['update:modelValue']);

const inputText = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const formattedJson = computed(() => {
  try {
    return JSON.stringify(JSON.parse(inputText.value), null, 2);
  } catch {
    return inputText.value;
  }
});

const highlightJson = (json: string) => {
  try {
    if (!Prism.languages.json) {
      throw new Error('JSON语法未加载');
    }
    return Prism.highlight(json, Prism.languages.json, 'json');
  } catch (error) {
    console.error('语法高亮错误:', error);
    return json;
  }
};
</script>

<template>
  <div>
    <div class="json-textarea-container">
      <pre v-if="readonly" class="json-viewer" v-html="highlightJson(formattedJson)"></pre>
      <textarea v-else v-model="inputText" :placeholder="placeholder" class="json-input" spellcheck="false"></textarea>
    </div>
  </div>
</template>

<style scoped>
.json-textarea-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.json-viewer,
.json-input {
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--input-bg);
  color: var(--text-color, #444444);
  font-family: 'AlimamaFangYuanTiVF-Thin', monospace;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.json-viewer {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.json-input:focus {
  outline: none;
  border-color: #646cff;
  box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.2);
}

.json-input::placeholder {
  color: var(--placeholder-color, #666);
}
</style>