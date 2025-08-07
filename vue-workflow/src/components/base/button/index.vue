<template>
  <button
    :type="type"
    :class="buttonClass"
    :style="styleCss"
    :disabled="disabled"
    v-bind="$attrs"
    @click="handleClick"
  >
    <slot />
    <Spinner
      v-if="loading"
      :loading="loading"
      :class-name="spinnerClassName || '!text-white !h-3 !w-3 !border-2 !ml-1'"
    />
  </button>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import classNames from '@/utils/classnames'
import Spinner from '../spinner/index.vue'
import './button.css'

type ButtonVariant = 'primary' | 'warning' | 'secondary' | 'secondary-accent' | 'ghost' | 'ghost-accent' | 'tertiary'
type ButtonSize = 'small' | 'medium' | 'large'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  destructive?: boolean
  loading?: boolean
  styleCss?: CSSProperties
  spinnerClassName?: string
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'secondary',
  size: 'medium',
  destructive: false,
  loading: false,
  type: 'button',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClass = computed(() => {
  const baseClass = 'btn'
  const variantClass = `btn-${props.variant}`
  const sizeClass = `btn-${props.size}`

  return classNames(
    baseClass,
    variantClass,
    sizeClass,
    props.destructive && 'btn-destructive',
    (props.disabled || props.loading) && 'btn-disabled',
    props.className
  )
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
