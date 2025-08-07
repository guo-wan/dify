<template>
  <div :class="['relative', wrapperClassName]">
    <div class="relative flex items-center">
      <!-- 左侧图标 -->
      <Icon
        v-if="showLeftIcon"
        icon="ri:search-line"
        class="absolute left-3 h-4 w-4 text-gray-400 z-10"
      />

      <!-- 输入框 -->
      <input
        :class="inputClass"
        :style="styleCss"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        v-bind="$attrs"
        @input="handleInput"
      />

      <!-- 单位 -->
      <span v-if="unit" class="absolute right-3 text-gray-500 text-sm">{{ unit }}</span>

      <!-- 清除图标 -->
      <button
        v-if="showClearIcon && modelValue"
        class="absolute right-3 z-10 p-0.5 hover:bg-gray-100 rounded"
        @click="handleClear"
      >
        <Icon icon="ri:close-circle-fill" class="h-4 w-4 text-gray-400" />
      </button>
    </div>

    <!-- 错误状态图标 -->
    <Icon
      v-if="destructive"
      icon="ri:error-warning-line"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import classNames from '@/utils/classnames'

type InputSize = 'regular' | 'large'

interface InputProps {
  modelValue?: string | number
  size?: InputSize
  showLeftIcon?: boolean
  showClearIcon?: boolean
  disabled?: boolean
  destructive?: boolean
  wrapperClassName?: string
  styleCss?: CSSProperties
  unit?: string
  placeholder?: string
}

const props = withDefaults(defineProps<InputProps>(), {
  size: 'regular',
  showLeftIcon: false,
  showClearIcon: false,
  disabled: false,
  destructive: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  clear: []
}>()

const inputClass = computed(() => {
  const baseClass = 'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors'
  const sizeClass = props.size === 'large' ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm'
  const leftPaddingClass = props.showLeftIcon ? 'pl-10' : ''
  const rightPaddingClass = (props.showClearIcon || props.unit) ? 'pr-10' : ''
  const disabledClass = props.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
  const destructiveClass = props.destructive ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''

  return classNames(
    baseClass,
    sizeClass,
    leftPaddingClass,
    rightPaddingClass,
    disabledClass,
    destructiveClass
  )
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>
