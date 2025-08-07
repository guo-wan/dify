<template>
  <div class="-mb-1 mt-3">
    <!-- 标题 -->
    <div class="mb-2 flex items-center text-xs font-medium text-gray-500">
      <Icon icon="ri:bookmark-line" class="h-3 w-3 mr-1" />
      引用文档 ({{ resourcesLength }})
    </div>

    <!-- 引用资源列表 -->
    <div class="relative flex flex-wrap gap-1" :class="containerClassName">
      <!-- 显示的资源 -->
      <template v-for="(resource, index) in displayResources" :key="resource.documentId">
        <div
          ref="resourceRefs"
          class="citation-item flex items-center bg-blue-50 text-blue-800 text-xs rounded px-2 py-1 cursor-pointer hover:bg-blue-100 transition-colors"
          @click="handleResourceClick(resource)"
        >
          <Icon :icon="getResourceIcon(resource.dataSourceType)" class="h-3 w-3 mr-1 flex-shrink-0" />
          <span class="truncate max-w-[120px]">{{ resource.documentName }}</span>
          <span v-if="resource.sources.length > 1" class="ml-1 bg-blue-200 text-blue-900 px-1 rounded-full text-xs">
            {{ resource.sources.length }}
          </span>
        </div>
      </template>

      <!-- 更多按钮 -->
      <button
        v-if="hasMore"
        class="citation-more flex items-center bg-gray-100 text-gray-600 text-xs rounded px-2 py-1 hover:bg-gray-200 transition-colors"
        @click="toggleShowMore"
      >
        <span>{{ showMore ? '收起' : `+${hiddenCount}` }}</span>
        <Icon
          :icon="showMore ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'"
          class="h-3 w-3 ml-1"
        />
      </button>
    </div>

    <!-- 引用详情弹窗 -->
    <CitationPopup
      v-model:visible="showPopup"
      :resource="selectedResource"
      :show-hit-info="showHitInfo"
      @close="handleClosePopup"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import CitationPopup from './popup.vue'

export interface CitationItem {
  id: string
  document_id: string
  document_name: string
  data_source_type: string
  content: string
  hit_count?: number
  word_count?: number
  segment_position?: number
  score?: number
}

export interface Resource {
  documentId: string
  documentName: string
  dataSourceType: string
  sources: CitationItem[]
}

interface Props {
  data: CitationItem[]
  showHitInfo?: boolean
  containerClassName?: string
}

const props = withDefaults(defineProps<Props>(), {
  showHitInfo: false,
  containerClassName: 'chat-answer-container'
})

// 响应式状态
const resourceRefs = ref<HTMLElement[]>([])
const limitNumberInOneLine = ref(0)
const showMore = ref(false)
const showPopup = ref(false)
const selectedResource = ref<Resource>()

// 计算属性
const resources = computed<Resource[]>(() => {
  return props.data.reduce((prev: Resource[], next) => {
    const documentId = next.document_id
    const documentName = next.document_name
    const dataSourceType = next.data_source_type
    const documentIndex = prev.findIndex(i => i.documentId === documentId)

    if (documentIndex > -1) {
      prev[documentIndex].sources.push(next)
    } else {
      prev.push({
        documentId,
        documentName,
        dataSourceType,
        sources: [next],
      })
    }

    return prev
  }, [])
})

const resourcesLength = computed(() => resources.value.length)

const displayResources = computed(() => {
  if (showMore.value || limitNumberInOneLine.value === 0) {
    return resources.value
  }
  return resources.value.slice(0, limitNumberInOneLine.value)
})

const hasMore = computed(() => {
  return limitNumberInOneLine.value > 0 && resources.value.length > limitNumberInOneLine.value
})

const hiddenCount = computed(() => {
  return resources.value.length - limitNumberInOneLine.value
})

// 方法
const getResourceIcon = (dataSourceType: string) => {
  const iconMap: Record<string, string> = {
    'upload_file': 'ri:file-text-line',
    'website': 'ri:global-line',
    'notion': 'ri:notion-line',
    'pdf': 'ri:file-pdf-line',
    'doc': 'ri:file-word-line',
    'default': 'ri:file-line'
  }
  return iconMap[dataSourceType] || iconMap.default
}

const handleResourceClick = (resource: Resource) => {
  selectedResource.value = resource
  showPopup.value = true
}

const handleClosePopup = () => {
  showPopup.value = false
  selectedResource.value = undefined
}

const toggleShowMore = () => {
  showMore.value = !showMore.value
}

const handleAdjustResourcesLayout = async () => {
  await nextTick()

  if (!resourceRefs.value.length) return

  const container = document.querySelector(`.${props.containerClassName}`)
  if (!container) return

  const containerWidth = container.clientWidth - 40
  let totalWidth = 0

  for (let i = 0; i < resources.value.length; i++) {
    const element = resourceRefs.value[i]
    if (!element) continue

    totalWidth += element.clientWidth

    if (totalWidth + i * 4 > containerWidth) {
      totalWidth -= element.clientWidth

      if (totalWidth + 34 > containerWidth) {
        limitNumberInOneLine.value = i - 1
      } else {
        limitNumberInOneLine.value = i
      }

      break
    } else {
      limitNumberInOneLine.value = i + 1
    }
  }
}

// 生命周期
onMounted(() => {
  handleAdjustResourcesLayout()
})
</script>

<style scoped>
.citation-item {
  /* 引用项样式 */
}

.citation-more {
  /* 更多按钮样式 */
}
</style>
