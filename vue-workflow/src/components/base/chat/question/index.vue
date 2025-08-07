<template>
  <div class="flex mb-2">
    <!-- 用户头像 -->
    <div class="flex-shrink-0 mr-3">
      <div v-if="questionIcon">
        <component :is="questionIcon" />
      </div>
      <div v-else class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <Icon icon="ri:user-line" class="w-4 h-4 text-white" />
      </div>
    </div>

    <!-- 问题内容 -->
    <div class="flex-1 max-w-full">
      <div
        ref="contentRef"
        class="bg-blue-50 rounded-lg px-4 py-3 relative"
      >
        <!-- 编辑模式 -->
        <div v-if="isEditing" class="space-y-3">
          <textarea
            v-model="editedContent"
            class="w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            rows="3"
            placeholder="请输入问题..."
          />

          <div class="flex justify-end space-x-2">
            <Button
              variant="secondary"
              size="small"
              @click="handleCancelEditing"
            >
              取消
            </Button>
            <Button
              variant="primary"
              size="small"
              @click="handleResend"
            >
              重新发送
            </Button>
          </div>
        </div>

        <!-- 显示模式 -->
        <div v-else>
          <!-- 内容切换器（如果有多个版本） -->
          <div v-if="item.prevSibling || item.nextSibling" class="absolute top-2 right-2">
            <div class="flex items-center space-x-1 bg-white rounded-md shadow-sm border">
              <button
                :disabled="!item.prevSibling"
                class="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="handleSwitchSibling('prev')"
              >
                <Icon icon="ri:arrow-left-s-line" class="w-4 h-4" />
              </button>
              <span class="text-xs text-gray-500 px-1">
                {{ currentIndex }}/{{ totalSiblings }}
              </span>
              <button
                :disabled="!item.nextSibling"
                class="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="handleSwitchSibling('next')"
              >
                <Icon icon="ri:arrow-right-s-line" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- 文本内容 -->
          <div class="pr-8">
            <div class="prose prose-sm max-w-none" v-html="formatContent(content)" />
          </div>

          <!-- 文件列表 -->
          <div v-if="messageFiles?.length" class="mt-3">
            <div class="space-y-2">
              <div
                v-for="file in messageFiles"
                :key="file.id"
                class="flex items-center space-x-2 bg-white rounded p-2 border"
              >
                <Icon icon="ri:file-line" class="w-4 h-4 text-gray-500" />
                <span class="text-sm">{{ file.name }}</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-end mt-2 space-x-1">
            <button
              v-if="enableEdit"
              class="p-1 hover:bg-white hover:bg-opacity-80 rounded"
              @click="handleEdit"
              title="编辑"
            >
              <Icon icon="ri:edit-line" class="w-4 h-4 text-gray-600" />
            </button>
            <button
              class="p-1 hover:bg-white hover:bg-opacity-80 rounded"
              @click="handleCopy"
              title="复制"
            >
              <Icon icon="ri:clipboard-line" class="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import copy from 'copy-to-clipboard'
import Button from '@/components/base/button/index.vue'
import { useToast } from '@/components/base/toast/useToast'

interface ChatItem {
  id: string
  content: string
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

interface QuestionProps {
  item: ChatItem
  questionIcon?: any
  enableEdit?: boolean
}

const props = withDefaults(defineProps<QuestionProps>(), {
  enableEdit: true
})

const emit = defineEmits<{
  switchSibling: [siblingMessageId: string]
  regenerate: [item: ChatItem, data: { message: string; files?: any[] }]
}>()

const toast = useToast()

const isEditing = ref(false)
const editedContent = ref(props.item.content)
const contentRef = ref<HTMLElement>()

const content = computed(() => props.item.content)
const messageFiles = computed(() => props.item.message_files)

const currentIndex = computed(() => (props.item.siblingIndex || 0) + 1)
const totalSiblings = computed(() => props.item.siblingCount || 1)

const handleEdit = () => {
  isEditing.value = true
  editedContent.value = content.value
}

const handleResend = () => {
  isEditing.value = false
  emit('regenerate', props.item, {
    message: editedContent.value,
    files: messageFiles.value
  })
}

const handleCancelEditing = () => {
  isEditing.value = false
  editedContent.value = content.value
}

const handleSwitchSibling = (direction: 'prev' | 'next') => {
  if (direction === 'prev' && props.item.prevSibling) {
    emit('switchSibling', props.item.prevSibling)
  } else if (direction === 'next' && props.item.nextSibling) {
    emit('switchSibling', props.item.nextSibling)
  }
}

const handleCopy = () => {
  copy(content.value)
  toast.success('已复制到剪贴板')
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
    // 可以在这里处理内容宽度等逻辑
  })
})
</script>
