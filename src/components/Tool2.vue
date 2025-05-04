<script setup lang="ts">
import { ref } from 'vue';
import '@assets/styles/tool.css';

const title = ref('工具2');
</script>

<template>
  <div class="tool-container">
    <div class="tool-header">
      <h2>{{ title }}</h2>
    </div>
    <div class="tool-content">
      <!-- 工具2的具体功能内容 -->
      <div class="feature-card">
        <h3>功能区域</h3>
        <div class="card-content">
          <p>这里是工具2的主要功能区域</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>