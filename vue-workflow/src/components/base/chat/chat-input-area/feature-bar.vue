<template>
  <div class="feature-bar flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
    <!-- 功能选项 -->
    <div class="flex items-center space-x-2">
      <!-- 文件上传功能 -->
      <div class="feature-item">
        <input
          id="enable-file-upload"
          v-model="localFeatures.fileUpload"
          type="checkbox"
          class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          :disabled="disabled"
          @change="handleFeatureChange"
        />
        <label for="enable-file-upload" class="ml-2 text-sm text-gray-700">
          文件上传
        </label>
      </div>

      <!-- 语音输入功能 -->
      <div class="feature-item">
        <input
          id="enable-voice-input"
          v-model="localFeatures.voiceInput"
          type="checkbox"
          class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          :disabled="disabled"
          @change="handleFeatureChange"
        />
        <label for="enable-voice-input" class="ml-2 text-sm text-gray-700">
          语音输入
        </label>
      </div>

      <!-- 图片上传功能 -->
      <div class="feature-item">
        <input
          id="enable-image-upload"
          v-model="localFeatures.imageUpload"
          type="checkbox"
          class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          :disabled="disabled"
          @change="handleFeatureChange"
        />
        <label for="enable-image-upload" class="ml-2 text-sm text-gray-700">
          图片上传
        </label>
      </div>
    </div>

    <!-- 折叠/展开按钮 -->
    <button
      class="feature-toggle p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
      @click="toggleExpanded"
      title="折叠/展开功能栏"
    >
      <Icon
        :icon="isExpanded ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'"
        class="h-4 w-4"
      />
    </button>
  </div>

  <!-- 展开的详细设置 -->
  <div v-if="isExpanded" class="feature-details mt-2 p-3 bg-white border border-gray-200 rounded-lg space-y-3">
    <!-- 文件上传设置 -->
    <div v-if="localFeatures.fileUpload" class="setting-group">
      <div class="text-sm font-medium text-gray-700 mb-2">文件上传设置</div>
      <div class="space-y-2">
        <label class="flex items-center">
          <input
            v-model="fileSettings.allowMultiple"
            type="checkbox"
            class="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="ml-2 text-xs text-gray-600">允许多文件上传</span>
        </label>
        <div class="text-xs text-gray-500">
          支持格式: PDF, Word, TXT, 图片
        </div>
      </div>
    </div>

    <!-- 语音输入设置 -->
    <div v-if="localFeatures.voiceInput" class="setting-group">
      <div class="text-sm font-medium text-gray-700 mb-2">语音输入设置</div>
      <div class="space-y-2">
        <div class="flex items-center space-x-4">
          <label class="flex items-center">
            <input
              v-model="voiceSettings.language"
              value="zh-CN"
              type="radio"
              name="voice-language"
              class="h-3 w-3 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span class="ml-1 text-xs text-gray-600">中文</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="voiceSettings.language"
              value="en-US"
              type="radio"
              name="voice-language"
              class="h-3 w-3 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span class="ml-1 text-xs text-gray-600">英文</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 图片上传设置 -->
    <div v-if="localFeatures.imageUpload" class="setting-group">
      <div class="text-sm font-medium text-gray-700 mb-2">图片上传设置</div>
      <div class="space-y-2">
        <label class="flex items-center">
          <input
            v-model="imageSettings.autoResize"
            type="checkbox"
            class="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="ml-2 text-xs text-gray-600">自动压缩大图片</span>
        </label>
        <div class="text-xs text-gray-500">
          最大尺寸: 1920x1080, 支持 JPG, PNG, GIF
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

interface Features {
  fileUpload: boolean
  voiceInput: boolean
  imageUpload: boolean
}

interface Props {
  disabled?: boolean
  features?: Partial<Features>
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  features: () => ({
    fileUpload: true,
    voiceInput: true,
    imageUpload: true
  })
})

const emit = defineEmits<{
  click: [state: boolean]
  change: [features: Features]
}>()

// 响应式状态
const isExpanded = ref(false)

const localFeatures = reactive<Features>({
  fileUpload: props.features.fileUpload ?? true,
  voiceInput: props.features.voiceInput ?? true,
  imageUpload: props.features.imageUpload ?? true
})

const fileSettings = reactive({
  allowMultiple: true,
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'gif']
})

const voiceSettings = reactive({
  language: 'zh-CN',
  autoStop: true,
  maxDuration: 60
})

const imageSettings = reactive({
  autoResize: true,
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8
})

// 方法
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  emit('click', isExpanded.value)
}

const handleFeatureChange = () => {
  emit('change', { ...localFeatures })
}

// 监听功能变化
watch(
  () => localFeatures,
  (newFeatures) => {
    emit('change', { ...newFeatures })
  },
  { deep: true }
)

// 监听外部props变化
watch(
  () => props.features,
  (newFeatures) => {
    if (newFeatures) {
      Object.assign(localFeatures, newFeatures)
    }
  },
  { deep: true }
)
</script>

<style scoped>
.feature-bar {
  /* 功能栏样式 */
}

.feature-item {
  /* 功能项样式 */
  display: flex;
  align-items: center;
}

.feature-details {
  /* 详细设置样式 */
}

.setting-group {
  /* 设置组样式 */
}
</style>
