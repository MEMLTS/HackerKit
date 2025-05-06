<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import './assets/styles/theme.css';

// 导入SVG图标
import wrenchIcon from './assets/icons/wrench.svg';
import toolsIcon from './assets/icons/tools.svg';
import systemIcon from './assets/icons/system.svg';
import code from './assets/icons/code.svg';
import aboutIcon from './assets/icons/about.svg';
import sunIcon from './assets/icons/sun.svg';
import moonIcon from './assets/icons/moon.svg';
import moreIcon from './assets/icons/more.svg';
import systemInfoIcon from './assets/icons/systemInfo.svg';
import hashIcon from './assets/icons/hash.svg';
import EncryptionIcon from './assets/icons/encryption.svg';
import txtIcon from './assets/icons/txt.svg';
import gzipIcon from './assets/icons/mm-gzip.svg';
import jwtIcon from './assets/icons/jwt.svg';
import networkIcon from './assets/icons/network.svg';
import whoisIcon from './assets/icons/whois.svg';
import webSocketIcon from './assets/icons/WebSocket.svg';
import protobufIcon from './assets/icons/protobuf.svg';

const router = useRouter();
const isSidebarCollapsed = ref(false);
const isDarkMode = ref(false);
const isManualMode = ref(false);

// 在主题切换时调用
const updateTheme = () => {
  const root = document.documentElement;
  if (isDarkMode.value) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// 监听系统主题变化
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  if (!isManualMode.value) {
    isDarkMode.value = e.matches;
    updateTheme();
  }
};

// 页面加载时初始化主题
onMounted(() => {
  const savedTheme = localStorage.getItem('themePreference');
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark';
    isManualMode.value = true;
  } else {
    isDarkMode.value = mediaQuery.matches;
  }
  updateTheme();
  mediaQuery.addEventListener('change', handleSystemThemeChange);
});

onBeforeUnmount(() => {
  mediaQuery.removeEventListener('change', handleSystemThemeChange);
});

interface Tool {
  name: string;
  icon: string;
  route: string;
}

interface ToolGroup {
  name: string;
  icon: string;
  isCollapsed: boolean;
  tools: Tool[];
}

const toolGroups = ref<ToolGroup[]>([
  {
    name: '常用工具',
    icon: wrenchIcon,
    isCollapsed: true,
    tools: [
      { name: 'Hash工具', icon: hashIcon, route: '/hash' },
      { name: '加密解密', icon: EncryptionIcon, route: '/symmetricEncryption' },
      { name: '编码解码', icon: code, route: '/encoder-decoder' },
      { name: '文本对比', icon: txtIcon, route: '/text-compare' },
      { name: 'Gzip工具', icon: gzipIcon, route: '/gzip' },
      { name: 'JWT解析', icon: jwtIcon, route: '/jwt' },
      { name: 'Protobuf', icon: protobufIcon, route: '/protobuf' },
      //{ name: '时间工具', icon: toolsIcon, route: '/timestamp' }
    ]
  },
  {
    name: '网络工具',
    icon: networkIcon,
    isCollapsed: true,
    tools: [
      { name: 'Whois', icon: whoisIcon, route: '/whois' },
      { name: 'WebSocket', icon: webSocketIcon, route: '/websocket' },
    ]
  },
  {
    name: '系统工具',
    icon: systemIcon,
    isCollapsed: true,
    tools: [
      { name: '工具1', icon: toolsIcon, route: '/hash' }
    ]
  },
  {
    name: '更多',
    icon: moreIcon,
    isCollapsed: true,
    tools: [
      { name: '系统信息', icon: systemInfoIcon, route: '/system-info' },
      { name: '关于', icon: aboutIcon, route: '/about' },
    ]
  }
]);

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  isManualMode.value = true;
  localStorage.setItem('themePreference', isDarkMode.value ? 'dark' : 'light');
  updateTheme();
};

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  // 侧边栏折叠时同步折叠所有分组
  if (isSidebarCollapsed.value) {
    toolGroups.value.forEach(group => group.isCollapsed = true);
  }
};

const toggleGroup = (group: ToolGroup) => {
  group.isCollapsed = !group.isCollapsed;
};
</script>

<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <aside :class="['sidebar', { 'collapsed': isSidebarCollapsed }]">
      <div class="sidebar-header">
        <h1 class="app-title" @click="router.push('/')">HackerKit</h1>
        <button class="collapse-btn" @click="toggleSidebar">
          {{ isSidebarCollapsed ? '→' : '←' }}
        </button>
        <button class="theme-toggle-btn" @click="toggleTheme">
          <img class="tool-icon" :src="isDarkMode ? sunIcon : moonIcon" alt="">
        </button>
      </div>
      <nav class="sidebar-nav">
        <div v-for="group in toolGroups" :key="group.name" class="tool-group">
          <div class="group-header" @click="toggleGroup(group)">
            <img class="tool-icon" :src="group.icon" alt="">
            <span class="group-name" v-show="!isSidebarCollapsed">{{ group.name }}</span>
            <span class="group-toggle" v-show="!isSidebarCollapsed">
              {{ group.isCollapsed ? '▼' : '▲' }}
            </span>
          </div>
          <div class="group-tools" :class="{ 'collapsed': group.isCollapsed }">
            <a v-for="tool in group.tools" :key="tool.route"
              :class="['nav-item', { active: $route.path === tool.route }]" @click="() => { if (router && tool && tool.route) router.push(tool.route) }">
              <img class="tool-icon" :src="tool.icon" alt="">
              <span class="tool-name" v-show="!isSidebarCollapsed">{{ tool.name }}</span>
            </a>
          </div>
        </div>
      </nav>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
@import './assets/styles/global.css';

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    height: 100vh;
    z-index: 1000;
    transform: translateX(0);
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
  }

  .main-content {
    margin-left: 0;
  }
}

.group-header:hover {
  background-color: var(--hover-bg);
}

.group-name {
  flex: 1;
  margin-left: 0.75rem;
  transition: transform 0.3s ease, opacity 0.15s ease;
  transform-origin: left center;
}

.collapsed .group-name {
  transform: translateX(-100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.15s ease;
  position: absolute;
  pointer-events: none;
}

.group-toggle {
  font-size: 0.8rem;
  color: #666;
  transition: transform 0.3s ease, opacity 0.15s ease;
}

.collapsed .group-toggle {
  transform: translateX(-100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.15s ease;
  position: absolute;
  pointer-events: none;
}

.group-header:not(.collapsed) .group-toggle {
  transform: rotate(180deg);
}

.group-tools {
  margin-left: 1rem;
  transition: all 0.3s ease;
  max-height: 0;
  opacity: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.group-tools:not(.collapsed) {
  max-height: 500px;
  opacity: 1;
  margin-left: 1rem;
  padding: 0.5rem 0;
  transform: translateY(0);
}

.group-tools.collapsed {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.nav-item:hover {
  background-color: var(--hover-bg);
}

.nav-item.active {
  background-color: var(--active-bg);
  color: var(--active-color);
}

.tool-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.2rem;
  height: 1.2rem;
  margin-right: 0.75rem;
}

.tool-icon :deep(svg) {
  width: 100%;
  height: 100%;
  stroke: currentColor;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    height: 100vh;
    z-index: 1000;
    transform: translateX(0);
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
