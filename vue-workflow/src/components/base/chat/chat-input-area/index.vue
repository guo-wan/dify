<template>
  <div
    class="chat-input-area relative"
    :class="[
      isDragActive && 'drag-active',
      disabled && 'disabled'
    ]"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <!-- 功能栏 -->
    <div v-if="showFeatureBar" class="mb-3">
      <FeatureBar
        :disabled="featureBarDisabled"
        @click="onFeatureBarClick"
      />
    </div>

    <!-- 输入表单 -->
    <div v-if="inputsForm.length" class="mb-4 space-y-3">
      <div v-for="input in inputsForm" :key="input.variable" class="input-form-item">
        <FormItem
          :payload="input"
          :value="inputs[input.variable]"
          @change="handleInputChange(input.variable, $event)"
        />
      </div>
    </div>

    <!-- 文件列表 -->
    <div v-if="fileList.length" class="mb-3">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="file in fileList"
          :key="file.id"
          class="file-item flex items-center bg-blue-50 text-blue-800 text-sm rounded-lg px-3 py-2"
        >
          <Icon :icon="getFileIcon(file.type)" class="h-4 w-4 mr-2" />
          <span class="truncate max-w-[120px]">{{ file.name }}</span>
          <button
            class="ml-2 text-blue-600 hover:text-blue-800"
            @click="removeFile(file.id)"
          >
            <Icon icon="ri:close-line" class="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- 主输入区域 -->
    <div
      ref="wrapperRef"
      class="input-wrapper relative flex items-end border border-gray-300 rounded-lg bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
      :class="{
        'border-red-300 focus-within:border-red-500 focus-within:ring-red-500': hasError,
        'opacity-50 cursor-not-allowed': disabled
      }"
    >
      <!-- 文本输入区域 -->
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="query"
          :disabled="disabled || isResponding"
          :placeholder="placeholder"
          class="w-full resize-none border-0 outline-none px-4 py-3 text-sm placeholder-gray-500 bg-transparent"
          :style="{ height: textareaHeight }"
          @input="handleInput"
          @keydown="handleKeyDown"
          @paste="handlePaste"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
        />

        <!-- 字数限制提示 -->
        <div v-if="maxLength && query.length > maxLength * 0.8"
             class="absolute bottom-1 right-2 text-xs"
             :class="query.length > maxLength ? 'text-red-500' : 'text-gray-400'">
          {{ query.length }}/{{ maxLength }}
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div class="flex items-end p-2 space-x-1">
        <!-- 文件上传按钮 -->
        <button
          v-if="showFileUpload"
          :disabled="disabled"
          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleFileUpload"
          title="上传文件"
        >
          <Icon icon="ri:attachment-line" class="h-4 w-4" />
        </button>

        <!-- 语音输入按钮 -->
        <button
          v-if="speechToTextConfig?.enabled"
          :disabled="disabled"
          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          @click="toggleVoiceInput"
          title="语音输入"
        >
          <Icon icon="ri:mic-line" class="h-4 w-4" />
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
          title="发送消息 (Enter)"
        >
          <Icon v-if="isResponding" icon="ri:loader-4-line" class="h-4 w-4 animate-spin" />
          <Icon v-else icon="ri:send-plane-line" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- 拖拽提示 -->
    <div
      v-if="isDragActive"
      class="absolute inset-0 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center z-10"
    >
      <div class="text-center text-blue-600">
        <Icon icon="ri:upload-cloud-line" class="h-8 w-8 mx-auto mb-2" />
        <p class="font-medium">拖拽文件到此处上传</p>
      </div>
    </div>

    <!-- 语音输入组件 -->
    <VoiceInput
      v-if="showVoiceInput"
      @close="showVoiceInput = false"
      @result="handleVoiceResult"
    />

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      :accept="acceptedFileTypes"
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import FormItem from '@/components/workflow/panel/form-item.vue'
import VoiceInput from './voice-input.vue'
import FeatureBar from './feature-bar.vue'
import { useToast } from '@/components/base/toast/useToast'

interface FileItem {
  id: string
  name: string
  type: string
  size: number
  uploadedId?: string
  transferMethod?: string
}

interface InputForm {
  variable: string
  type: string
  label: string
  required?: boolean
  default?: any
  options?: string[]
}

interface Props {
  botName?: string
  placeholder?: string
  showFeatureBar?: boolean
  showFileUpload?: boolean
  featureBarDisabled?: boolean
  speechToTextConfig?: { enabled: boolean }
  inputs?: Record<string, any>
  inputsForm?: InputForm[]
  isResponding?: boolean
  disabled?: boolean
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '输入消息...',
  showFeatureBar: false,
  showFileUpload: true,
  featureBarDisabled: false,
  speechToTextConfig: () => ({ enabled: true }),
  inputs: () => ({}),
  inputsForm: () => [],
  isResponding: false,
  disabled: false,
  maxLength: 2000
})

const emit = defineEmits<{
  send: [query: string, inputs: Record<string, any>, files: FileItem[]]
  inputChange: [variable: string, value: any]
  featureBarClick: [state: boolean]
}>()

// 响应式状态
const query = ref('')
const fileList = ref<FileItem[]>([])
const isDragActive = ref(false)
const showVoiceInput = ref(false)
const isComposing = ref(false)
const textareaHeight = ref('auto')
const hasError = ref(false)

// DOM引用
const wrapperRef = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()
const fileInputRef = ref<HTMLInputElement>()

const toast = useToast()

// 计算属性
const canSend = computed(() => {
  if (props.disabled || props.isResponding) return false

  const hasQuery = query.value.trim().length > 0
  const hasFiles = fileList.value.length > 0
  const withinLimit = !props.maxLength || query.value.length <= props.maxLength

  // 检查必填表单项
  const hasRequiredInputs = props.inputsForm.every(input => {
    if (input.required) {
      const value = props.inputs[input.variable]
      return value !== undefined && value !== null && value !== ''
    }
    return true
  })

  return (hasQuery || hasFiles) && withinLimit && hasRequiredInputs
})

const acceptedFileTypes = computed(() => {
  return '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif'
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

const handleKeyDown = (event: KeyboardEvent) => {
  // Enter发送，Shift+Enter换行
  if (event.key === 'Enter' && !event.shiftKey && !isComposing.value) {
    event.preventDefault()
    handleSend()
  }

  // 快捷键支持
  if (event.key === 'ArrowUp' && event.ctrlKey) {
    // 可以实现历史记录功能
    event.preventDefault()
  }
}

const handleSend = () => {
  if (!canSend.value) {
    if (props.isResponding) {
      toast.info('请等待回复完成')
    } else if (!query.value.trim() && !fileList.value.length) {
      toast.info('请输入消息或上传文件')
    } else if (props.maxLength && query.value.length > props.maxLength) {
      toast.error(`消息长度不能超过${props.maxLength}个字符`)
    } else {
      toast.error('请检查必填项是否已填写')
    }
    return
  }

  emit('send', query.value.trim(), props.inputs, [...fileList.value])

  // 清空输入
  query.value = ''
  fileList.value = []
  autoResizeTextarea()
}

const handleInputChange = (variable: string, value: any) => {
  emit('inputChange', variable, value)
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
      addFile({
        id: `${Date.now()}-${i}`,
        name: file.name,
        type: file.type,
        size: file.size,
        transferMethod: 'local_file'
      })
    }
  }

  // 清空input
  if (target) target.value = ''
}

const addFile = (file: FileItem) => {
  fileList.value.push(file)
}

const removeFile = (fileId: string) => {
  const index = fileList.value.findIndex(f => f.id === fileId)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

const getFileIcon = (type: string) => {
  if (type.includes('image')) return 'ri:image-line'
  if (type.includes('pdf')) return 'ri:file-pdf-line'
  if (type.includes('word')) return 'ri:file-word-line'
  if (type.includes('text')) return 'ri:file-text-line'
  return 'ri:file-line'
}

// 拖拽处理
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragActive.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  if (!e.relatedTarget || !wrapperRef.value?.contains(e.relatedTarget as Node)) {
    isDragActive.value = false
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragActive.value = false

  const files = e.dataTransfer?.files
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      addFile({
        id: `${Date.now()}-${i}`,
        name: file.name,
        type: file.type,
        size: file.size,
        transferMethod: 'local_file'
      })
    }
  }
}

const handlePaste = (e: ClipboardEvent) => {
  const files = e.clipboardData?.files
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      addFile({
        id: `${Date.now()}-${i}`,
        name: file.name || `剪贴板文件${i + 1}`,
        type: file.type,
        size: file.size,
        transferMethod: 'local_file'
      })
    }
  }
}

const toggleVoiceInput = () => {
  showVoiceInput.value = !showVoiceInput.value
}

const handleVoiceResult = (text: string) => {
  query.value = text
  showVoiceInput.value = false
  autoResizeTextarea()
}

const onFeatureBarClick = (state: boolean) => {
  emit('featureBarClick', state)
}

// 生命周期
onMounted(() => {
  autoResizeTextarea()
})
</script>

<style scoped>
.chat-input-area {
  /* 聊天输入区域样式 */
}

.input-wrapper {
  min-height: 52px;
}

.drag-active {
  /* 拖拽激活状态样式 */
}

.disabled {
  pointer-events: none;
}

textarea {
  min-height: 20px;
  max-height: 120px;
}
</style>
