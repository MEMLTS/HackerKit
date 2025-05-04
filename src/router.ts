import { createRouter, createWebHistory } from 'vue-router';
import Tool1 from './components/Tool1.vue';
import Tool2 from './components/Tool2.vue';
import Welcome from './components/Welcome.vue';
import SystemInfo from './components/systemInfo.vue';
import EncoderDecoder from './components/EncoderDecoder.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome
    },
    {
      path: '/tool1',
      name: 'Tool1',
      component: Tool1
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
    }
  ]
});

export default router;