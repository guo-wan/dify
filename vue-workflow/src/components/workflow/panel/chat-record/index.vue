<template>
  <div class="chat-record flex h-full w-[420px] flex-col rounded-l-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white shadow-xl">
    <!-- 加载状态 -->
    <div v-if="!fetched" class="flex h-full items-center justify-center">
      <Loading />
    </div>

    <!-- 聊天内容 -->
    <template v-else>
      <!-- 头部 -->
      <div class="flex shrink-0 items-center justify-between p-4 pb-1 text-base font-semibold text-gray-900">
        {{ `测试聊天${formatWorkflowRunIdentifier(historyWorkflowData?.finished_at)}` }}
        <button
          class="flex h-6 w-6 cursor-pointer items-center justify-center hover:bg-gray-100 rounded"
          @click="handleClose"
        >
          <Icon icon="ri:close-line" class="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <!-- 聊天区域 -->
      <div class="h-0 grow flex flex-col">
        <!-- 聊天消息列表 -->
        <div class="flex-1 overflow-y-auto px-4 py-2">
          <div v-if="!chatMessages.length" class="text-center py-8 text-gray-500">
            <Icon icon="ri:chat-3-line" class="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>暂无聊天记录</p>
            <p class="text-sm">开始对话后聊天记录将显示在这里</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(message, index) in chatMessages"
              :key="message.id"
              class="chat-message"
            >
              <!-- 用户消息 -->
              <Question
                v-if="!message.isAnswer"
                :item="message"
                @switch-sibling="switchSibling"
              />

              <!-- AI回答 -->
              <Answer
                v-else
                :item="message"
                :question="getPreviousQuestion(index)"
                :index="index"
                @switch-sibling="switchSibling"
                @regenerate="handleRegenerate"
              />
            </div>
          </div>
        </div>

        <!-- 用户输入区域 -->
        <div class="shrink-0 px-4 pb-4">
          <UserInput
            :disabled="isLoading"
            @send="handleSendMessage"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkflowStore } from '@/stores/workflow'
import { formatWorkflowRunIdentifier } from '@/utils/workflow'
import Loading from '@/components/base/loading/index.vue'
import Question from '@/components/base/chat/question/index.vue'
import Answer from '@/components/base/chat/answer/index.vue'
import UserInput from './user-input.vue'
import type { ChatItem } from '@/components/base/chat/types'

const store = useWorkflowStore()

// 响应式状态
const fetched = ref(false)
const isLoading = ref(false)
const chatMessages = ref<ChatItem[]>([])

// 模拟历史工作流数据
const historyWorkflowData = ref({
  conversation_id: '123',
  finished_at: Math.floor(Date.now() / 1000)
})

// 计算属性
const currentConversationID = computed(() => historyWorkflowData.value?.conversation_id)

// 方法
const handleClose = () => {
  // 关闭聊天记录面板的逻辑
  console.log('关闭聊天记录面板')
}

const handleSendMessage = async (message: string, files?: any[]) => {
  if (!message.trim()) return

  isLoading.value = true

  // 添加用户消息
  const userMessage: ChatItem = {
    id: `question-${Date.now()}`,
    content: message,
    isAnswer: false,
    message_files: files
  }

  chatMessages.value.push(userMessage)

  // 模拟AI回复延迟
  setTimeout(() => {
    const aiMessage: ChatItem = {
      id: `answer-${Date.now()}`,
      content: `这是对"${message}"的回复。这是一个模拟的AI回答，展示了聊天记录的功能。\n\n**功能特点：**\n- 支持markdown格式\n- 显示用户输入和AI回复\n- 保持聊天历史记录`,
      isAnswer: true,
      parentMessageId: userMessage.id
    }

    chatMessages.value.push(aiMessage)
    isLoading.value = false
  }, 1500)
}

const handleRegenerate = (item: ChatItem) => {
  console.log('重新生成回答:', item)
  // 实现重新生成逻辑
}

const switchSibling = (siblingMessageId: string) => {
  console.log('切换到兄弟消息:', siblingMessageId)
  // 实现消息版本切换逻辑
}

const getPreviousQuestion = (index: number): string => {
  // 获取当前回答对应的问题
  for (let i = index - 1; i >= 0; i--) {
    if (!chatMessages.value[i].isAnswer) {
      return chatMessages.value[i].content
    }
  }
  return ''
}

const fetchConversationMessages = async () => {
  if (!currentConversationID.value) return

  try {
    fetched.value = false

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟聊天历史数据
    chatMessages.value = [
      {
        id: 'question-1',
        content: '你好，请帮我分析一下这个工作流的执行情况。',
        isAnswer: false
      },
      {
        id: 'answer-1',
        content: '你好！我来帮你分析这个工作流的执行情况。\n\n根据执行记录，该工作流包含以下步骤：\n\n1. **开始节点** - 接收输入参数\n2. **LLM处理** - 使用AI模型处理请求\n3. **结果输出** - 返回处理结果\n\n整体执行时间为2.3秒，消耗了120个token。执行状态为成功。',
        isAnswer: true,
        parentMessageId: 'question-1'
      },
      {
        id: 'question-2',
        content: '能否详细说明一下LLM节点的配置？',
        isAnswer: false
      },
      {
        id: 'answer-2',
        content: '当然可以！LLM节点的配置如下：\n\n**模型配置：**\n- 模型：GPT-3.5-turbo\n- 温度：0.7\n- 最大token：1000\n\n**提示词模板：**\n```\n你是一个专业的AI助手，请根据用户输入提供准确的回答。\n\n用户输入：{{query}}\n```\n\n**输出格式：**\n- 格式：文本\n- 变量名：result',
        isAnswer: true,
        parentMessageId: 'question-2',
        citation: [
          {
            id: '1',
            title: 'LLM节点配置文档',
            content: '详细介绍了LLM节点的各项配置参数...'
          }
        ]
      }
    ]

    fetched.value = true
  } catch (error) {
    console.error('获取聊天记录失败:', error)
    fetched.value = true
  }
}

// 初始化
onMounted(() => {
  fetchConversationMessages()
})
</script>

<style scoped>
.chat-record {
  /* 可以添加特定样式 */
}

.chat-message {
  /* 消息样式 */
}
</style>
