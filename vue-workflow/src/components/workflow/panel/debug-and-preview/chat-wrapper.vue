<template>
  <div class="chat-wrapper h-full flex flex-col">
    <!-- 变量输入区域 -->
    <div v-if="variables.length" class="variables-section p-4 border-b border-gray-200 bg-gray-50">
      <div class="variables-header flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-gray-700">输入变量</h3>
        <button
          class="text-xs text-blue-600 hover:text-blue-700"
          @click="resetVariables"
        >
          重置
        </button>
      </div>

      <div class="variables-grid space-y-3">
        <div
          v-for="variable in variables"
          :key="variable.variable"
          class="variable-item"
        >
          <label class="block text-xs font-medium text-gray-600 mb-1">
            {{ variable.label }}
            <span v-if="variable.required" class="text-red-500">*</span>
          </label>

          <!-- 字符串输入 -->
          <Input
            v-if="variable.type === 'string'"
            v-model="variableValues[variable.variable]"
            :placeholder="`请输入${variable.label}`"
            size="small"
            @update:model-value="handleVariableChange(variable.variable, $event)"
          />

          <!-- 段落输入 -->
          <textarea
            v-else-if="variable.type === 'paragraph'"
            v-model="variableValues[variable.variable]"
            :placeholder="`请输入${variable.label}`"
            class="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            rows="2"
            @input="handleVariableChange(variable.variable, $event.target.value)"
          />

          <!-- 数字输入 -->
          <Input
            v-else-if="variable.type === 'number'"
            v-model="variableValues[variable.variable]"
            type="number"
            :placeholder="`请输入${variable.label}`"
            size="small"
            :step="0.1"
            @update:model-value="handleVariableChange(variable.variable, $event)"
          />

          <!-- 选择输入 -->
          <Select
            v-else-if="variable.type === 'select'"
            v-model="variableValues[variable.variable]"
            :placeholder="`请选择${variable.label}`"
            size="small"
            @update:model-value="handleVariableChange(variable.variable, $event)"
          >
            <option v-for="option in variable.options" :key="option" :value="option">
              {{ option }}
            </option>
          </Select>
        </div>
      </div>

      <!-- 运行按钮 -->
      <div class="mt-4">
        <Button
          variant="primary"
          size="small"
          :disabled="!canRun || isRunning"
          :loading="isRunning"
          @click="handleRun"
        >
          {{ isRunning ? '运行中...' : '运行工作流' }}
        </Button>
      </div>
    </div>

    <!-- 聊天消息区域 -->
    <div class="messages-section flex-1 min-h-0 flex flex-col">
      <!-- 消息列表 -->
      <div
        ref="messagesContainerRef"
        class="messages-container flex-1 overflow-y-auto p-4 space-y-4"
      >
        <!-- 欢迎消息 -->
        <div v-if="!messages.length" class="welcome-message text-center py-8 text-gray-500">
          <Icon icon="ri:chat-3-line" class="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p class="font-medium">开始测试工作流</p>
          <p class="text-sm">配置变量并点击运行按钮开始</p>
        </div>

        <!-- 消息列表 -->
        <div
          v-for="(message, index) in messages"
          :key="message.id"
          class="message-item"
        >
          <!-- 输入消息 -->
          <div v-if="message.type === 'input'" class="input-message mb-4">
            <div class="message-header flex items-center mb-2">
              <Icon icon="ri:user-line" class="h-4 w-4 text-blue-600 mr-2" />
              <span class="text-sm font-medium text-gray-700">用户输入</span>
              <span class="ml-auto text-xs text-gray-500">
                {{ formatTimestamp(message.timestamp) }}
              </span>
            </div>
            <div class="message-content bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div class="variables-display space-y-2">
                <div
                  v-for="(value, key) in message.variables"
                  :key="key"
                  class="variable-display"
                >
                  <span class="text-xs text-blue-600 font-medium">{{ key }}:</span>
                  <span class="ml-2 text-sm text-blue-800">{{ value }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 输出消息 -->
          <div v-else-if="message.type === 'output'" class="output-message mb-4">
            <div class="message-header flex items-center mb-2">
              <Icon icon="ri:robot-line" class="h-4 w-4 text-green-600 mr-2" />
              <span class="text-sm font-medium text-gray-700">工作流输出</span>
              <div class="ml-auto flex items-center space-x-2">
                <span v-if="debugSettings.showTokenUsage && message.tokens" class="text-xs text-gray-500">
                  {{ message.tokens }} tokens
                </span>
                <span v-if="debugSettings.showExecutionTime && message.executionTime" class="text-xs text-gray-500">
                  {{ message.executionTime }}s
                </span>
                <span class="text-xs text-gray-500">
                  {{ formatTimestamp(message.timestamp) }}
                </span>
              </div>
            </div>
            <div class="message-content bg-green-50 border border-green-200 rounded-lg p-3">
              <div class="output-content">
                <div v-if="message.content" class="prose prose-sm max-w-none">
                  <div v-html="renderMarkdown(message.content)" />
                </div>
                <div v-if="message.files?.length" class="files-list mt-3 space-y-2">
                  <div
                    v-for="file in message.files"
                    :key="file.id"
                    class="file-item flex items-center bg-white rounded p-2"
                  >
                    <Icon icon="ri:file-line" class="h-4 w-4 text-gray-500 mr-2" />
                    <span class="text-sm">{{ file.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 错误消息 -->
          <div v-else-if="message.type === 'error'" class="error-message mb-4">
            <div class="message-header flex items-center mb-2">
              <Icon icon="ri:error-warning-line" class="h-4 w-4 text-red-600 mr-2" />
              <span class="text-sm font-medium text-gray-700">执行错误</span>
              <span class="ml-auto text-xs text-gray-500">
                {{ formatTimestamp(message.timestamp) }}
              </span>
            </div>
            <div class="message-content bg-red-50 border border-red-200 rounded-lg p-3">
              <div class="error-content text-sm text-red-800">
                {{ message.content }}
              </div>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isRunning" class="loading-message mb-4">
          <div class="message-header flex items-center mb-2">
            <Icon icon="ri:loader-4-line" class="h-4 w-4 text-blue-600 mr-2 animate-spin" />
            <span class="text-sm font-medium text-gray-700">工作流执行中...</span>
          </div>
          <div class="message-content bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div class="flex items-center text-sm text-gray-600">
              <div class="loading-dots">正在处理</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { marked } from 'marked'
import Input from '@/components/base/input/index.vue'
import Select from '@/components/base/select/index.vue'
import Button from '@/components/base/button/index.vue'
import { useToast } from '@/components/base/toast/useToast'

interface Variable {
  variable: string
  type: string
  label: string
  required?: boolean
  default?: any
  options?: string[]
}

interface Message {
  id: string
  type: 'input' | 'output' | 'error'
  content?: string
  variables?: Record<string, any>
  files?: Array<{ id: string; name: string }>
  tokens?: number
  executionTime?: number
  timestamp: number
}

interface Props {
  variables: Variable[]
  debugSettings: {
    showTokenUsage: boolean
    showExecutionTime: boolean
    autoScroll: boolean
  }
  previewSettings: {
    enableRealtime: boolean
    showTyping: boolean
  }
  expanded: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  restart: []
  'variable-change': [variable: string, value: any]
}>()

// 响应式状态
const variableValues = ref<Record<string, any>>({})
const messages = ref<Message[]>([])
const isRunning = ref(false)

// DOM引用
const messagesContainerRef = ref<HTMLElement>()

const toast = useToast()

// 计算属性
const canRun = computed(() => {
  // 检查必填变量是否已填写
  return props.variables.every(variable => {
    if (variable.required) {
      const value = variableValues.value[variable.variable]
      return value !== undefined && value !== null && value !== ''
    }
    return true
  })
})

// 方法
const handleVariableChange = (variable: string, value: any) => {
  variableValues.value[variable] = value
  emit('variable-change', variable, value)
}

const resetVariables = () => {
  props.variables.forEach(variable => {
    variableValues.value[variable.variable] = variable.default || ''
  })
}

const handleRun = async () => {
  if (!canRun.value) {
    toast.error('请填写所有必填变量')
    return
  }

  isRunning.value = true

  // 添加输入消息
  const inputMessage: Message = {
    id: `input-${Date.now()}`,
    type: 'input',
    variables: { ...variableValues.value },
    timestamp: Date.now()
  }
  messages.value.push(inputMessage)

  // 滚动到底部
  await scrollToBottom()

  try {
    // 模拟工作流执行
    await simulateWorkflowExecution()

    // 添加输出消息
    const outputMessage: Message = {
      id: `output-${Date.now()}`,
      type: 'output',
      content: `基于您的输入生成的结果：\n\n**处理结果**\n\n这是一个模拟的工作流输出，展示了基于变量 \`${Object.keys(variableValues.value).join(', ')}\` 的处理结果。\n\n- 执行成功\n- 数据已处理\n- 输出已生成`,
      tokens: Math.floor(Math.random() * 200) + 50,
      executionTime: Math.round((Math.random() * 3 + 1) * 100) / 100,
      timestamp: Date.now()
    }
    messages.value.push(outputMessage)

  } catch (error) {
    // 添加错误消息
    const errorMessage: Message = {
      id: `error-${Date.now()}`,
      type: 'error',
      content: '工作流执行失败：模拟错误情况',
      timestamp: Date.now()
    }
    messages.value.push(errorMessage)
  } finally {
    isRunning.value = false
    await scrollToBottom()
  }
}

const simulateWorkflowExecution = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, 2000 + Math.random() * 2000)
  })
}

const handleRestart = () => {
  messages.value = []
  isRunning.value = false
  resetVariables()
  emit('restart')
}

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const renderMarkdown = (content: string): string => {
  try {
    return marked(content)
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return content.replace(/\n/g, '<br>')
  }
}

const scrollToBottom = async () => {
  if (props.debugSettings.autoScroll) {
    await nextTick()
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
    }
  }
}

// 监听消息变化自动滚动
watch(() => messages.value.length, () => {
  scrollToBottom()
})

// 初始化变量默认值
watch(() => props.variables, (newVariables) => {
  newVariables.forEach(variable => {
    if (variable.default !== undefined && variableValues.value[variable.variable] === undefined) {
      variableValues.value[variable.variable] = variable.default
    }
  })
}, { immediate: true })

// 暴露方法给父组件
defineExpose({
  handleRestart
})
</script>

<style scoped>
.chat-wrapper {
  /* 聊天包装器样式 */
}

.variables-section {
  /* 变量区域样式 */
}

.messages-container {
  /* 消息容器样式 */
}

.message-item {
  /* 消息项样式 */
}

.prose {
  /* Markdown内容样式 */
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.prose p {
  margin-bottom: 0.5rem;
}

.prose ul,
.prose ol {
  margin-bottom: 0.5rem;
  padding-left: 1rem;
}

.prose li {
  margin-bottom: 0.125rem;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 0.5rem;
  border-radius: 0.25rem;
  overflow-x: auto;
}

.loading-dots::after {
  content: '';
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0%, 20% { content: ''; }
  40% { content: '.'; }
  60% { content: '..'; }
  80%, 100% { content: '...'; }
}
</style>
