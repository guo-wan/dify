import { BlockEnum } from './types/workflow'

/**
 * 检测平台是否为Mac
 */
export const isMac = (): boolean => {
  return navigator.userAgent.toUpperCase().includes('MAC')
}

/**
 * 特殊按键名称映射
 */
const specialKeysNameMap: Record<string, string | undefined> = {
  ctrl: '⌘',
  alt: '⌥',
  shift: '⇧',
}

/**
 * 根据系统获取键盘按键名称
 */
export const getKeyboardKeyNameBySystem = (key: string): string => {
  if (isMac())
    return specialKeysNameMap[key] || key

  return key
}

/**
 * 特殊按键代码映射
 */
const specialKeysCodeMap: Record<string, string | undefined> = {
  ctrl: 'meta',
}

/**
 * 根据系统获取键盘按键代码
 */
export const getKeyboardKeyCodeBySystem = (key: string): string => {
  if (isMac())
    return specialKeysCodeMap[key] || key

  return key
}

/**
 * 检查事件目标是否为输入区域
 */
export const isEventTargetInputArea = (target: HTMLElement): boolean => {
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
    return true

  if (target.contentEditable === 'true')
    return true

  return false
}

/**
 * 格式化工作流运行标识符
 * @param finishedAt - Unix时间戳（秒）
 * @param fallbackText - 当finishedAt不可用时显示的文本（默认：'运行中'）
 * @returns 格式化的字符串，如 " (14:30:25)" 或 " (运行中)"
 */
export const formatWorkflowRunIdentifier = (finishedAt?: number, fallbackText = '运行中'): string => {
  if (!finishedAt)
    return ` (${fallbackText})`

  const date = new Date(finishedAt * 1000)
  const timeStr = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  return ` (${timeStr})`
}

/**
 * 检查节点是否可以单独运行
 */
export const canRunBySingle = (nodeType: BlockEnum, isChildNode: boolean): boolean => {
  // 子节点表示在迭代或循环中。设置值到迭代（或循环）可能会导致后端变量不存在问题。
  if (isChildNode && nodeType === BlockEnum.Assigner)
    return false

  return nodeType === BlockEnum.LLM
    || nodeType === BlockEnum.KnowledgeRetrieval
    || nodeType === BlockEnum.Code
    || nodeType === BlockEnum.TemplateTransform
    || nodeType === BlockEnum.QuestionClassifier
    || nodeType === BlockEnum.HttpRequest
    || nodeType === BlockEnum.Tool
    || nodeType === BlockEnum.ParameterExtractor
    || nodeType === BlockEnum.Iteration
    || nodeType === BlockEnum.Agent
    || nodeType === BlockEnum.DocExtractor
    || nodeType === BlockEnum.Loop
    || nodeType === BlockEnum.Start
    || nodeType === BlockEnum.IfElse
    || nodeType === BlockEnum.VariableAggregator
    || nodeType === BlockEnum.Assigner
}

/**
 * 生成UUID
 */
export const generateUUID = (): string => {
  return crypto.randomUUID()
}
