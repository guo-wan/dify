<template>
  <div :class="['bg-gray-50', className]">
    <div v-if="!list?.length" class="flex items-center justify-center py-8">
      <div class="text-center text-gray-500">
        <Icon icon="ri:file-list-line" class="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>暂无追踪数据</p>
      </div>
    </div>

    <div v-else class="space-y-2 p-4">
      <div
        v-for="(node, index) in formattedNodes"
        :key="node.id || index"
        class="border border-gray-200 rounded-lg bg-white"
      >
        <!-- 节点头部 -->
        <div
          class="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
          @click="toggleCollapse(node.id)"
        >
          <div class="flex items-center space-x-3">
            <!-- 折叠按钮 -->
            <button
              v-if="node.hasChildren"
              class="p-1 hover:bg-gray-200 rounded"
            >
              <Icon
                icon="ri:arrow-down-s-line"
                :class="[
                  'h-4 w-4 transition-transform',
                  collapsedNodes.has(node.id) ? '-rotate-90' : ''
                ]"
              />
            </button>

            <!-- 节点图标 -->
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', getNodeBgColor(node.status)]">
              <Icon :icon="getNodeIcon(node.node_type)" class="h-4 w-4 text-white" />
            </div>

            <!-- 节点信息 -->
            <div>
              <div class="font-medium text-gray-900">{{ node.title }}</div>
              <div class="text-sm text-gray-500">{{ node.node_type }}</div>
            </div>
          </div>

          <!-- 状态和时间 -->
          <div class="flex items-center space-x-2">
            <span :class="['px-2 py-1 text-xs rounded-full', getStatusClass(node.status)]">
              {{ getStatusText(node.status) }}
            </span>
            <span v-if="node.elapsed_time" class="text-xs text-gray-500">
              {{ formatElapsedTime(node.elapsed_time) }}
            </span>
          </div>
        </div>

        <!-- 节点详情 -->
        <div
          v-if="!collapsedNodes.has(node.id)"
          class="border-t border-gray-200 bg-gray-50"
        >
          <div class="p-4">
            <!-- 输入输出 -->
            <div class="space-y-3">
              <div v-if="node.inputs" class="text-sm">
                <div class="font-medium text-gray-700 mb-1">输入:</div>
                <pre class="bg-white p-2 rounded text-xs overflow-auto">{{ formatData(node.inputs) }}</pre>
              </div>

              <div v-if="node.outputs" class="text-sm">
                <div class="font-medium text-gray-700 mb-1">输出:</div>
                <pre class="bg-white p-2 rounded text-xs overflow-auto">{{ formatData(node.outputs) }}</pre>
              </div>

              <div v-if="node.error" class="text-sm">
                <div class="font-medium text-red-700 mb-1">错误:</div>
                <div class="bg-red-50 border border-red-200 p-2 rounded text-red-600 text-xs">
                  {{ node.error }}
                </div>
              </div>
            </div>

            <!-- 执行时间和Token信息 -->
            <div v-if="node.total_tokens || node.elapsed_time" class="mt-3 flex gap-4 text-xs text-gray-600">
              <span v-if="node.elapsed_time">耗时: {{ formatElapsedTime(node.elapsed_time) }}</span>
              <span v-if="node.total_tokens">Token: {{ node.total_tokens }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface NodeTracing {
  id: string
  node_type: string
  title: string
  status: string
  elapsed_time?: number
  total_tokens?: number
  inputs?: any
  outputs?: any
  error?: string
  execution_metadata?: any
}

interface TracingPanelProps {
  list: NodeTracing[]
  className?: string
  hideNodeInfo?: boolean
  hideNodeProcessDetail?: boolean
}

const props = withDefaults(defineProps<TracingPanelProps>(), {
  hideNodeInfo: false,
  hideNodeProcessDetail: false
})

const collapsedNodes = ref<Set<string>>(new Set())

const formattedNodes = computed(() => {
  return props.list.map(node => ({
    ...node,
    hasChildren: !!(node.inputs || node.outputs || node.error)
  }))
})

const toggleCollapse = (id: string) => {
  const newSet = new Set(collapsedNodes.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  collapsedNodes.value = newSet
}

const getNodeIcon = (nodeType: string) => {
  const iconMap: Record<string, string> = {
    'start': 'ri:play-fill',
    'end': 'ri:stop-fill',
    'llm': 'ri:robot-fill',
    'code': 'ri:code-fill',
    'http-request': 'ri:global-line',
    'tool': 'ri:tools-fill',
    'if-else': 'ri:split-cells-horizontal',
    'iteration': 'ri:loop-left-fill',
    'knowledge-retrieval': 'ri:search-line',
    'parameter-extractor': 'ri:extract-line',
    'template-transform': 'ri:file-text-line'
  }
  return iconMap[nodeType] || 'ri:checkbox-blank-circle-line'
}

const getNodeBgColor = (status: string) => {
  switch (status) {
    case 'succeeded':
      return 'bg-green-500'
    case 'failed':
      return 'bg-red-500'
    case 'running':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'succeeded':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'running':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'succeeded':
      return '成功'
    case 'failed':
      return '失败'
    case 'running':
      return '运行中'
    default:
      return '未知'
  }
}

const formatElapsedTime = (time: number) => {
  if (time < 1) {
    return `${Math.round(time * 1000)}ms`
  }
  return `${time.toFixed(2)}s`
}

const formatData = (data: any) => {
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
