import { createApp, type App } from 'vue'
import ToastComponent, { type ToastProps } from './index.vue'

export interface ToastHandle {
  clear?: () => void
}

class ToastManager {
  private instances: Set<App> = new Set()

  notify(options: ToastProps): ToastHandle {
    const handle: ToastHandle = {}

    if (typeof window === 'object') {
      const container = document.createElement('div')
      const app = createApp(ToastComponent, {
        ...options,
        onClose: () => {
          app.unmount()
          container.remove()
          this.instances.delete(app)
          options.onClose?.()
        }
      })

      this.instances.add(app)
      app.mount(container)
      document.body.appendChild(container)

      handle.clear = () => {
        app.unmount()
        container.remove()
        this.instances.delete(app)
      }
    }

    return handle
  }

  clear() {
    this.instances.forEach(app => {
      app.unmount()
    })
    this.instances.clear()
  }
}

const toastManager = new ToastManager()

export const useToast = () => {
  return {
    success: (message: string, options?: Partial<ToastProps>) =>
      toastManager.notify({ ...options, type: 'success', message }),

    error: (message: string, options?: Partial<ToastProps>) =>
      toastManager.notify({ ...options, type: 'error', message }),

    warning: (message: string, options?: Partial<ToastProps>) =>
      toastManager.notify({ ...options, type: 'warning', message }),

    info: (message: string, options?: Partial<ToastProps>) =>
      toastManager.notify({ ...options, type: 'info', message }),

    notify: (options: ToastProps) => toastManager.notify(options),

    clear: () => toastManager.clear()
  }
}

// 全局静态方法
export const Toast = {
  success: (message: string, options?: Partial<ToastProps>) =>
    toastManager.notify({ ...options, type: 'success', message }),

  error: (message: string, options?: Partial<ToastProps>) =>
    toastManager.notify({ ...options, type: 'error', message }),

  warning: (message: string, options?: Partial<ToastProps>) =>
    toastManager.notify({ ...options, type: 'warning', message }),

  info: (message: string, options?: Partial<ToastProps>) =>
    toastManager.notify({ ...options, type: 'info', message }),

  notify: (options: ToastProps) => toastManager.notify(options),

  clear: () => toastManager.clear()
}

export default Toast
