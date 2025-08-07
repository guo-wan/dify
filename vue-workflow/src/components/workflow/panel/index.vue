<template>
  <div
    ref="rightPanelRef"
    tabindex="-1"
    :class="['panel absolute bottom-1 right-0 top-14 z-10 flex outline-none']"
    :key="String(isRestoring)"
  >
    <slot name="left" />
    <NodePanel v-if="selectedNode" v-bind="selectedNode" />
    <div class="relative" ref="otherPanelRef">
      <slot name="right" />
      <EnvPanel v-if="showEnvPanel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkflowStore } from '@/stores/workflow'
import { useResizeObserver } from '@vueuse/core'
import type { PanelProps } from '@/utils/types/workflow'

// 暂时创建占位组件
const NodePanel = {
  template: '<div class="bg-white border-l border-gray-200 w-96 p-4">Node Panel Placeholder</div>'
}

import EnvPanel from './env-panel/index.vue'

defineProps<PanelProps>()

const store = useWorkflowStore()
const {
  showEnvPanel,
  isRestoring,
  showWorkflowVersionHistoryPanel,
  workflowCanvasWidth,
  previewPanelWidth
} = storeToRefs(store)

// 模拟 selected node - 在实际项目中这会来自 vue-flow
const selectedNode = computed(() => {
  // 这里应该从vue-flow或其他状态获取选中的节点
  // 暂时返回null
  return null
})

// 使用 VueUse 的 useResizeObserver 替代自定义 hook
const rightPanelRef = ref<HTMLElement>()
const otherPanelRef = ref<HTMLElement>()

useResizeObserver(rightPanelRef, (entries) => {
  const entry = entries[0]
  if (entry) {
    store.setRightPanelWidth(entry.contentRect.width)
  }
})

useResizeObserver(otherPanelRef, (entries) => {
  const entry = entries[0]
  if (entry) {
    store.setOtherPanelWidth(entry.contentRect.width)
  }
})

// 监听面板宽度变化，当选中节点且预览面板过宽时进行调整
watch([selectedNode, workflowCanvasWidth, previewPanelWidth], () => {
  if (!selectedNode.value || !workflowCanvasWidth.value)
    return

  const reservedCanvasWidth = 400 // 为画布保留的最小可见宽度
  const minNodePanelWidth = 400
  const maxAllowed = Math.max(workflowCanvasWidth.value - reservedCanvasWidth - minNodePanelWidth, 400)

  if (previewPanelWidth.value > maxAllowed)
    store.setPreviewPanelWidth(maxAllowed)
})
</script>

<style scoped>
.panel {
  /* 可以在这里添加特定的面板样式 */
}
</style>
