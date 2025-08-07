<template>
  <div class="thought-container my-2 space-y-2">
    <!-- 思考过程标题 -->
    <div v-if="showTitle" class="flex items-center text-sm text-gray-600 mb-2">
      <Icon icon="ri:brain-line" class="h-4 w-4 mr-1" />
      <span class="font-medium">思考过程</span>
      <div v-if="!isFinished" class="ml-2">
        <Icon icon="ri:loader-4-line" class="h-3 w-3 animate-spin" />
      </div>
    </div>

    <!-- 工具思考列表 -->
    <div v-if="toolThoughtList.length" class="space-y-2">
      <ToolDetail
        v-for="(item, index) in toolThoughtList"
        :key="index"
        :payload="item"
      />
    </div>

    <!-- 纯文本思考 -->
    <div v-else-if="thought.thought" class="thought-text p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-start">
        <Icon icon="ri:lightbulb-line" class="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
        <div class="flex-1">
          <div class="text-sm text-blue-800 font-medium mb-1">思考:</div>
          <div class="text-sm text-blue-700 whitespace-pre-wrap">{{ thought.thought }}</div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="thought-empty text-center py-4 text-gray-500">
      <Icon icon="ri:brain-line" class="h-6 w-6 mx-auto mb-1 text-gray-300" />
      <div class="text-sm">暂无思考过程</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ToolDetail from './tool-detail.vue'

export interface ThoughtItem {
  id?: string
  thought?: string
  tool?: string
  tool_input?: string
  tool_labels?: {
    toolName?: {
      language?: string
    }
  }
  observation?: string
  position?: number
}

export interface ToolInfoInThought {
  name: string
  label: string
  input: string
  output: string
  isFinished: boolean
}

interface Props {
  thought: ThoughtItem
  isFinished: boolean
  showTitle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTitle: true
})

// 计算属性
const toolThoughtList = computed<ToolInfoInThought[]>(() => {
  if (!props.thought.tool) return []

  const [toolNames, isValueArray] = parseToolNames(props.thought.tool)

  return toolNames.map((toolName, index) => ({
    name: toolName,
    label: props.thought.tool_labels?.toolName?.language ?? toolName,
    input: getValue(props.thought.tool_input || '', isValueArray, index),
    output: getValue(props.thought.observation || '', isValueArray, index),
    isFinished: props.isFinished,
  }))
})

// 方法
const parseToolNames = (tool: string): [string[], boolean] => {
  try {
    const parsed = JSON.parse(tool)
    if (Array.isArray(parsed)) {
      return [parsed, true]
    }
  } catch {
    // 解析失败，当作单个工具名处理
  }
  return [[tool], false]
}

const getValue = (value: string, isValueArray: boolean, index: number): string => {
  if (isValueArray) {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? (parsed[index] || '') : value
    } catch {
      return value
    }
  }
  return value
}
</script>

<style scoped>
.thought-container {
  /* 思考容器样式 */
}

.thought-text {
  /* 文本思考样式 */
}

.thought-empty {
  /* 空状态样式 */
}
</style>
