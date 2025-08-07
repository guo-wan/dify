<template>
  <div class="relative" :class="wrapperClassName">
    <select
      :class="selectClass"
      :value="modelValue"
      :disabled="disabled"
      @change="handleChange"
      v-bind="$attrs"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <slot />
    </select>
    <Icon
      icon="ri:arrow-down-s-line"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import classNames from '@/utils/classnames'

type SelectSize = 'regular' | 'large'

interface SelectProps {
  modelValue?: string | number
  size?: SelectSize
  disabled?: boolean
  destructive?: boolean
  wrapperClassName?: string
  placeholder?: string
}

const props = withDefaults(defineProps<SelectProps>(), {
  size: 'regular',
  disabled: false,
  destructive: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const selectClass = computed(() => {
  const baseClass = 'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none bg-white pr-10'
  const sizeClass = props.size === 'large' ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm'
  const disabledClass = props.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
  const destructiveClass = props.destructive ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''

  return classNames(
    baseClass,
    sizeClass,
    disabledClass,
    destructiveClass
  )
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
  emit('change', target.value)
}
</script>
