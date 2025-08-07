export interface ChatItem {
  id: string
  content: string
  isAnswer: boolean
  message_files?: Array<{
    id: string
    name: string
    url?: string
    type?: string
    size?: number
  }>
  citation?: Array<{
    id: string
    title: string
    content: string
    url?: string
  }>
  agent_thoughts?: Array<{
    id: string
    tool?: string
    thought: string
    observation?: string
    tool_input?: any
    tool_output?: any
  }>
  workflowProcess?: Array<{
    id: string
    title: string
    status: 'succeeded' | 'failed' | 'running' | 'pending'
    elapsed_time?: number
    error?: string
  }>
  allFiles?: Array<{
    varName: string
    list: Array<{
      id: string
      name: string
      url?: string
      type?: string
      size?: number
    }>
  }>
  annotation?: {
    id: string
    content: string
    authorName?: string
  }
  more?: {
    time: number
    tokens: number
    latency?: number
  }
  prevSibling?: string
  nextSibling?: string
  siblingIndex?: number
  siblingCount?: number
}

export interface ChatConfig {
  opening_statement?: string
  suggested_questions?: string[]
  speech_to_text?: {
    enabled: boolean
  }
  text_to_speech?: {
    enabled: boolean
    voice?: string
    language?: string
  }
  retriever_resource?: {
    enabled: boolean
  }
  sensitive_word_avoidance?: {
    enabled: boolean
  }
  more_like_this?: {
    enabled: boolean
  }
}

export interface Theme {
  primaryColor: string
  backgroundColor: string
  textColor: string
  chatBubbleColorUser: string
  chatBubbleColorAssistant: string
  chatBubbleTextColorUser: string
  chatBubbleTextColorAssistant: string
}

export type LoadingAnimType = 'text' | 'avatar'
