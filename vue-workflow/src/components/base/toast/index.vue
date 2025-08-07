<template>
  <Teleport to="body">
    <div
      v-if="visible"
      :class="[
        'fixed z-[9999] mx-8 my-4 w-[360px] grow overflow-hidden rounded-xl',
        size === 'md' ? 'p-3' : 'p-2',
        'border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm',
        'top-0 right-0',
        className
      ]"
    >
      <div :class="[
        'absolute inset-0 -z-10 opacity-40',
        backgroundClass
      ]" />

      <div :class="['flex', size === 'md' ? 'gap-1' : 'gap-0.5']">
        <!-- 图标 -->
        <div :class="['flex items-center justify-center', size === 'md' ? 'p-0.5' : 'p-1']">
          <Icon
            v-if="type === 'success'"
            icon="ri:checkbox-circle-fill"
            :class="[size === 'md' ? 'h-5 w-5' : 'h-4 w-4', 'text-green-500']"
          />
          <Icon
            v-else-if="type === 'error'"
            icon="ri:error-warning-fill"
            :class="[size === 'md' ? 'h-5 w-5' : 'h-4 w-4', 'text-red-500']"
          />
          <Icon
            v-else-if="type === 'warning'"
            icon="ri:alert-fill"
            :class="[size === 'md' ? 'h-5 w-5' : 'h-4 w-4', 'text-yellow-500']"
          />
          <Icon
            v-else
            icon="ri:information-2-fill"
            :class="[size === 'md' ? 'h-5 w-5' : 'h-4 w-4', 'text-blue-500']"
          />
        </div>

        <!-- 内容 -->
        <div :class="[
          'flex py-1 grow flex-col items-start gap-1',
          size === 'md' ? 'px-1' : 'px-0.5'
        ]">
          <div class="flex items-center gap-1">
            <div class="text-sm font-semibold text-gray-900 [word-break:break-word]">
              {{ message }}
            </div>
            <slot name="custom" />
          </div>
          <div v-if="$slots.default" class="text-xs text-gray-600">
            <slot />
          </div>
        </div>

        <!-- 关闭按钮 -->
        <button
          v-if="showClose"
          class="z-[1000] p-1 hover:bg-gray-100 rounded"
          @click="close"
        >
          <Icon icon="ri:close-line" class="h-4 w-4 shrink-0 text-gray-500" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

export interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  size?: 'md' | 'sm'
  duration?: number
  message: string
  className?: string
  showClose?: boolean
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  size: 'md',
  duration: 3000,
  showClose: true
})

const emit = defineEmits<{
  close: []
}>()

const visible = ref(true)

const backgroundClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-50'
    case 'error':
      return 'bg-red-50'
    case 'warning':
      return 'bg-yellow-50'
    case 'info':
    default:
      return 'bg-blue-50'
  }
})

const close = () => {
  visible.value = false
  emit('close')
}

onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>
