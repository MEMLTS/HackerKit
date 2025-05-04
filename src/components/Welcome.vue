<script setup lang="ts">
</script>

<template>
  <div class="welcome-container">
    <div class="welcome-content">
      <h1>欢迎使用 HackerKit</h1>
      <p class="subtitle">您的一站式工具箱解决方案</p>
      <div class="features">
        <div class="feature-card">
          <span class="feature-icon">🛠️</span>
          <h3>多样化工具</h3>
          <p>集成多种实用工具，满足您的各种需求</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">⚡</span>
          <h3>高效便捷</h3>
          <p>简单直观的界面，快速访问所有功能</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🔄</span>
          <h3>持续更新</h3>
          <p>定期添加新功能，持续优化用户体验</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--card-bg) 0%, var(--sidebar-bg) 100%);
  border-radius: 12px;
}

.welcome-content {
  text-align: center;
  max-width: 800px;
}

h1 {
  font-size: 2.5rem;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--text-color);
  margin-bottom: 3rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px var(--card-border);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: inline-block;
}

.feature-card h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #666;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
  }
  
  .welcome-container {
    padding: 1rem;
  }
  
  h1 {
    font-size: 2rem;
  }
}
</style>