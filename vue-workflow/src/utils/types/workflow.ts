// 工作流运行状态
export enum WorkflowRunningStatus {
  Running = 'running',
  Succeeded = 'succeeded',
  Failed = 'failed'
}

// 基础节点类型
export enum BlockEnum {
  Start = 'start',
  End = 'end',
  LLM = 'llm',
  KnowledgeRetrieval = 'knowledge-retrieval',
  Code = 'code',
  TemplateTransform = 'template-transform',
  QuestionClassifier = 'question-classifier',
  HttpRequest = 'http-request',
  Tool = 'tool',
  ParameterExtractor = 'parameter-extractor',
  Iteration = 'iteration',
  Agent = 'agent',
  DocExtractor = 'doc-extractor',
  Loop = 'loop',
  IfElse = 'if-else',
  VariableAggregator = 'variable-aggregator',
  Assigner = 'assigner'
}

// 工作流运行数据接口
export interface WorkflowRunningData {
  result: {
    status: WorkflowRunningStatus
    finished_at?: number
    error?: string
    files?: any[]
    inputs?: any
    outputs?: any
    elapsed_time?: number
    total_tokens?: number
    created_at?: string
    created_by?: {
      name: string
    }
    total_steps?: number
    exceptions_count?: number
  }
  resultText?: string | object
  tracing?: any[]
}

// 基础节点接口
export interface Node {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    selected?: boolean
    [key: string]: any
  }
}

// 边接口
export interface Edge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  [key: string]: any
}

// 面板属性接口
export interface PanelProps {
  components?: {
    left?: any
    right?: any
  }
}
