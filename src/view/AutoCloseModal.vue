<template>
  <transition name="modal-fade">
    <div v-if="visible" class="auto-close-modal" :class="[type]">
      <div class="modal-content">
        <div class="modal-icon" v-if="showIcon">
          <!-- SVG Icons based on the notification type -->
          <svg v-if="type === 'info'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12" y2="16" />
          </svg>
          <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
          <svg v-if="type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 22h20L12 2zm0 15h0" />
          </svg>
          <svg v-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M12 6h0" />
          </svg>
        </div>
        <div class="modal-body">
          {{ message }}
        </div>
        <div class="modal-close" v-if="showClose" @click="handleClose">
          <span>&times;</span>
        </div>
      </div>
      <div class="modal-progress" v-if="showProgress">
        <div class="progress-bar" :style="progressStyle"></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 3
  },
  type: {
    type: String,
    default: 'info',
    validator: (value: string) => {
      return ['info', 'success', 'warning', 'error'].includes(value);
    }
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  position: {
    type: String,
    default: 'top-center', // Default position is top-center
    validator: (value: string) => {
      return ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'].includes(value);
    }
  }
});

const emit = defineEmits(['close']);
const visible = ref(true);
const timeLeft = ref(props.duration);
let timer: number | null = null;
let progressTimer: number | null = null;

const progressStyle = computed(() => {
  const progress = (timeLeft.value / props.duration) * 100;
  return {
    width: `${progress}%`,
  };
});

const handleClose = () => {
  visible.value = false;
  setTimeout(() => {
    emit('close');
  }, 300); // Wait for the fade-out animation to complete

  if (timer) {
    clearTimeout(timer);
    timer = null;
  }

  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
};

onMounted(() => {
  // Set the auto-close timer
  timer = window.setTimeout(() => {
    handleClose();
  }, props.duration * 1000);

  // Set the progress bar update timer
  if (props.showProgress) {
    const updateInterval = 50; // Update every 50ms
    progressTimer = window.setInterval(() => {
      timeLeft.value -= updateInterval / 1000;
      if (timeLeft.value <= 0) {
        clearInterval(progressTimer as number);
      }
    }, updateInterval);
  }
});

onBeforeUnmount(() => {
  // Clean up all timers
  if (timer) clearTimeout(timer);
  if (progressTimer) clearInterval(progressTimer);
});
</script>

<style scoped>
.auto-close-modal {
  position: fixed;
  z-index: 9999;
  min-width: 250px;
  padding: 15px;
  border-radius: 6px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 10px;
  pointer-events: auto;
  display: block;
  opacity: 0.7;
  transform: none;
  /* Position the modal at the top-center of the page */
  top: 3%;
  left: 50%;
  transform: translateX(-50%);
}

/* Icon and modal content */
.modal-content {
  display: flex;
  align-items: center;
}

.modal-icon {
  margin-right: 10px;
  font-size: 20px;
  display: flex;
  align-items: center;
}

.modal-body {
  flex: 1;
  word-break: break-word;
  font-size: 14px;
}

.modal-close {
  margin-left: 10px;
  cursor: pointer;
  opacity: 0.7;
  font-size: 16px;
  transition: opacity 0.2s;
}

.modal-close:hover {
  opacity: 1;
}

.modal-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 0 0 6px 6px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  transition: width 0.05s linear;
}

/* Type-specific colors */
.info {
  background-color: #1890ff;
}

.success {
  background-color: #52c41a;
}

.warning {
  background-color: #faad14;
}

.error {
  background-color: #f5222d;
}

/* Fade-in/fade-out animation */
.modal-fade-enter-active {
  animation: slideIn 0.3s ease-out;
}

.modal-fade-leave-active {
  animation: fadeOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
