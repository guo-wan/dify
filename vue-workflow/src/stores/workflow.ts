import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WorkflowRunningData } from '@/utils/types/workflow'

// 获取本地存储的数值，如果不存在则返回默认值
const getLocalStorageNumber = (key: string, defaultValue: number): number => {
  const stored = localStorage.getItem(key)
  return stored ? Number.parseFloat(stored) : defaultValue
}

// 获取本地存储的布尔值，如果不存在则返回默认值
const getLocalStorageBoolean = (key: string, defaultValue: boolean): boolean => {
  const stored = localStorage.getItem(key)
  return stored !== null ? stored === 'true' : defaultValue
}

export const useWorkflowStore = defineStore('workflow', () => {
  // ========== 面板状态 ==========
  const panelWidth = ref(getLocalStorageNumber('workflow-node-panel-width', 420))
  const showFeaturesPanel = ref(false)
  const showWorkflowVersionHistoryPanel = ref(false)
  const showInputsPanel = ref(false)
  const showDebugAndPreviewPanel = ref(false)
  const showVariableInspectPanel = ref(false)
  const initShowLastRunTab = ref(false)
  const showEnvPanel = ref(false)

  // 面板菜单位置
  const panelMenu = ref<{ top: number; left: number } | undefined>(undefined)

  // ========== 布局状态 ==========
  const workflowCanvasWidth = ref<number | undefined>(undefined)
  const workflowCanvasHeight = ref<number | undefined>(undefined)
  const rightPanelWidth = ref<number | undefined>(undefined)
  const nodePanelWidth = ref(getLocalStorageNumber('workflow-node-panel-width', 400))
  const previewPanelWidth = ref(getLocalStorageNumber('debug-and-preview-panel-width', 400))
  const otherPanelWidth = ref(400)
  const bottomPanelWidth = ref(480)
  const bottomPanelHeight = ref(324)
  const variableInspectPanelHeight = ref(getLocalStorageNumber('workflow-variable-inpsect-panel-height', 320))
  const maximizeCanvas = ref(getLocalStorageBoolean('workflow-canvas-maximize', false))

  // ========== 工作流运行状态 ==========
  const workflowRunningData = ref<WorkflowRunningData | null>(null)
  const isRestoring = ref(false)

  // ========== 面板状态的 Actions ==========
  const setShowFeaturesPanel = (show: boolean) => {
    showFeaturesPanel.value = show
  }

  const setShowWorkflowVersionHistoryPanel = (show: boolean) => {
    showWorkflowVersionHistoryPanel.value = show
  }

  const setShowInputsPanel = (show: boolean) => {
    showInputsPanel.value = show
  }

  const setShowDebugAndPreviewPanel = (show: boolean) => {
    showDebugAndPreviewPanel.value = show
  }

  const setShowVariableInspectPanel = (show: boolean) => {
    showVariableInspectPanel.value = show
  }

  const setInitShowLastRunTab = (show: boolean) => {
    initShowLastRunTab.value = show
  }

  const setShowEnvPanel = (show: boolean) => {
    showEnvPanel.value = show
  }

  const setPanelMenu = (menu: { top: number; left: number } | undefined) => {
    panelMenu.value = menu
  }

  // ========== 布局状态的 Actions ==========
  const setWorkflowCanvasWidth = (width: number) => {
    workflowCanvasWidth.value = width
  }

  const setWorkflowCanvasHeight = (height: number) => {
    workflowCanvasHeight.value = height
  }

  const setRightPanelWidth = (width: number) => {
    rightPanelWidth.value = width
  }

  const setNodePanelWidth = (width: number) => {
    nodePanelWidth.value = width
    localStorage.setItem('workflow-node-panel-width', width.toString())
  }

  const setPreviewPanelWidth = (width: number) => {
    previewPanelWidth.value = width
    localStorage.setItem('debug-and-preview-panel-width', width.toString())
  }

  const setOtherPanelWidth = (width: number) => {
    otherPanelWidth.value = width
  }

  const setBottomPanelWidth = (width: number) => {
    bottomPanelWidth.value = width
  }

  const setBottomPanelHeight = (height: number) => {
    bottomPanelHeight.value = height
  }

  const setVariableInspectPanelHeight = (height: number) => {
    variableInspectPanelHeight.value = height
    localStorage.setItem('workflow-variable-inpsect-panel-height', height.toString())
  }

  const setMaximizeCanvas = (maximize: boolean) => {
    maximizeCanvas.value = maximize
    localStorage.setItem('workflow-canvas-maximize', maximize.toString())
  }

  // ========== 工作流状态的 Actions ==========
  const setWorkflowRunningData = (data: WorkflowRunningData | null) => {
    workflowRunningData.value = data
  }

  const setIsRestoring = (restoring: boolean) => {
    isRestoring.value = restoring
  }

  // ========== Computed ==========
  // 计算节点面板宽度 (rightPanelWidth - otherPanelWidth = nodePanelWidth)
  const computedNodePanelWidth = computed(() => {
    if (rightPanelWidth.value && otherPanelWidth.value) {
      return rightPanelWidth.value - otherPanelWidth.value
    }
    return nodePanelWidth.value
  })

  return {
    // ========== 面板状态 ==========
    panelWidth,
    showFeaturesPanel,
    showWorkflowVersionHistoryPanel,
    showInputsPanel,
    showDebugAndPreviewPanel,
    showVariableInspectPanel,
    initShowLastRunTab,
    showEnvPanel,
    panelMenu,

    // ========== 布局状态 ==========
    workflowCanvasWidth,
    workflowCanvasHeight,
    rightPanelWidth,
    nodePanelWidth,
    previewPanelWidth,
    otherPanelWidth,
    bottomPanelWidth,
    bottomPanelHeight,
    variableInspectPanelHeight,
    maximizeCanvas,

    // ========== 工作流状态 ==========
    workflowRunningData,
    isRestoring,

    // ========== Computed ==========
    computedNodePanelWidth,

    // ========== Actions ==========
    setShowFeaturesPanel,
    setShowWorkflowVersionHistoryPanel,
    setShowInputsPanel,
    setShowDebugAndPreviewPanel,
    setShowVariableInspectPanel,
    setInitShowLastRunTab,
    setShowEnvPanel,
    setPanelMenu,
    setWorkflowCanvasWidth,
    setWorkflowCanvasHeight,
    setRightPanelWidth,
    setNodePanelWidth,
    setPreviewPanelWidth,
    setOtherPanelWidth,
    setBottomPanelWidth,
    setBottomPanelHeight,
    setVariableInspectPanelHeight,
    setMaximizeCanvas,
    setWorkflowRunningData,
    setIsRestoring,
  }
})
