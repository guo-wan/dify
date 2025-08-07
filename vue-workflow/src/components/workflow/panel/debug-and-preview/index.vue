<template>
  <div
    ref="containerRef"
    class="debug-and-preview relative flex h-full flex-col rounded-l-2xl border border-gray-200 bg-white shadow-xl"
    :style="{ width: `${panelWidth}px` }"
  >
    <!-- 调整大小手柄 -->
    <div
      ref="triggerRef"
      class="resize-trigger absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 transition-colors z-10"
      @mousedown="handleResizeStart"
    />

    <!-- 头部工具栏 -->
    <div class="panel-header flex shrink-0 items-center justify-between p-4 border-b border-gray-200">
      <div class="header-left flex items-center">
        <h2 class="text-lg font-semibold text-gray-900">调试和预览</h2>

        <!-- 变量统计 -->
        <div v-if="visibleVariables.length" class="ml-3 text-sm text-gray-500">
          {{ visibleVariables.length }} 个变量
        </div>
      </div>

      <div class="header-right flex items-center space-x-2">
        <!-- 重新开始按钮 -->
        <button
          :disabled="!canRestart"
          class="restart-btn p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleRestartChat"
          title="重新开始"
        >
          <Icon icon="ri:refresh-line" class="h-4 w-4" />
        </button>

        <!-- 设置按钮 -->
        <button
          class="settings-btn p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          @click="toggleSettings"
          title="设置"
        >
          <Icon icon="ri:equalizer-line" class="h-4 w-4" />
        </button>

        <!-- 展开/折叠按钮 -->
        <button
          class="expand-btn p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          @click="toggleExpanded"
          :title="expanded ? '折叠' : '展开'"
        >
          <Icon
            :icon="expanded ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line'"
            class="h-4 w-4"
          />
        </button>

        <!-- 关闭按钮 -->
        <button
          class="close-btn p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          @click="handleClose"
          title="关闭"
        >
          <Icon icon="ri:close-line" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- 设置面板 -->
    <div
      v-if="showSettings"
      class="settings-panel bg-gray-50 border-b border-gray-200 p-4"
    >
      <div class="settings-content space-y-4">
        <!-- 调试选项 -->
        <div class="setting-group">
          <h3 class="text-sm font-medium text-gray-700 mb-2">调试选项</h3>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="debugSettings.showTokenUsage"
                type="checkbox"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-600">显示Token使用量</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="debugSettings.showExecutionTime"
                type="checkbox"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-600">显示执行时间</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="debugSettings.autoScroll"
                type="checkbox"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-600">自动滚动到最新消息</span>
            </label>
          </div>
        </div>

        <!-- 预览选项 -->
        <div class="setting-group">
          <h3 class="text-sm font-medium text-gray-700 mb-2">预览选项</h3>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="previewSettings.enableRealtime"
                type="checkbox"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-600">实时预览</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="previewSettings.showTyping"
                type="checkbox"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-600">显示打字效果</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="panel-content flex-1 min-h-0" :class="{ 'expanded': expanded }">
      <!-- 聊天包装器 -->
      <ChatWrapper
        ref="chatWrapperRef"
        :variables="visibleVariables"
        :debug-settings="debugSettings"
        :preview-settings="previewSettings"
        :expanded="expanded"
        @restart="handleChatRestart"
        @variable-change="handleVariableChange"
      />
    </div>

    <!-- 状态栏 -->
    <div v-if="showStatusBar" class="status-bar flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
      <div class="status-left flex items-center space-x-4">
        <span v-if="executionStats.totalMessages">
          消息: {{ executionStats.totalMessages }}
        </span>
        <span v-if="executionStats.totalTokens">
          Token: {{ executionStats.totalTokens }}
        </span>
        <span v-if="executionStats.executionTime">
          耗时: {{ executionStats.executionTime }}s
        </span>
      </div>

      <div class="status-right">
        <span>宽度: {{ panelWidth }}px</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkflowStore } from '@/stores/workflow'
import { useWorkflowInteractions } from '@/composables/useWorkflowInteractions'
import ChatWrapper from './chat-wrapper.vue'

interface Variable {
  variable: string
  type: string
  label: string
  required?: boolean
  hide?: boolean
  default?: any
}

interface DebugSettings {
  showTokenUsage: boolean
  showExecutionTime: boolean
  autoScroll: boolean
}

interface PreviewSettings {
  enableRealtime: boolean
  showTyping: boolean
}

interface ExecutionStats {
  totalMessages: number
  totalTokens: number
  executionTime: number
}

// 响应式状态
const expanded = ref(true)
const showSettings = ref(false)
const showStatusBar = ref(true)
const panelWidth = ref(480)
const isResizing = ref(false)

const debugSettings = ref<DebugSettings>({
  showTokenUsage: true,
  showExecutionTime: true,
  autoScroll: true
})

const previewSettings = ref<PreviewSettings>({
  enableRealtime: true,
  showTyping: true
})

const executionStats = ref<ExecutionStats>({
  totalMessages: 5,
  totalTokens: 1250,
  executionTime: 3.2
})

// 模拟变量数据
const visibleVariables = ref<Variable[]>([
  {
    variable: 'query',
    type: 'string',
    label: '用户查询',
    required: true
  },
  {
    variable: 'context',
    type: 'paragraph',
    label: '上下文',
    required: false
  },
  {
    variable: 'temperature',
    type: 'number',
    label: '温度参数',
    default: 0.7
  }
])

// DOM引用
const containerRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const chatWrapperRef = ref()

const store = useWorkflowStore()
const { handleCancelDebugAndPreviewPanel } = useWorkflowInteractions()

// 计算属性
const canRestart = computed(() => {
  return executionStats.value.totalMessages > 0
})

const maxPanelWidth = computed(() => {
  // 根据屏幕宽度和其他面板计算最大宽度
  return Math.min(800, window.innerWidth - 400)
})

const minPanelWidth = computed(() => 400)

// 方法
const handleClose = () => {
  handleCancelDebugAndPreviewPanel()
}

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const handleRestartChat = () => {
  // 重置聊天状态
  executionStats.value = {
    totalMessages: 0,
    totalTokens: 0,
    executionTime: 0
  }

  // 调用聊天包装器的重启方法
  chatWrapperRef.value?.handleRestart()
}

const handleChatRestart = () => {
  console.log('Chat restarted from wrapper')
}

const handleVariableChange = (variable: string, value: any) => {
  console.log('Variable changed:', variable, value)
}

// 调整大小相关
const handleResizeStart = (e: MouseEvent) => {
  e.preventDefault()
  isResizing.value = true

  const startX = e.clientX
  const startWidth = panelWidth.value

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return

    const deltaX = startX - e.clientX
    const newWidth = Math.max(
      minPanelWidth.value,
      Math.min(maxPanelWidth.value, startWidth + deltaX)
    )

    panelWidth.value = newWidth
  }

  const handleMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    // 保存到本地存储
    localStorage.setItem('debug-and-preview-panel-width', panelWidth.value.toString())
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 生命周期
onMounted(() => {
  // 从本地存储恢复宽度
  const savedWidth = localStorage.getItem('debug-and-preview-panel-width')
  if (savedWidth) {
    const width = parseInt(savedWidth)
    if (width >= minPanelWidth.value && width <= maxPanelWidth.value) {
      panelWidth.value = width
    }
  }
})

onUnmounted(() => {
  // 清理事件监听器
})
</script>

<style scoped>
.debug-and-preview {
  /* 调试预览面板样式 */
  transition: width 0.2s ease;
}

.resize-trigger {
  /* 调整大小触发器样式 */
}

.resize-trigger:hover {
  background-color: #3b82f6;
  width: 2px;
}

.panel-content.expanded {
  /* 展开状态样式 */
}

.settings-panel {
  /* 设置面板样式 */
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.status-bar {
  /* 状态栏样式 */
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
}
</style>
