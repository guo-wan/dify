<template>
  <div class="tool-detail bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
    <!-- 工具头部 -->
    <div
      class="tool-header flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors"
      @click="toggleExpanded"
    >
      <div class="flex items-center">
        <!-- 工具图标 -->
        <div class="tool-icon p-2 bg-blue-100 rounded-lg mr-3">
          <Icon :icon="getToolIcon(payload.name)" class="h-4 w-4 text-blue-600" />
        </div>

        <!-- 工具信息 -->
        <div>
          <div class="font-medium text-gray-900">{{ payload.label || payload.name }}</div>
          <div class="text-sm text-gray-500">
            {{ getToolDescription(payload.name) }}
          </div>
        </div>
      </div>

      <!-- 状态和展开按钮 -->
      <div class="flex items-center space-x-2">
        <!-- 执行状态 -->
        <div class="status-indicator">
          <Icon
            v-if="!payload.isFinished"
            icon="ri:loader-4-line"
            class="h-4 w-4 text-blue-500 animate-spin"
          />
          <Icon
            v-else-if="hasError"
            icon="ri:error-warning-line"
            class="h-4 w-4 text-red-500"
          />
          <Icon
            v-else
            icon="ri:check-line"
            class="h-4 w-4 text-green-500"
          />
        </div>

        <!-- 展开/折叠按钮 -->
        <Icon
          :icon="isExpanded ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'"
          class="h-4 w-4 text-gray-500"
        />
      </div>
    </div>

    <!-- 工具详情内容 -->
    <div v-if="isExpanded" class="tool-content border-t border-gray-200 bg-white">
      <!-- 输入参数 -->
      <div v-if="payload.input" class="input-section p-3 border-b border-gray-100">
        <div class="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Icon icon="ri:arrow-right-line" class="h-3 w-3 mr-1" />
          输入参数
        </div>
        <div class="input-content bg-gray-50 rounded p-3">
          <pre class="text-xs text-gray-800 whitespace-pre-wrap font-mono">{{ formatJSON(payload.input) }}</pre>
        </div>
      </div>

      <!-- 输出结果 -->
      <div v-if="payload.output" class="output-section p-3">
        <div class="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Icon icon="ri:arrow-left-line" class="h-3 w-3 mr-1" />
          输出结果
        </div>
        <div class="output-content bg-green-50 rounded p-3">
          <pre class="text-xs text-gray-800 whitespace-pre-wrap font-mono">{{ formatJSON(payload.output) }}</pre>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="hasError" class="error-section p-3 border-t border-red-100 bg-red-50">
        <div class="flex items-center text-sm font-medium text-red-700 mb-2">
          <Icon icon="ri:error-warning-line" class="h-3 w-3 mr-1" />
          执行错误
        </div>
        <div class="error-content text-xs text-red-600">
          {{ getErrorMessage() }}
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!payload.input && !payload.output" class="empty-section p-6 text-center text-gray-500">
        <Icon icon="ri:file-list-line" class="h-6 w-6 mx-auto mb-1 text-gray-300" />
        <div class="text-sm">暂无执行详情</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ToolInfoInThought } from './index.vue'

interface Props {
  payload: ToolInfoInThought
}

const props = defineProps<Props>()

// 响应式状态
const isExpanded = ref(false)

// 计算属性
const hasError = computed(() => {
  if (!props.payload.output) return false

  try {
    const output = JSON.parse(props.payload.output)
    return output.error || output.status === 'error'
  } catch {
    return props.payload.output.toLowerCase().includes('error')
  }
})

// 方法
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const getToolIcon = (toolName: string) => {
  const iconMap: Record<string, string> = {
    'web_search': 'ri:search-line',
    'calculator': 'ri:calculator-line',
    'code_executor': 'ri:code-line',
    'file_reader': 'ri:file-text-line',
    'api_call': 'ri:global-line',
    'database_query': 'ri:database-line',
    'email_sender': 'ri:mail-line',
    'image_generator': 'ri:image-line',
    'text_analyzer': 'ri:text',
    'default': 'ri:tools-line'
  }
  return iconMap[toolName] || iconMap.default
}

const getToolDescription = (toolName: string) => {
  const descriptionMap: Record<string, string> = {
    'web_search': '网络搜索工具',
    'calculator': '计算器工具',
    'code_executor': '代码执行工具',
    'file_reader': '文件读取工具',
    'api_call': 'API调用工具',
    'database_query': '数据库查询工具',
    'email_sender': '邮件发送工具',
    'image_generator': '图片生成工具',
    'text_analyzer': '文本分析工具',
    'default': '自定义工具'
  }
  return descriptionMap[toolName] || descriptionMap.default
}

const formatJSON = (jsonString: string) => {
  if (!jsonString) return ''

  try {
    const parsed = JSON.parse(jsonString)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return jsonString
  }
}

const getErrorMessage = () => {
  if (!props.payload.output) return '未知错误'

  try {
    const output = JSON.parse(props.payload.output)
    return output.error || output.message || '执行失败'
  } catch {
    return props.payload.output
  }
}
</script>

<style scoped>
.tool-detail {
  /* 工具详情样式 */
}

.tool-header {
  /* 工具头部样式 */
}

.tool-icon {
  /* 工具图标样式 */
}

.tool-content {
  /* 工具内容样式 */
}

.input-section,
.output-section,
.error-section {
  /* 各个section的样式 */
}

pre {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Fira Mono', 'Droid Sans Mono', 'Consolas', monospace;
}
</style>
