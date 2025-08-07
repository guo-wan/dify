<template>
  <div class="group border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
    <!-- 变量名和类型 -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center">
        <div class="flex items-center">
          <Icon
            :icon="env.value_type === 'secret' ? 'ri:key-line' : 'ri:text'"
            :class="[
              'h-4 w-4 mr-2',
              env.value_type === 'secret' ? 'text-yellow-600' : 'text-blue-600'
            ]"
          />
          <span class="font-medium text-gray-900">{{ env.name }}</span>
        </div>
        <span
          :class="[
            'ml-2 px-2 py-0.5 text-xs rounded-full',
            env.value_type === 'secret'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          ]"
        >
          {{ env.value_type === 'secret' ? '密钥' : '文本' }}
        </span>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          class="p-1 hover:bg-gray-100 rounded"
          @click="$emit('edit', env)"
          title="编辑"
        >
          <Icon icon="ri:edit-line" class="h-3.5 w-3.5 text-gray-500" />
        </button>
        <button
          class="p-1 hover:bg-red-100 rounded"
          @click="$emit('delete', env)"
          title="删除"
        >
          <Icon icon="ri:delete-bin-line" class="h-3.5 w-3.5 text-red-500" />
        </button>
      </div>
    </div>

    <!-- 变量值 -->
    <div class="mb-2">
      <div class="text-sm text-gray-600 font-mono bg-gray-50 rounded px-2 py-1 break-all">
        {{ displayValue }}
      </div>
    </div>

    <!-- 描述 -->
    <div v-if="env.description" class="text-xs text-gray-500">
      {{ env.description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface EnvironmentVariable {
  id: string
  name: string
  value: string
  value_type: 'text' | 'secret'
  description?: string
}

interface Props {
  env: EnvironmentVariable
}

const props = defineProps<Props>()

defineEmits<{
  edit: [env: EnvironmentVariable]
  delete: [env: EnvironmentVariable]
}>()

const displayValue = computed(() => {
  if (props.env.value_type === 'secret') {
    return props.env.value === '[__HIDDEN__]'
      ? '••••••••••••••••••••'
      : props.env.value
  }
  return props.env.value
})
</script>
