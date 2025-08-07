<template>
  <div class="voice-input fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
      <!-- 标题 -->
      <div class="text-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">语音输入</h3>
        <p class="text-sm text-gray-500 mt-1">
          {{ isListening ? '正在录音...' : '点击开始录音' }}
        </p>
      </div>

      <!-- 录音状态 -->
      <div class="flex flex-col items-center mb-6">
        <!-- 录音按钮 -->
        <button
          class="recording-button relative"
          :class="[
            'w-20 h-20 rounded-full border-4 transition-all duration-200 flex items-center justify-center',
            isListening
              ? 'bg-red-500 border-red-600 animate-pulse'
              : 'bg-blue-500 border-blue-600 hover:bg-blue-600'
          ]"
          @click="toggleRecording"
        >
          <Icon
            :icon="isListening ? 'ri:stop-line' : 'ri:mic-line'"
            class="h-8 w-8 text-white"
          />

          <!-- 录音波纹效果 -->
          <div
            v-if="isListening"
            class="absolute inset-0 rounded-full border-4 border-red-400 animate-ping"
          />
        </button>

        <!-- 录音时长 -->
        <div v-if="isListening" class="mt-3 text-sm text-gray-600">
          {{ formatTime(recordingTime) }}
        </div>

        <!-- 音量指示器 -->
        <div v-if="isListening" class="mt-2 flex items-center space-x-1">
          <div
            v-for="i in 5"
            :key="i"
            class="volume-bar w-1 bg-blue-400 rounded-full transition-all duration-100"
            :style="{ height: `${Math.random() * 20 + 4}px` }"
          />
        </div>
      </div>

      <!-- 识别结果 -->
      <div v-if="recognizedText" class="mb-4">
        <div class="text-sm text-gray-700 mb-1">识别结果:</div>
        <div class="bg-gray-50 rounded p-3 text-sm">
          {{ recognizedText }}
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
        {{ errorMessage }}
      </div>

      <!-- 操作按钮 -->
      <div class="flex space-x-3">
        <Button
          variant="secondary"
          class="flex-1"
          @click="handleCancel"
        >
          取消
        </Button>
        <Button
          variant="primary"
          class="flex-1"
          :disabled="!recognizedText"
          @click="handleConfirm"
        >
          确认
        </Button>
      </div>

      <!-- 提示信息 -->
      <div class="mt-4 text-center text-xs text-gray-500">
        <p>点击录音按钮开始语音输入</p>
        <p>支持中文、英文等多种语言</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Button from '@/components/base/button/index.vue'
import { useToast } from '@/components/base/toast/useToast'

const emit = defineEmits<{
  close: []
  result: [text: string]
}>()

// 响应式状态
const isListening = ref(false)
const recognizedText = ref('')
const recordingTime = ref(0)
const errorMessage = ref('')

const toast = useToast()

// 计时器
let recordingTimer: NodeJS.Timeout | null = null
let recognition: any = null

// 方法
const toggleRecording = () => {
  if (isListening.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const startRecording = () => {
  // 检查浏览器支持
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    errorMessage.value = '您的浏览器不支持语音识别功能'
    return
  }

  try {
    // 创建语音识别实例
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognition = new SpeechRecognition()

    // 配置语音识别
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'zh-CN'

    // 监听识别结果
    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      recognizedText.value = finalTranscript || interimTranscript
    }

    // 监听错误
    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error)
      errorMessage.value = `语音识别错误: ${event.error}`
      stopRecording()
    }

    // 监听结束
    recognition.onend = () => {
      isListening.value = false
      if (recordingTimer) {
        clearInterval(recordingTimer)
        recordingTimer = null
      }
    }

    // 开始录音
    recognition.start()
    isListening.value = true
    recordingTime.value = 0
    errorMessage.value = ''

    // 开始计时
    recordingTimer = setInterval(() => {
      recordingTime.value++

      // 最大录音时长60秒
      if (recordingTime.value >= 60) {
        stopRecording()
        toast.warning('录音时长已达上限')
      }
    }, 1000)

  } catch (error) {
    console.error('启动语音识别失败:', error)
    errorMessage.value = '启动语音识别失败'
  }
}

const stopRecording = () => {
  if (recognition) {
    recognition.stop()
  }

  isListening.value = false

  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
}

const handleCancel = () => {
  stopRecording()
  emit('close')
}

const handleConfirm = () => {
  if (recognizedText.value.trim()) {
    emit('result', recognizedText.value.trim())
  }
  stopRecording()
  emit('close')
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 生命周期
onMounted(() => {
  // 可以在这里初始化语音识别相关的设置
})

onUnmounted(() => {
  stopRecording()
})
</script>

<style scoped>
.recording-button {
  /* 录音按钮样式 */
}

.volume-bar {
  animation: volume-pulse 0.5s ease-in-out infinite alternate;
}

@keyframes volume-pulse {
  0% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

.voice-input {
  /* 语音输入弹窗样式 */
}
</style>
