<script setup lang="ts">
import { ref } from 'vue';
import '@assets/styles/tool.css';
import { invoke } from '@tauri-apps/api/core';

const title = ref('关于');

async function openDevTools() {
  await invoke('open_devtools');
}
</script>

<template>
  <div class="tool-container">
    <div class="tool-header">
      <h2>{{ title }}</h2>
    </div>
    <div class="tool-content">
      <!-- 工具2的具体功能内容 -->
      <div class="feature-card">
        <h3>???</h3>
        <div class="card-content">
          <p>没写没写</p>
          <button @click="openDevTools">打开开发者工具</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>