import { createRouter, createWebHistory } from 'vue-router';
import Hash from './components/hash.vue';
import SymmetricEncryption from './components/SymmetricEncryption.vue';
import Welcome from './components/Welcome.vue';
import SystemInfo from './components/systemInfo.vue';
import EncoderDecoder from './components/EncoderDecoder.vue';
import About from './components/about.vue';
import textCompare from './components/textCompare.vue';
import Gzip from './components/gzip.vue';
import Jwt from './components/jwt.vue';
import Whois from './components/whois.vue';
import WebSocket from './components/WebSocket.vue';
import Protobuf from './components/Protobuf.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Welcome', component: Welcome },
    { path: '/hash', name: 'Hash', component: Hash },
    { path: '/symmetricEncryption', name: 'SymmetricEncryption', component: SymmetricEncryption },
    { path: '/encoder-decoder', name: 'EncoderDecoder', component: EncoderDecoder },
    { path: '/text-compare', name: 'textCompare', component: textCompare },
    { path: '/gzip', name: 'GZIP', component: Gzip },
    { path: '/jwt', name: 'JWT', component: Jwt },
    { path: '/protobuf', name: 'Protobuf', component: Protobuf },
    { path: '/whois', name: 'Whois', component: Whois },
    { path: '/webSocket', name: 'WebSocket', component: WebSocket },
    { path: '/system-info', name: 'SystemInfo', component: SystemInfo },
    { path: '/about', name: '关于', component: About }
  ]
});

export default router;