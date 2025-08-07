<template>
  <div
    class="workflow-preview relative flex h-full flex-col rounded-l-2xl border-[0.5px] border-gray-200 bg-white shadow-xl"
    :style="{ width: `${panelWidth}px` }"
  >
    <!-- 拖拽调整宽度的把手 -->
    <div
      class="absolute bottom-0 left-[3px] top-1/2 z-50 h-6 w-[3px] cursor-col-resize rounded bg-gray-300"
      @mousedown="startResizing"
    />

    <!-- 头部 -->
    <div class="flex items-center justify-between p-4 pb-1 text-base font-semibold text-gray-900">
      {{ `测试运行${formatWorkflowRunIdentifier(workflowRunningData?.result.finished_at)}` }}
      <div class="cursor-pointer p-1" @click="handleCancelDebugAndPreviewPanel">
        <Icon icon="ri:close-line" class="h-4 w-4 text-gray-500" />
      </div>
    </div>

    <!-- 内容区 -->
    <div class="relative flex grow flex-col">
      <!-- 标签页 -->
      <div class="flex shrink-0 items-center border-b-[0.5px] border-gray-200 px-4">
        <div
          v-if="showInputsPanel"
          :class="[
            'mr-6 cursor-pointer border-b-2 border-transparent py-3 text-[13px] font-semibold leading-[18px] text-gray-500',
            currentTab === 'INPUT' && '!border-blue-500 text-gray-700'
          ]"
          @click="switchTab('INPUT')"
        >
          输入
        </div>

        <div
          :class="[
            'mr-6 cursor-pointer border-b-2 border-transparent py-3 text-[13px] font-semibold leading-[18px] text-gray-500',
            currentTab === 'RESULT' && '!border-blue-500 text-gray-700',
            !workflowRunningData && '!cursor-not-allowed opacity-30'
          ]"
          @click="() => {
            if (!workflowRunningData) return
            switchTab('RESULT')
          }"
        >
          结果
        </div>

        <div
          :class="[
            'mr-6 cursor-pointer border-b-2 border-transparent py-3 text-[13px] font-semibold leading-[18px] text-gray-500',
            currentTab === 'DETAIL' && '!border-blue-500 text-gray-700',
            !workflowRunningData && '!cursor-not-allowed opacity-30'
          ]"
          @click="() => {
            if (!workflowRunningData) return
            switchTab('DETAIL')
          }"
        >
          详情
        </div>

        <div
          :class="[
            'mr-6 cursor-pointer border-b-2 border-transparent py-3 text-[13px] font-semibold leading-[18px] text-gray-500',
            currentTab === 'TRACING' && '!border-blue-500 text-gray-700',
            !workflowRunningData && '!cursor-not-allowed opacity-30'
          ]"
          @click="() => {
            if (!workflowRunningData) return
            switchTab('TRACING')
          }"
        >
          跟踪
        </div>
      </div>

      <!-- 内容面板 -->
      <div :class="[
        'h-0 grow overflow-y-auto rounded-b-2xl bg-white',
        (currentTab === 'RESULT' || currentTab === 'TRACING') && '!bg-gray-50'
      ]">
        <!-- 输入面板 -->
        <InputsPanel
          v-if="currentTab === 'INPUT' && showInputsPanel"
          @run="() => switchTab('RESULT')"
        />

        <!-- 结果面板 -->
        <template v-if="currentTab === 'RESULT'">
          <ResultText
            :is-running="isRunning"
            :outputs="workflowRunningData?.resultText"
            :all-files="workflowRunningData?.result?.files"
            :error="workflowRunningData?.result?.error"
            @click="() => switchTab('DETAIL')"
          />

          <!-- 复制按钮 -->
          <Button
            v-if="workflowRunningData?.result.status === WorkflowRunningStatus.Succeeded &&
                  workflowRunningData?.resultText &&
                  typeof workflowRunningData?.resultText === 'string'"
            class="mb-4 ml-4 space-x-1"
            variant="secondary"
            size="small"
            @click="handleCopyResult"
          >
            <Icon icon="ri:clipboard-line" class="h-3.5 w-3.5" />
            <div>复制</div>
          </Button>
        </template>

        <!-- 详情面板 -->
        <ResultPanel
          v-if="currentTab === 'DETAIL'"
          :inputs="workflowRunningData?.result?.inputs"
          :outputs="workflowRunningData?.result?.outputs"
          :status="workflowRunningData?.result?.status || ''"
          :error="workflowRunningData?.result?.error"
          :elapsed_time="workflowRunningData?.result?.elapsed_time"
          :total_tokens="workflowRunningData?.result?.total_tokens"
          :created_at="workflowRunningData?.result?.created_at"
          :created_by="(workflowRunningData?.result?.created_by as any)?.name"
          :steps="workflowRunningData?.result?.total_steps"
          :exception-counts="workflowRunningData?.result?.exceptions_count"
        />

        <!-- 无数据的详情面板 -->
        <div
          v-if="currentTab === 'DETAIL' && !workflowRunningData?.result"
          class="flex h-full items-center justify-center bg-white"
        >
          <Loading />
        </div>

        <!-- 跟踪面板 -->
        <TracingPanel
          v-if="currentTab === 'TRACING'"
          class-name="bg-gray-50"
          :list="workflowRunningData?.tracing || []"
        />

        <!-- 无数据的跟踪面板 -->
        <div
          v-if="currentTab === 'TRACING' && !workflowRunningData?.tracing?.length"
          class="flex h-full items-center justify-center !bg-gray-50"
        >
          <Loading />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkflowStore } from '@/stores/workflow'
import { useWorkflowInteractions } from '@/composables/useWorkflowInteractions'
import { formatWorkflowRunIdentifier } from '@/utils/workflow'
import { WorkflowRunningStatus } from '@/utils/types/workflow'
import copy from 'copy-to-clipboard'
import { useToast } from '@/components/base/toast/useToast'

// 组件引入
import InputsPanel from './inputs-panel.vue'
import ResultText from '../run/result-text.vue'
import ResultPanel from '../run/result-panel.vue'
import TracingPanel from '../run/tracing-panel.vue'
import Button from '@/components/base/button/index.vue'
import Loading from '@/components/base/loading/index.vue'

// 真实的InputsPanel组件

const store = useWorkflowStore()
const toast = useToast()
const { handleCancelDebugAndPreviewPanel } = useWorkflowInteractions()

// 响应式状态
const {
  workflowRunningData,
  showInputsPanel,
  workflowCanvasWidth,
  previewPanelWidth,
  showDebugAndPreviewPanel
} = storeToRefs(store)

const currentTab = ref(showInputsPanel.value ? 'INPUT' : 'TRACING')
const isResizing = ref(false)

// 计算属性
const panelWidth = computed(() => previewPanelWidth.value)
const isRunning = computed(() =>
  workflowRunningData.value?.result?.status === WorkflowRunningStatus.Running ||
  !workflowRunningData.value?.result
)

// 方法
const switchTab = (tab: string) => {
  currentTab.value = tab
}

const startResizing = (e: MouseEvent) => {
  e.preventDefault()
  isResizing.value = true
}

const stopResizing = () => {
  isResizing.value = false
}

const resize = (e: MouseEvent) => {
  if (isResizing.value) {
    const newWidth = window.innerWidth - e.clientX
    const reservedCanvasWidth = 400
    const maxAllowed = workflowCanvasWidth.value
      ? (workflowCanvasWidth.value - reservedCanvasWidth)
      : 1024

    if (newWidth >= 400 && newWidth <= maxAllowed)
      store.setPreviewPanelWidth(newWidth)
  }
}

const handleCopyResult = () => {
  const content = workflowRunningData.value?.resultText
  if (typeof content === 'string') {
    copy(content)
  } else {
    copy(JSON.stringify(content))
  }
  toast.success('复制成功')
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('mousemove', resize)
  window.addEventListener('mouseup', stopResizing)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', resize)
  window.removeEventListener('mouseup', stopResizing)
})

// 监听器
watch([showDebugAndPreviewPanel, showInputsPanel], () => {
  if (showDebugAndPreviewPanel.value && showInputsPanel.value)
    currentTab.value = 'INPUT'
})

watch(() => workflowRunningData.value, (newVal) => {
  if ((newVal?.result.status === WorkflowRunningStatus.Succeeded ||
       newVal?.result.status === WorkflowRunningStatus.Failed) &&
      !newVal.resultText &&
      !newVal.result.files?.length)
    switchTab('DETAIL')
}, { deep: true })
</script>

<style scoped>
.workflow-preview {
  /* 可以添加特定样式 */
}
</style>
