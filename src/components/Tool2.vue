<script setup lang="ts">
import { ref } from 'vue';

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
.tool-container {
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 6px var(--card-border);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tool-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--card-border);
}

.tool-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color);
}

.tool-content {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.feature-card {
  background: var(--card-bg);
  border-radius: 6px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid var(--card-border);
}

.feature-card h3 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.card-content {
  color: var(--text-color);
}
</style>