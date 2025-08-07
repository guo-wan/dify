<template>
  <div class="bg-gray-50">
    <!-- 运行中状态 -->
    <div v-if="isRunning && !outputs" class="pl-[26px] pt-4">
      <Loading />
      <span class="ml-2 text-sm text-gray-600">正在运行...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="!isRunning && error" class="px-4 py-2">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <Icon icon="ri:error-warning-line" class="h-5 w-5 text-red-500 mr-2" />
          <span class="text-red-700 font-medium">执行失败</span>
        </div>
        <div class="mt-2 text-red-600 text-sm">{{ error }}</div>
      </div>
    </div>

    <!-- 空结果状态 -->
    <div
      v-else-if="!isRunning && !outputs && !error && !allFiles?.length"
      class="mt-[120px] flex flex-col items-center px-4 py-2 text-[13px] leading-[18px] text-gray-500"
    >
      <Icon icon="ri:file-text-line" class="h-6 w-6 text-gray-400 mb-2" />
      <div class="mr-2">暂无结果</div>
      <div>
        请点击
        <span @click="$emit('click')" class="cursor-pointer text-blue-600 hover:text-blue-700">
          详情
        </span>
        查看执行信息
      </div>
    </div>

    <!-- 有结果时显示 -->
    <template v-else-if="outputs || allFiles?.length">
      <!-- 文本输出 -->
      <div v-if="outputs" class="px-4 py-2">
        <div class="prose prose-sm max-w-none">
          <div v-if="typeof outputs === 'string'" v-html="formatMarkdown(outputs)" />
          <pre v-else class="bg-gray-100 p-3 rounded text-sm overflow-auto">{{ JSON.stringify(outputs, null, 2) }}</pre>
        </div>
      </div>

      <!-- 文件输出 -->
      <div v-if="allFiles?.length" class="space-y-4">
        <div
          v-for="item in allFiles"
          :key="item.varName"
          class="text-xs flex flex-col gap-1 px-4 py-2"
        >
          <div class="py-1 text-gray-500">{{ item.varName }}</div>
          <div class="space-y-2">
            <div
              v-for="file in item.list"
              :key="file.id"
              class="flex items-center justify-between bg-white border border-gray-200 rounded p-2"
            >
              <div class="flex items-center">
                <Icon icon="ri:file-line" class="h-4 w-4 text-gray-400 mr-2" />
                <span class="text-sm">{{ file.name }}</span>
              </div>
              <button class="text-blue-600 hover:text-blue-700 text-sm">
                下载
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import Loading from '@/components/base/loading/index.vue'
import { marked } from 'marked'

interface ResultTextProps {
  isRunning?: boolean
  outputs?: any
  error?: string
  allFiles?: Array<{
    varName: string
    list: Array<{
      id: string
      name: string
      url?: string
    }>
  }>
}

withDefaults(defineProps<ResultTextProps>(), {
  isRunning: false
})

defineEmits<{
  click: []
}>()

const formatMarkdown = (content: string): string => {
  try {
    return marked(content)
  } catch {
    return content
  }
}
</script>
