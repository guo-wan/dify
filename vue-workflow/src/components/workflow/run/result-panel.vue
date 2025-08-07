<template>
  <div class="bg-gray-50 py-2">
    <!-- 状态面板 -->
    <div class="px-4 py-2">
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <Icon
              :icon="statusIcon"
              :class="['h-5 w-5 mr-2', statusIconColor]"
            />
            <span :class="['font-medium', statusTextColor]">{{ statusText }}</span>
          </div>
          <div v-if="elapsed_time" class="text-sm text-gray-500">
            耗时: {{ formatElapsedTime(elapsed_time) }}
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded p-3 mb-3">
          <div class="text-red-700 text-sm">{{ error }}</div>
        </div>

        <!-- 统计信息 -->
        <div class="flex flex-wrap gap-4 text-sm text-gray-600">
          <div v-if="total_tokens">
            <span class="font-medium">Token数:</span> {{ total_tokens }}
          </div>
          <div v-if="steps">
            <span class="font-medium">步骤数:</span> {{ steps }}
          </div>
          <div v-if="exceptionCounts">
            <span class="font-medium">异常次数:</span> {{ exceptionCounts }}
          </div>
          <div v-if="created_by">
            <span class="font-medium">创建者:</span> {{ created_by }}
          </div>
        </div>
      </div>
    </div>

    <!-- 输入输出数据 -->
    <div class="px-4 space-y-4">
      <!-- 输入数据 -->
      <div v-if="inputs" class="bg-white rounded-lg border border-gray-200">
        <div class="px-4 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h4 class="font-medium text-gray-700">输入数据</h4>
        </div>
        <div class="p-4">
          <pre class="text-sm bg-gray-100 p-3 rounded overflow-auto">{{ formatJson(inputs) }}</pre>
        </div>
      </div>

      <!-- 处理数据 -->
      <div v-if="process_data" class="bg-white rounded-lg border border-gray-200">
        <div class="px-4 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h4 class="font-medium text-gray-700">处理数据</h4>
        </div>
        <div class="p-4">
          <pre class="text-sm bg-gray-100 p-3 rounded overflow-auto">{{ formatJson(process_data) }}</pre>
        </div>
      </div>

      <!-- 输出数据 -->
      <div v-if="outputs" class="bg-white rounded-lg border border-gray-200">
        <div class="px-4 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h4 class="font-medium text-gray-700">输出数据</h4>
        </div>
        <div class="p-4">
          <pre class="text-sm bg-gray-100 p-3 rounded overflow-auto">{{ formatJson(outputs) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ResultPanelProps {
  inputs?: string
  process_data?: string
  outputs?: string | Record<string, any>
  status: string
  error?: string
  elapsed_time?: number
  total_tokens?: number
  created_at?: number
  created_by?: string
  finished_at?: number
  steps?: number
  exceptionCounts?: number
}

const props = defineProps<ResultPanelProps>()

const statusIcon = computed(() => {
  switch (props.status) {
    case 'succeeded':
      return 'ri:checkbox-circle-fill'
    case 'failed':
      return 'ri:error-warning-fill'
    case 'running':
      return 'ri:loader-line'
    default:
      return 'ri:information-fill'
  }
})

const statusIconColor = computed(() => {
  switch (props.status) {
    case 'succeeded':
      return 'text-green-500'
    case 'failed':
      return 'text-red-500'
    case 'running':
      return 'text-blue-500'
    default:
      return 'text-gray-500'
  }
})

const statusTextColor = computed(() => {
  switch (props.status) {
    case 'succeeded':
      return 'text-green-700'
    case 'failed':
      return 'text-red-700'
    case 'running':
      return 'text-blue-700'
    default:
      return 'text-gray-700'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'succeeded':
      return '执行成功'
    case 'failed':
      return '执行失败'
    case 'running':
      return '正在运行'
    default:
      return '未知状态'
  }
})

const formatElapsedTime = (time: number) => {
  if (time < 1) {
    return `${Math.round(time * 1000)}ms`
  }
  return `${time.toFixed(2)}s`
}

const formatJson = (data: any) => {
  if (typeof data === 'string') {
    try {
      return JSON.stringify(JSON.parse(data), null, 2)
    } catch {
      return data
    }
  }
  return JSON.stringify(data, null, 2)
}
</script>
