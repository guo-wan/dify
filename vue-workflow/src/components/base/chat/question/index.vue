<template>
  <div class="flex justify-end mb-2 last:mb-0">
    <!-- 问题内容 -->
    <div class="max-w-full pl-11">
      <div
        ref="contentRef"
        class="bg-blue-50 rounded-lg px-4 py-3 relative"
      >
        <!-- 编辑模式 -->
        <div v-if="isEditing" class="space-y-3">
          <NInput
            v-model:value="editedContent"
            type="textarea"
            :autosize="{ minRows: 3 }"
            placeholder="请输入问题..."
            class="w-full"
          />

          <div class="flex justify-end space-x-2">
            <NButton
              type="default"
              size="small"
              @click="handleCancelEditing"
            >
              取消
            </NButton>
            <NButton
              type="primary"
              size="small"
              @click="handleResend"
            >
              重新发送
            </NButton>
          </div>
        </div>

        <!-- 显示模式 -->
        <div v-else>
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

          <!-- 文本内容 -->
          <div>
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
          <div class="flex mt-2 space-x-1">
            <NButton
              v-if="enableEdit"
              type="default"
              size="tiny"
              quaternary
              @click="handleEdit"
              title="编辑"
            >
              <template #icon>
                <Icon icon="ri:edit-line" class="w-4 h-4 text-gray-600" />
              </template>
            </NButton>
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
          </div>
        </div>
      </div>
    </div>
    <!-- 用户头像 -->
    <div class="flex-shrink-0 ml-3">
      <div v-if="questionIcon">
        <component :is="questionIcon" />
      </div>
      <div v-else class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <Icon icon="ri:user-line" class="w-4 h-4 text-white" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import copy from 'copy-to-clipboard'
import { NButton, NInput } from 'naive-ui'
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
