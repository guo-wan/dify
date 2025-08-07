import { useWorkflowStore } from '@/stores/workflow'

export function useWorkflowInteractions() {
  const store = useWorkflowStore()

  const handleCancelDebugAndPreviewPanel = () => {
    store.setShowDebugAndPreviewPanel(false)
  }

  const handleShowDebugAndPreviewPanel = () => {
    store.setShowDebugAndPreviewPanel(true)
  }

  const handleToggleEnvPanel = () => {
    store.setShowEnvPanel(!store.showEnvPanel)
  }

  const handleToggleInputsPanel = () => {
    store.setShowInputsPanel(!store.showInputsPanel)
  }

  return {
    handleCancelDebugAndPreviewPanel,
    handleShowDebugAndPreviewPanel,
    handleToggleEnvPanel,
    handleToggleInputsPanel
  }
}
