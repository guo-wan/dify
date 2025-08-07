<template>
  <div class="user-input bg-white border border-gray-200 rounded-lg">
    <!-- 输入区域 -->
    <div class="p-3">
      <div class="flex items-end space-x-2">
        <!-- 文本输入框 -->
        <div class="flex-1">
          <textarea
            ref="textareaRef"
            v-model="inputMessage"
            :disabled="disabled"
            placeholder="输入消息..."
            class="w-full resize-none border-0 outline-none focus:ring-0 text-sm"
            rows="1"
            :style="{ height: textareaHeight }"
            @input="handleInput"
            @keydown="handleKeydown"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center space-x-1">
          <!-- 文件上传按钮 -->
          <button
            :disabled="disabled"
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleFileUpload"
            title="上传文件"
          >
            <Icon icon="ri:attachment-line" class="h-4 w-4" />
          </button>

          <!-- 发送按钮 -->
          <button
            :disabled="!canSend"
            :class="[
              'p-2 rounded-md transition-colors',
              canSend
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            ]"
            @click="handleSend"
            title="发送消息"
          >
            <Icon icon="ri:send-plane-line" class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- 文件列表 -->
      <div v-if="attachedFiles.length" class="mt-2 space-y-1">
        <div
          v-for="file in attachedFiles"
          :key="file.id"
          class="flex items-center justify-between bg-gray-50 rounded p-2"
        >
          <div class="flex items-center">
            <Icon icon="ri:file-line" class="h-4 w-4 text-gray-500 mr-2" />
            <span class="text-sm">{{ file.name }}</span>
            <span class="text-xs text-gray-400 ml-2">({{ formatFileSize(file.size) }})</span>
          </div>
          <button
            class="text-red-500 hover:text-red-700 p-1"
            @click="removeFile(file.id)"
          >
            <Icon icon="ri:close-line" class="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="px-3 pb-2">
      <div class="text-xs text-gray-500 flex items-center justify-between">
        <span>按 Enter 发送，Shift + Enter 换行</span>
        <span v-if="inputMessage.length > 0">{{ inputMessage.length }}/2000</span>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'

interface FileItem {
  id: string
  name: string
  size: number
  file: File
}

interface Props {
  disabled?: boolean
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  maxLength: 2000
})

const emit = defineEmits<{
  send: [message: string, files?: FileItem[]]
}>()

// 响应式状态
const inputMessage = ref('')
const attachedFiles = ref<FileItem[]>([])
const textareaHeight = ref('auto')

// DOM引用
const textareaRef = ref<HTMLTextAreaElement>()
const fileInputRef = ref<HTMLInputElement>()

// 计算属性
const canSend = computed(() => {
  return !props.disabled &&
         (inputMessage.value.trim().length > 0 || attachedFiles.value.length > 0) &&
         inputMessage.value.length <= props.maxLength
})

// 方法
const handleInput = async () => {
  await nextTick()
  autoResizeTextarea()
}

const autoResizeTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    const scrollHeight = textareaRef.value.scrollHeight
    const maxHeight = 120 // 最大高度
    textareaHeight.value = `${Math.min(scrollHeight, maxHeight)}px`
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

const handleSend = () => {
  if (!canSend.value) return

  const message = inputMessage.value.trim()
  const files = [...attachedFiles.value]

  emit('send', message, files)

  // 清空输入
  inputMessage.value = ''
  attachedFiles.value = []
  autoResizeTextarea()
}

const handleFileUpload = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileItem: FileItem = {
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        file
      }
      attachedFiles.value.push(fileItem)
    }
  }

  // 清空input
  if (target) {
    target.value = ''
  }
}

const removeFile = (fileId: string) => {
  const index = attachedFiles.value.findIndex(f => f.id === fileId)
  if (index > -1) {
    attachedFiles.value.splice(index, 1)
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 初始化
onMounted(() => {
  autoResizeTextarea()
})
</script>

<style scoped>
.user-input {
  /* 可以添加特定样式 */
}

textarea {
  /* 移除默认样式 */
  resize: none;
  overflow-y: auto;
}
</style>
