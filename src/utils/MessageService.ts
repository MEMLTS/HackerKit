// MessageService.ts
import { createApp } from 'vue';
import AutoCloseModal from '../view/AutoCloseModal.vue';

interface MessageOptions {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  showIcon?: boolean;
  showClose?: boolean;
  showProgress?: boolean;
}

/**
 * 显示消息提示
 */
function showMessage(message: string, options: Omit<MessageOptions, 'message'> = {}): void {
  // 默认配置
  const defaultOptions: MessageOptions = {
    message,
    type: 'info',
    duration: 3,
    position: 'top-right',
    showIcon: true,
    showClose: true,
    showProgress: true
  };

  // 合并选项
  const mergedOptions = { ...defaultOptions, ...options };

  // 创建挂载节点
  const mountNode = document.createElement('div');
  document.body.appendChild(mountNode);

  // 确保DOM元素已添加到文档中
  requestAnimationFrame(() => {
    // 创建和挂载组件
    const app = createApp(AutoCloseModal, {
      ...mergedOptions,
      onClose: () => {
        setTimeout(() => {
          app.unmount();
          // 确保节点存在再移除
          if (document.body.contains(mountNode)) {
            document.body.removeChild(mountNode);
          }
        }, 300); // 等待动画完成
      }
    });

    // 添加样式确保正确显示
    mountNode.style.position = 'fixed';
    mountNode.style.zIndex = '999999';
    mountNode.style.top = '0';
    mountNode.style.left = '0';
    mountNode.style.width = '100%';
    mountNode.style.height = '100%';
    mountNode.style.pointerEvents = 'none';

    // 捕获可能的错误
    try {
      app.mount(mountNode);
      console.log('Message modal mounted:', message); // 调试日志
    } catch (err) {
      console.error('Failed to mount message modal:', err);
      // 清理失败的挂载
      if (document.body.contains(mountNode)) {
        document.body.removeChild(mountNode);
      }
    }
  });
}

// 添加便捷方法
showMessage.info = (message: string, options: Omit<MessageOptions, 'message' | 'type'> = {}) =>
  showMessage(message, { ...options, type: 'info' });

showMessage.success = (message: string, options: Omit<MessageOptions, 'message' | 'type'> = {}) =>
  showMessage(message, { ...options, type: 'success' });

showMessage.warning = (message: string, options: Omit<MessageOptions, 'message' | 'type'> = {}) =>
  showMessage(message, { ...options, type: 'warning' });

showMessage.error = (message: string, options: Omit<MessageOptions, 'message' | 'type'> = {}) =>
  showMessage(message, { ...options, type: 'error' });

export default showMessage;
