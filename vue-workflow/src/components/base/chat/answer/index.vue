<template>
  <div class="flex mb-4 pr-11">
    <!-- AI头像 -->
    <div class="flex-shrink-0 mr-3">
      <div v-if="answerIcon">
        <component :is="answerIcon" />
      </div>
      <div v-else class="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
        <Icon icon="ri:robot-line" class="w-4 h-4 text-white" />
      </div>
    </div>

    <!-- 回答内容 -->
    <div ref="containerRef" class="flex-1 max-w-full">
      <div class="bg-gray-50 rounded-lg px-4 py-3 relative">
        <!-- 内容切换器（如果有多个版本） -->
        <div v-if="item.prevSibling || item.nextSibling" class="absolute top-2 right-2">
          <div class="flex items-center space-x-1 bg-white rounded-md shadow-sm border">
            <NButton
              :disabled="!item.prevSibling"
              type="default"
              size="tiny"
              quaternary
              @click="handleSwitchSibling('prev')"
            >
              <template #icon>
                <Icon icon="ri:arrow-left-s-line" class="w-4 h-4" />
              </template>
            </NButton>
            <span class="text-xs text-gray-500 px-1">
              {{ currentIndex }}/{{ totalSiblings }}
            </span>
            <NButton
              :disabled="!item.nextSibling"
              type="default"
              size="tiny"
              quaternary
              @click="handleSwitchSibling('next')"
            >
              <template #icon>
                <Icon icon="ri:arrow-right-s-line" class="w-4 h-4" />
              </template>
            </NButton>
          </div>
        </div>

        <!-- 响应中状态 -->
        <div v-if="responding && !content" class="flex items-center space-x-2">
          <LoadingAnim type="avatar" />
          <span class="text-sm text-gray-600">正在思考...</span>
        </div>

        <!-- 主要内容 -->
        <div v-else class="space-y-3">
          <!-- Agent思考过程 -->
          <div v-if="hasAgentThoughts" class="space-y-2">
            <div class="text-sm font-medium text-gray-700">思考过程:</div>
            <div
              v-for="thought in agentThoughts"
              :key="thought.id"
              class="bg-white rounded p-3 border-l-4 border-blue-200"
            >
              <div class="text-sm text-gray-600">{{ thought.tool || '思考' }}</div>
              <div class="mt-1 text-sm">{{ thought.thought }}</div>
              <div v-if="thought.observation" class="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                观察: {{ thought.observation }}
              </div>
            </div>
          </div>

          <!-- 工作流过程 -->
          <div v-if="workflowProcess?.length" class="space-y-2">
            <div class="text-sm font-medium text-gray-700">执行过程:</div>
            <div class="space-y-1">
              <div
                v-for="process in workflowProcess"
                :key="process.id"
                class="flex items-center space-x-2 text-sm"
              >
                <Icon
                  :icon="getProcessIcon(process.status)"
                  :class="getProcessIconColor(process.status)"
                />
                <span>{{ process.title }}</span>
                <span v-if="process.elapsed_time" class="text-xs text-gray-500">
                  {{ formatElapsedTime(process.elapsed_time) }}s
                </span>
              </div>
            </div>
          </div>

          <!-- 回答内容 -->
          <div ref="contentRef" class="prose prose-sm max-w-none">
            <div v-if="content" v-html="formatContent(content)" />
            <div v-else-if="responding" class="flex items-center space-x-2">
              <LoadingAnim type="text" />
              <span class="text-sm text-gray-500">正在生成回答...</span>
            </div>
          </div>

          <!-- 引用内容 -->
          <div v-if="citation?.length" class="space-y-2">
            <div class="text-sm font-medium text-gray-700">参考资料:</div>
            <div class="space-y-1">
              <div
                v-for="cite in citation"
                :key="cite.id"
                class="bg-blue-50 border border-blue-200 rounded p-2 text-sm"
              >
                <div class="font-medium">{{ cite.title }}</div>
                <div class="text-gray-600 mt-1">{{ cite.content }}</div>
              </div>
            </div>
          </div>

          <!-- 文件列表 -->
          <div v-if="allFiles?.length || messageFiles?.length" class="space-y-2">
            <div class="text-sm font-medium text-gray-700">相关文件:</div>
            <div class="space-y-2">
              <template v-if="allFiles?.length">
                <div
                  v-for="fileGroup in allFiles"
                  :key="fileGroup.varName"
                  class="space-y-1"
                >
                  <div class="text-xs text-gray-500">{{ fileGroup.varName }}</div>
                  <div class="space-y-1">
                    <div
                      v-for="file in fileGroup.list"
                      :key="file.id"
                      class="flex items-center justify-between bg-white border rounded p-2"
                    >
                      <div class="flex items-center space-x-2">
                        <Icon icon="ri:file-line" class="w-4 h-4 text-gray-500" />
                        <span class="text-sm">{{ file.name }}</span>
                      </div>
                      <NButton type="primary" size="tiny" quaternary>
                        下载
                      </NButton>
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="messageFiles?.length">
                <div class="space-y-1">
                  <div
                    v-for="file in messageFiles"
                    :key="file.id"
                    class="flex items-center justify-between bg-white border rounded p-2"
                  >
                    <div class="flex items-center space-x-2">
                      <Icon icon="ri:file-line" class="w-4 h-4 text-gray-500" />
                      <span class="text-sm">{{ file.name }}</span>
                    </div>
                    <NButton type="primary" size="tiny" quaternary>
                      下载
                    </NButton>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- 建议问题 -->
          <div v-if="suggestedQuestions?.length" class="space-y-2">
            <div class="text-sm font-medium text-gray-700">相关问题:</div>
            <div class="space-y-1">
              <NButton
                v-for="question in suggestedQuestions"
                :key="question"
                type="default"
                size="small"
                class="w-full justify-start"
                @click="$emit('askQuestion', question)"
              >
                {{ question }}
              </NButton>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end mt-3 space-x-1">
          <NButton
            type="default"
            size="tiny"
            quaternary
            @click="handleCopy"
            title="复制"
          >
            <template #icon>
              <Icon icon="ri:clipboard-line" class="w-4 h-4 text-gray-600" />
            </template>
          </NButton>
          <NButton
            v-if="!noChatInput"
            type="default"
            size="tiny"
            quaternary
            @click="handleRegenerate"
            title="重新生成"
          >
            <template #icon>
              <Icon icon="ri:refresh-line" class="w-4 h-4 text-gray-600" />
            </template>
          </NButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import copy from 'copy-to-clipboard'
import { NButton } from 'naive-ui'
import LoadingAnim from '../loading-anim/index.vue'
import { useToast } from '@/components/base/toast/useToast'

interface ChatItem {
  id: string
  content: string
  citation?: Array<{
    id: string
    title: string
    content: string
  }>
  agent_thoughts?: Array<{
    id: string
    tool?: string
    thought: string
    observation?: string
  }>
  workflowProcess?: Array<{
    id: string
    title: string
    status: 'succeeded' | 'failed' | 'running'
    elapsed_time?: number
  }>
  allFiles?: Array<{
    varName: string
    list: Array<{
      id: string
      name: string
      url?: string
    }>
  }>
  message_files?: Array<{
    id: string
    name: string
    url?: string
  }>
  prevSibling?: string
  nextSibling?: string
  siblingIndex?: number
  siblingCount?: number
}

interface AnswerProps {
  item: ChatItem
  question: string
  index: number
  answerIcon?: any
  responding?: boolean
  noChatInput?: boolean
}

const props = withDefaults(defineProps<AnswerProps>(), {
  responding: false,
  noChatInput: false
})

const emit = defineEmits<{
  switchSibling: [siblingMessageId: string]
  regenerate: [item: ChatItem]
  askQuestion: [question: string]
}>()

const toast = useToast()

const containerRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()

const content = computed(() => props.item.content)
const citation = computed(() => props.item.citation)
const agentThoughts = computed(() => props.item.agent_thoughts)
const workflowProcess = computed(() => props.item.workflowProcess)
const allFiles = computed(() => props.item.allFiles)
const messageFiles = computed(() => props.item.message_files)

const hasAgentThoughts = computed(() => !!agentThoughts.value?.length)
const suggestedQuestions = computed(() => {
  // 这里可以从配置或其他地方获取建议问题
  return []
})

const currentIndex = computed(() => (props.item.siblingIndex || 0) + 1)
const totalSiblings = computed(() => props.item.siblingCount || 1)

const handleSwitchSibling = (direction: 'prev' | 'next') => {
  if (direction === 'prev' && props.item.prevSibling) {
    emit('switchSibling', props.item.prevSibling)
  } else if (direction === 'next' && props.item.nextSibling) {
    emit('switchSibling', props.item.nextSibling)
  }
}

const handleCopy = () => {
  copy(content.value || '')
  toast.success('已复制到剪贴板')
}

const handleRegenerate = () => {
  emit('regenerate', props.item)
}

const getProcessIcon = (status: string) => {
  switch (status) {
    case 'succeeded':
      return 'ri:checkbox-circle-fill'
    case 'failed':
      return 'ri:close-circle-fill'
    case 'running':
      return 'ri:loader-line'
    default:
      return 'ri:circle-line'
  }
}

const getProcessIconColor = (status: string) => {
  switch (status) {
    case 'succeeded':
      return 'text-green-500'
    case 'failed':
      return 'text-red-500'
    case 'running':
      return 'text-blue-500 animate-spin'
    default:
      return 'text-gray-400'
  }
}

const formatElapsedTime = (time: number) => {
  return time.toFixed(2)
}

const formatContent = (text: string) => {
  try {
    return marked(text)
  } catch {
    return text.replace(/\n/g, '<br>')
  }
}

onMounted(() => {
  nextTick(() => {
    // 可以在这里处理容器和内容宽度等逻辑
  })
})
</script>
