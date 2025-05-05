import { createRouter, createWebHistory } from 'vue-router';
import Hash from './components/hash.vue';
import Tool2 from './components/Tool2.vue';
import Welcome from './components/Welcome.vue';
import SystemInfo from './components/systemInfo.vue';
import EncoderDecoder from './components/EncoderDecoder.vue';
import About from './components/about.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome
    },
    {
      path: '/hash',
      name: 'Hash',
      component: Hash
    },
    {
      path: '/tool2',
      name: 'Tool2',
      component: Tool2
    },
    {
      path: '/encoder-decoder',
      name: 'EncoderDecoder',
      component: EncoderDecoder
    },
    {
      path: '/system-info',
      name: 'SystemInfo',
      component: SystemInfo
    },
    {
      path: '/about',
      name: '关于',
      component: About
    }
  ]
});

export default router;