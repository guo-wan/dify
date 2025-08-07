<template>
  <div class="chat-context">
    <!-- 上下文标题 -->
    <div v-if="showTitle" class="context-header flex items-center mb-3">
      <Icon icon="ri:history-line" class="h-4 w-4 mr-2 text-gray-600" />
      <span class="text-sm font-medium text-gray-700">对话上下文</span>
      <span v-if="contextItems.length" class="ml-2 text-xs text-gray-500">
        ({{ contextItems.length }} 条)
      </span>
    </div>

    <!-- 上下文列表 -->
    <div v-if="contextItems.length" class="context-list space-y-2">
      <div
        v-for="(item, index) in displayItems"
        :key="item.id"
        class="context-item bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
      >
        <!-- 上下文项头部 -->
        <div class="item-header flex items-center justify-between mb-2">
          <div class="flex items-center">
            <Icon
              :icon="getContextIcon(item.type)"
              :class="['h-4 w-4 mr-2', getContextIconColor(item.type)]"
            />
            <span class="text-sm font-medium text-gray-700">
              {{ getContextTypeLabel(item.type) }}
            </span>
            <span v-if="item.timestamp" class="ml-2 text-xs text-gray-500">
              {{ formatTimestamp(item.timestamp) }}
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center space-x-1">
            <button
              v-if="item.relevanceScore !== undefined"
              class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
              title="相关性评分"
            >
              {{ Math.round(item.relevanceScore * 100) }}%
            </button>

            <button
              class="p-1 text-gray-400 hover:text-gray-600 rounded"
              @click="toggleExpanded(item.id)"
              :title="expandedItems.has(item.id) ? '收起' : '展开'"
            >
              <Icon
                :icon="expandedItems.has(item.id) ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'"
                class="h-3 w-3"
              />
            </button>

            <button
              class="p-1 text-gray-400 hover:text-red-600 rounded"
              @click="removeContext(item.id)"
              title="移除此上下文"
            >
              <Icon icon="ri:close-line" class="h-3 w-3" />
            </button>
          </div>
        </div>

        <!-- 上下文内容 -->
        <div class="item-content">
          <!-- 简略显示 -->
          <div v-if="!expandedItems.has(item.id)" class="content-preview">
            <p class="text-sm text-gray-600 line-clamp-2">
              {{ getPreviewText(item.content) }}
            </p>
          </div>

          <!-- 完整显示 -->
          <div v-else class="content-full">
            <!-- 文本内容 -->
            <div v-if="item.type === 'text'" class="text-content">
              <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ item.content }}</p>
            </div>

            <!-- 问答对 -->
            <div v-else-if="item.type === 'qa'" class="qa-content space-y-2">
              <div v-if="item.question" class="question bg-blue-50 p-2 rounded">
                <div class="text-xs text-blue-600 font-medium mb-1">问题:</div>
                <div class="text-sm text-blue-800">{{ item.question }}</div>
              </div>
              <div v-if="item.answer" class="answer bg-green-50 p-2 rounded">
                <div class="text-xs text-green-600 font-medium mb-1">回答:</div>
                <div class="text-sm text-green-800">{{ item.answer }}</div>
              </div>
            </div>

            <!-- 代码内容 -->
            <div v-else-if="item.type === 'code'" class="code-content">
              <div class="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
                <div v-if="item.language" class="text-xs text-gray-400 mb-2">{{ item.language }}</div>
                <pre>{{ item.content }}</pre>
              </div>
            </div>

            <!-- 文件内容 -->
            <div v-else-if="item.type === 'file'" class="file-content">
              <div class="flex items-center bg-gray-100 p-2 rounded">
                <Icon icon="ri:file-line" class="h-4 w-4 text-gray-600 mr-2" />
                <span class="text-sm text-gray-700">{{ item.filename || '文件' }}</span>
                <button
                  v-if="item.downloadUrl"
                  class="ml-auto text-xs text-blue-600 hover:text-blue-700"
                  @click="downloadFile(item)"
                >
                  下载
                </button>
              </div>
              <div v-if="item.content" class="mt-2 text-sm text-gray-600">
                {{ item.content }}
              </div>
            </div>

            <!-- 默认内容 -->
            <div v-else class="default-content">
              <p class="text-sm text-gray-700">{{ item.content }}</p>
            </div>
          </div>

          <!-- 元数据 -->
          <div v-if="expandedItems.has(item.id) && hasMetadata(item)" class="item-metadata mt-3 pt-3 border-t border-gray-200">
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div v-if="item.source" class="metadata-item">
                <span class="text-gray-500">来源:</span>
                <span class="ml-1 text-gray-700">{{ item.source }}</span>
              </div>
              <div v-if="item.tokens" class="metadata-item">
                <span class="text-gray-500">Token数:</span>
                <span class="ml-1 text-gray-700">{{ item.tokens }}</span>
              </div>
              <div v-if="item.model" class="metadata-item">
                <span class="text-gray-500">模型:</span>
                <span class="ml-1 text-gray-700">{{ item.model }}</span>
              </div>
              <div v-if="item.temperature !== undefined" class="metadata-item">
                <span class="text-gray-500">温度:</span>
                <span class="ml-1 text-gray-700">{{ item.temperature }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 显示更多/更少按钮 -->
      <div v-if="contextItems.length > maxDisplay" class="show-more text-center pt-2">
        <button
          class="text-sm text-blue-600 hover:text-blue-700"
          @click="toggleShowAll"
        >
          {{ showAll ? `收起 (隐藏${contextItems.length - maxDisplay}条)` : `显示全部 (还有${contextItems.length - maxDisplay}条)` }}
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="context-empty text-center py-8 text-gray-500">
      <Icon icon="ri:history-line" class="h-8 w-8 mx-auto mb-2 text-gray-300" />
      <p>暂无上下文信息</p>
      <p class="text-sm">对话过程中的信息将显示在这里</p>
    </div>

    <!-- 上下文操作 -->
    <div v-if="contextItems.length" class="context-actions mt-4 pt-4 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="text-xs text-gray-500">
          {{ getContextSummary() }}
        </div>
        <div class="flex items-center space-x-2">
          <button
            class="text-xs text-gray-600 hover:text-gray-800"
            @click="exportContext"
          >
            导出
          </button>
          <button
            class="text-xs text-red-600 hover:text-red-800"
            @click="clearAllContext"
          >
            清空
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '@/components/base/toast/useToast'

export interface ContextItem {
  id: string
  type: 'text' | 'qa' | 'code' | 'file' | 'system'
  content: string
  question?: string
  answer?: string
  language?: string
  filename?: string
  downloadUrl?: string
  timestamp?: number
  relevanceScore?: number
  source?: string
  tokens?: number
  model?: string
  temperature?: number
}

interface Props {
  contextItems: ContextItem[]
  maxDisplay?: number
  showTitle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxDisplay: 5,
  showTitle: true
})

const emit = defineEmits<{
  remove: [id: string]
  clear: []
  export: [items: ContextItem[]]
}>()

// 响应式状态
const expandedItems = ref(new Set<string>())
const showAll = ref(false)

const toast = useToast()

// 计算属性
const displayItems = computed(() => {
  if (showAll.value || props.contextItems.length <= props.maxDisplay) {
    return props.contextItems
  }
  return props.contextItems.slice(0, props.maxDisplay)
})

// 方法
const getContextIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'text': 'ri:file-text-line',
    'qa': 'ri:question-answer-line',
    'code': 'ri:code-line',
    'file': 'ri:file-line',
    'system': 'ri:settings-line'
  }
  return iconMap[type] || 'ri:chat-3-line'
}

const getContextIconColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'text': 'text-blue-600',
    'qa': 'text-green-600',
    'code': 'text-purple-600',
    'file': 'text-orange-600',
    'system': 'text-gray-600'
  }
  return colorMap[type] || 'text-gray-600'
}

const getContextTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    'text': '文本',
    'qa': '问答',
    'code': '代码',
    'file': '文件',
    'system': '系统'
  }
  return labelMap[type] || type
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`

  return date.toLocaleDateString()
}

const getPreviewText = (content: string) => {
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

const hasMetadata = (item: ContextItem) => {
  return item.source || item.tokens || item.model || item.temperature !== undefined
}

const getContextSummary = () => {
  const total = props.contextItems.length
  const types = [...new Set(props.contextItems.map(item => item.type))]
  return `共${total}条上下文，包含${types.map(getContextTypeLabel).join('、')}`
}

const toggleExpanded = (id: string) => {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id)
  } else {
    expandedItems.value.add(id)
  }
}

const toggleShowAll = () => {
  showAll.value = !showAll.value
}

const removeContext = (id: string) => {
  emit('remove', id)
  expandedItems.value.delete(id)
}

const clearAllContext = () => {
  if (confirm('确定要清空所有上下文吗？')) {
    emit('clear')
    expandedItems.value.clear()
  }
}

const exportContext = () => {
  emit('export', props.contextItems)
  toast.success('上下文已导出')
}

const downloadFile = (item: ContextItem) => {
  if (item.downloadUrl) {
    const link = document.createElement('a')
    link.href = item.downloadUrl
    link.download = item.filename || 'file'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
</script>

<style scoped>
.chat-context {
  /* 上下文组件样式 */
}

.context-list {
  /* 上下文列表样式 */
}

.context-item {
  /* 上下文项样式 */
}

.item-header {
  /* 项头部样式 */
}

.item-content {
  /* 项内容样式 */
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.metadata-item {
  /* 元数据项样式 */
}
</style>
