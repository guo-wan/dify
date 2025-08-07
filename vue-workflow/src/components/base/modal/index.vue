<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center"
        @click="handleBackdropClick"
      >
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/50" />

        <!-- 模态框内容 -->
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition-all duration-300"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0"
        >
          <div
            v-if="visible"
            :class="[
              'relative bg-white rounded-lg shadow-xl max-h-[90vh] overflow-auto',
              sizeClass,
              className
            ]"
            @click.stop
          >
            <!-- 头部 -->
            <div v-if="title || $slots.header" class="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <slot name="header">
                  <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
                </slot>
              </div>
              <button
                v-if="closable"
                class="p-1 hover:bg-gray-100 rounded"
                @click="close"
              >
                <Icon icon="ri:close-line" class="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <!-- 内容 -->
            <div class="p-6">
              <slot />
            </div>

            <!-- 底部 -->
            <div v-if="$slots.footer" class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface ModalProps {
  visible?: boolean
  title?: string
  size?: ModalSize
  closable?: boolean
  closeOnClickBackdrop?: boolean
  className?: string
}

const props = withDefaults(defineProps<ModalProps>(), {
  visible: false,
  size: 'md',
  closable: true,
  closeOnClickBackdrop: true
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  close: []
}>()

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-full max-w-md'
    case 'lg':
      return 'w-full max-w-2xl'
    case 'xl':
      return 'w-full max-w-4xl'
    case 'md':
    default:
      return 'w-full max-w-lg'
  }
})

const close = () => {
  emit('update:visible', false)
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnClickBackdrop) {
    close()
  }
}

// 防止背景滚动
watch(() => props.visible, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>
