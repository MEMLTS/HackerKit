<script setup lang="ts">
</script>

<template>
  <div class="welcome-container">
    <div class="welcome-content">
      <h1>欢迎使用 HackerKit</h1>
      <p class="subtitle">您的一站式工具箱解决方案</p>
      <div class="features">
        <!-- 功能卡片 -->
        <div class="feature-card">
          <span class="feature-icon">🛠️</span>
          <h3>多样化工具</h3>
          <p>我们提供多种实用的工具，包括编码解码、图像处理等，助力您的工作和学习。</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">⚡</span>
          <h3>高效便捷</h3>
          <p>简洁直观的界面，帮助您快速访问和使用所有功能，极大提高工作效率。</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🔄</span>
          <h3>持续更新</h3>
          <p>我们会定期为工具添加新功能，不断优化和改善用户体验，让您的工具箱始终保持最新状态。</p>
        </div>
        <!-- 添加更多功能卡片 -->
        <div class="feature-card">
          <span class="feature-icon">🧰</span>
          <h3>全面工具</h3>
          <p>提供从开发到设计的一整套工具，帮助你在工作中更加得心应手。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 主标题 */
h1 {
  font-size: 3rem;
  color: var(--text-color);
  font-weight: 600;
  margin-bottom: 1rem;
  letter-spacing: 2px;
  line-height: 1.3;
}

/* 副标题 */
.subtitle {
  font-size: 1.4rem;
  color: #34495e;
  margin-bottom: 2rem;
  font-weight: 400;
  line-height: 1.6;
}

/* 特性展示部分 */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  /* 自动适应列数，最小宽度为 280px */
  gap: 2rem;
  margin-top: 2rem;
  width: 100%;
  /* 确保不超出屏幕 */
  padding: 0 2rem;
  box-sizing: border-box;
}

/* 每个功能卡片 */
.feature-card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  line-height: 1.5;
  height: 100%;
  /* 确保卡片高度自适应 */
  box-sizing: border-box;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  /* 图标颜色 */
  transition: color 0.3s ease;
}

.feature-card:hover .feature-icon {
  color: var(--primary-hover-color);
  /* 悬停时改变颜色 */
}

/* 标题样式 */
.feature-card h3 {
  font-size: 1.6rem;
  color: var(--text-color);
  font-weight: 600;
  margin-bottom: 1rem;
}

/* 描述样式 */
.feature-card p {
  font-size: 1rem;
  color: var(--text-secondary-color);
  line-height: 1.6;
  text-align: center;
  margin-bottom: 0;
}

/* 媒体查询 - 小屏幕优化 */
@media (max-width: 768px) {
  .welcome-container {
    padding: 1rem;
  }

  .features {
    grid-template-columns: 1fr;
    /* 使每个卡片占一整行 */
    gap: 1.5rem;
  }

  h1 {
    font-size: 2.2rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }
}
</style>
