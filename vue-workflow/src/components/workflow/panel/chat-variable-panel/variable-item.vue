<template>
  <div class="group border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
    <!-- 变量名和类型 -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center">
        <div class="flex items-center">
          <Icon
            :icon="getTypeIcon(variable.value_type)"
            :class="['h-4 w-4 mr-2', getTypeColor(variable.value_type)]"
          />
          <span class="font-medium text-gray-900">{{ variable.name }}</span>
        </div>
        <span
          :class="[
            'ml-2 px-2 py-0.5 text-xs rounded-full',
            getTypeBadgeClass(variable.value_type)
          ]"
        >
          {{ getTypeLabel(variable.value_type) }}
        </span>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          class="p-1 hover:bg-gray-100 rounded"
          @click="$emit('edit', variable)"
          title="编辑"
        >
          <Icon icon="ri:edit-line" class="h-3.5 w-3.5 text-gray-500" />
        </button>
        <button
          class="p-1 hover:bg-red-100 rounded"
          @click="$emit('delete', variable)"
          title="删除"
        >
          <Icon icon="ri:delete-bin-line" class="h-3.5 w-3.5 text-red-500" />
        </button>
      </div>
    </div>

    <!-- 默认值显示 -->
    <div class="mb-2">
      <div class="text-sm text-gray-600">
        <span class="text-gray-500">默认值: </span>
        <span class="font-mono bg-gray-50 rounded px-2 py-1">
          {{ formatDefaultValue(variable.default, variable.value_type) }}
        </span>
      </div>
    </div>

    <!-- 选项（如果是select类型） -->
    <div v-if="variable.value_type === 'select' && variable.options" class="mb-2">
      <div class="text-xs text-gray-500 mb-1">可选值:</div>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="option in variable.options"
          :key="option"
          class="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded"
        >
          {{ option }}
        </span>
      </div>
    </div>

    <!-- 描述 -->
    <div v-if="variable.description" class="text-xs text-gray-500">
      {{ variable.description }}
    </div>

    <!-- 变量引用示例 -->
    <div class="mt-2 pt-2 border-t border-gray-100">
      <div class="text-xs text-gray-500 mb-1">引用方式:</div>
      <code class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
        <!-- {{ `{{conversation.${variable.name}}}` }} -->
        {{ '{' + '{conversation.' + variable.name + '}' + '}' }}
      </code>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ConversationVariable {
  id: string
  name: string
  value_type: 'string' | 'number' | 'select' | 'array'
  description?: string
  default?: any
  options?: string[]
}

interface Props {
  variable: ConversationVariable
}

defineProps<Props>()

defineEmits<{
  edit: [variable: ConversationVariable]
  delete: [variable: ConversationVariable]
}>()

const getTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'string': 'ri:text',
    'number': 'ri:hashtag',
    'select': 'ri:list-check',
    'array': 'ri:list-unordered'
  }
  return iconMap[type] || 'ri:text'
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'string': 'text-blue-600',
    'number': 'text-green-600',
    'select': 'text-purple-600',
    'array': 'text-orange-600'
  }
  return colorMap[type] || 'text-gray-600'
}

const getTypeBadgeClass = (type: string) => {
  const classMap: Record<string, string> = {
    'string': 'bg-blue-100 text-blue-800',
    'number': 'bg-green-100 text-green-800',
    'select': 'bg-purple-100 text-purple-800',
    'array': 'bg-orange-100 text-orange-800'
  }
  return classMap[type] || 'bg-gray-100 text-gray-800'
}

const getTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    'string': '字符串',
    'number': '数字',
    'select': '选择',
    'array': '数组'
  }
  return labelMap[type] || type
}

const formatDefaultValue = (value: any, type: string) => {
  if (value === undefined || value === null) {
    return '无'
  }

  if (type === 'array') {
    return Array.isArray(value) ? `[${value.join(', ')}]` : '[]'
  }

  if (type === 'string') {
    return value ? `"${value}"` : '""'
  }

  return String(value)
}
</script>
