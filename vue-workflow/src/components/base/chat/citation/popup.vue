<template>
  <Modal
    v-model:visible="modalVisible"
    :title="resource?.documentName || '引用详情'"
    size="lg"
    @close="handleClose"
  >
    <div v-if="resource" class="space-y-4">
      <!-- 文档信息 -->
      <div class="flex items-center bg-gray-50 rounded-lg p-3">
        <Icon :icon="getResourceIcon(resource.dataSourceType)" class="h-5 w-5 mr-2 text-gray-600" />
        <div class="flex-1">
          <div class="font-medium text-gray-900">{{ resource.documentName }}</div>
          <div class="text-sm text-gray-500">{{ getDataSourceLabel(resource.dataSourceType) }}</div>
        </div>
        <div class="text-sm text-gray-500">
          共 {{ resource.sources.length }} 个片段
        </div>
      </div>

      <!-- 引用片段列表 -->
      <div class="max-h-96 overflow-y-auto space-y-3">
        <div
          v-for="(source, index) in resource.sources"
          :key="index"
          class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
        >
          <!-- 片段标识 -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <div class="flex items-center border border-gray-300 rounded px-2 py-1">
                <Icon icon="ri:hashtag" class="h-3 w-3 mr-1 text-gray-400" />
                <span class="text-xs font-medium text-gray-600">
                  {{ source.segment_position || index + 1 }}
                </span>
              </div>

              <!-- 评分显示 -->
              <div v-if="source.score !== undefined" class="ml-2 flex items-center">
                <Icon icon="ri:star-line" class="h-3 w-3 mr-1 text-yellow-500" />
                <span class="text-xs text-gray-600">
                  {{ Math.round(source.score * 100) }}%
                </span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div v-if="showHitInfo" class="flex items-center space-x-2">
              <button
                class="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                @click="viewDocument(source)"
              >
                <Icon icon="ri:external-link-line" class="h-3 w-3 mr-1" />
                查看文档
              </button>
            </div>
          </div>

          <!-- 片段内容 -->
          <div class="text-sm text-gray-700 leading-relaxed">
            {{ source.content }}
          </div>

          <!-- 统计信息 -->
          <div v-if="showHitInfo && (source.hit_count || source.word_count)"
               class="mt-3 pt-3 border-t border-gray-100">
            <div class="flex items-center space-x-4 text-xs text-gray-500">
              <div v-if="source.hit_count" class="flex items-center">
                <Icon icon="ri:target-line" class="h-3 w-3 mr-1" />
                命中次数: {{ source.hit_count }}
              </div>
              <div v-if="source.word_count" class="flex items-center">
                <Icon icon="ri:text" class="h-3 w-3 mr-1" />
                字数: {{ source.word_count }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!resource.sources.length" class="text-center py-8 text-gray-500">
        <Icon icon="ri:file-line" class="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p>暂无引用片段</p>
      </div>
    </div>

    <template #footer>
      <Button variant="secondary" @click="handleClose">
        关闭
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Modal from '@/components/base/modal/index.vue'
import Button from '@/components/base/button/index.vue'
import type { Resource } from './index.vue'

interface Props {
  visible: boolean
  resource?: Resource
  showHitInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHitInfo: false
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  close: []
}>()

// 计算属性
const modalVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 方法
const getResourceIcon = (dataSourceType: string) => {
  const iconMap: Record<string, string> = {
    'upload_file': 'ri:file-text-line',
    'website': 'ri:global-line',
    'notion': 'ri:notion-line',
    'pdf': 'ri:file-pdf-line',
    'doc': 'ri:file-word-line',
    'txt': 'ri:file-text-line',
    'default': 'ri:file-line'
  }
  return iconMap[dataSourceType] || iconMap.default
}

const getDataSourceLabel = (dataSourceType: string) => {
  const labelMap: Record<string, string> = {
    'upload_file': '上传文件',
    'website': '网站内容',
    'notion': 'Notion页面',
    'pdf': 'PDF文档',
    'doc': 'Word文档',
    'txt': '文本文件',
    'default': '文档'
  }
  return labelMap[dataSourceType] || labelMap.default
}

const viewDocument = (source: any) => {
  // 这里可以实现跳转到文档详情页面的逻辑
  console.log('查看文档:', source)

  // 示例：如果有数据集ID和文档ID，可以构造URL
  if (source.dataset_id && source.document_id) {
    const url = `/datasets/${source.dataset_id}/documents/${source.document_id}`
    // window.open(url, '_blank')
    console.log('文档URL:', url)
  }
}

const handleClose = () => {
  emit('close')
}
</script>
