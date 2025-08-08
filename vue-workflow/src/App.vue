<script setup>
import { ref } from 'vue'
import { useWorkflowStore } from './stores/workflow'
import Loading from './components/base/loading/index.vue'
import LoadingAnim from './components/base/chat/loading-anim/index.vue'
import WorkflowPreview from './components/workflow/panel/workflow-preview.vue'
import EnvPanel from './components/workflow/panel/env-panel/index.vue'
import ChatRecord from './components/workflow/panel/chat-record/index.vue'
import ChatVariablePanel from './components/workflow/panel/chat-variable-panel/index.vue'
import DebugAndPreview from './components/workflow/panel/debug-and-preview/index.vue'
import VersionHistoryPanel from './components/workflow/panel/version-history-panel/index.vue'
import ResultText from './components/workflow/run/result-text.vue'
import Question from './components/base/chat/question/index.vue'
import Answer from './components/base/chat/answer/index.vue'
import Citation from './components/base/chat/citation/index.vue'
import ChatInputArea from './components/base/chat/chat-input-area/index.vue'
import Thought from './components/base/chat/thought/index.vue'
import ContentSwitch from './components/base/chat/content-switch/index.vue'
import ChatContext from './components/base/chat/context/index.vue'
import { useToast } from './components/base/toast/useToast'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { WorkflowRunningStatus } from './utils/types/workflow'

const store = useWorkflowStore()
const toast = useToast()

// 额外的状态控制
const showChatRecord = ref(false)
const showChatVariable = ref(false)
const showDebugAndPreview = ref(false)
const showVersionHistory = ref(false)

const showToast = (type) => {
  const messages = {
    success: '操作成功！',
    error: '操作失败！',
    warning: '警告信息！',
    info: '提示信息！'
  }

  toast[type](messages[type])
}

// 切换聊天组件显示
const toggleChatRecord = () => {
  if (showChatRecord.value) {
    showChatRecord.value = false
  } else {
    showChatRecord.value = true
    showChatVariable.value = false
    store.setShowDebugAndPreviewPanel(false)
    store.setShowEnvPanel(false)
  }
}

const toggleChatVariable = () => {
  if (showChatVariable.value) {
    showChatVariable.value = false
  } else {
    showChatVariable.value = true
    showChatRecord.value = false
    showDebugAndPreview.value = false
    showVersionHistory.value = false
    store.setShowDebugAndPreviewPanel(false)
    store.setShowEnvPanel(false)
  }
}

const toggleDebugAndPreview = () => {
  if (showDebugAndPreview.value) {
    showDebugAndPreview.value = false
  } else {
    showDebugAndPreview.value = true
    showChatRecord.value = false
    showChatVariable.value = false
    showVersionHistory.value = false
    store.setShowDebugAndPreviewPanel(false)
    store.setShowEnvPanel(false)
  }
}

const toggleVersionHistory = () => {
  if (showVersionHistory.value) {
    showVersionHistory.value = false
  } else {
    showVersionHistory.value = true
    showChatRecord.value = false
    showChatVariable.value = false
    showDebugAndPreview.value = false
    store.setShowDebugAndPreviewPanel(false)
    store.setShowEnvPanel(false)
  }
}

// 测试数据
const testChatItem = ref({
  id: '1',
  content: '这是一个测试问题，用于验证聊天组件的显示效果。',
  message_files: [
    { id: '1', name: 'test.pdf' },
    { id: '2', name: 'document.docx' }
  ]
})

const testAnswerItem = ref({
  id: '2',
  content: '这是一个**测试回答**，包含了*markdown*格式。\n\n- 列表项1\n- 列表项2\n\n```javascript\nconsole.log("Hello World");\n```',
  citation: [
    { id: '1', title: '参考文档1', content: '这是参考内容摘要...' }
  ],
  agent_thoughts: [
    { id: '1', thought: '正在分析用户问题...', tool: 'analyzer' },
    { id: '2', thought: '查找相关信息...', tool: 'search', observation: '找到3个相关结果' }
  ]
})

// 新增测试数据
const testCitationData = ref([
  {
    id: '1',
    document_id: 'doc1',
    document_name: '技术文档.pdf',
    data_source_type: 'upload_file',
    content: '这是引用的技术文档内容，展示了相关的技术实现细节和最佳实践。Vue 3 Composition API 提供了更好的逻辑复用能力...',
    hit_count: 5,
    word_count: 200,
    score: 0.92
  },
  {
    id: '2',
    document_id: 'doc2',
    document_name: 'Vue 3 官方指南',
    data_source_type: 'website',
    content: 'Vue 3 官方文档中关于组件开发的指导内容，包括响应式系统、组件通信等核心概念...',
    hit_count: 8,
    word_count: 350,
    score: 0.88
  }
])

const testThoughtData = ref({
  id: 'thought1',
  thought: '我需要分析用户的问题并提供准确的技术回答。首先搜索相关文档，然后整理信息。',
  tool: '["web_search", "code_executor"]',
  tool_input: '["查询Vue 3相关文档", "执行示例代码验证"]',
  observation: '["找到了详细的Vue 3技术文档", "代码执行成功，功能正常"]',
  tool_labels: {
    toolName: {
      language: '搜索和执行工具'
    }
  }
})

const testContentSwitchData = ref({
  textContent: `# Vue 3 聊天组件迁移总结

我们成功完成了从 React 到 Vue 3 的聊天组件迁移：

## 核心组件
- **Question**: 问题显示组件
- **Answer**: 回答显示组件
- **Citation**: 引用文档组件
- **ChatInputArea**: 聊天输入区域
- **Thought**: AI思考过程组件
- **ContentSwitch**: 内容切换器
- **ChatContext**: 对话上下文

## 技术特点
- 使用 Composition API
- 响应式数据管理
- 完整的 TypeScript 支持
- 模块化组件设计`,

  structuredData: {
    migration: {
      from: 'React',
      to: 'Vue 3',
      components: ['Question', 'Answer', 'Citation', 'ChatInputArea', 'Thought'],
      features: ['Composition API', 'TypeScript', 'Responsive Design']
    },
    stats: {
      totalComponents: 8,
      linesOfCode: 2500,
      migrationTime: '2 days'
    }
  },

  chartData: {
    type: 'bar',
    title: '组件迁移进度',
    data: [
      { label: 'Question', value: 100 },
      { label: 'Answer', value: 100 },
      { label: 'Citation', value: 100 },
      { label: 'InputArea', value: 100 },
      { label: 'Thought', value: 100 }
    ]
  },

  codeContent: {
    language: 'vue',
    content: `&lt;template&gt;
  &lt;div class="chat-component"&gt;
    &lt;Question :item="questionItem" /&gt;
    &lt;Answer :item="answerItem" /&gt;
    &lt;Citation :data="citationData" /&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref } from 'vue'
import Question from './question/index.vue'
import Answer from './answer/index.vue'
import Citation from './citation/index.vue'

const questionItem = ref({ /* ... */ })
const answerItem = ref({ /* ... */ })
const citationData = ref([/* ... */])
&lt;/script&gt;`
  }
})

const testContextData = ref([
  {
    id: 'ctx1',
    type: 'qa',
    content: '',
    question: '如何使用Vue 3的Composition API？',
    answer: 'Composition API是Vue 3的新特性，通过setup函数提供了更好的逻辑复用...',
    timestamp: Date.now() - 1000 * 60 * 10,
    relevanceScore: 0.95,
    source: '技术文档',
    tokens: 150
  },
  {
    id: 'ctx2',
    type: 'code',
    content: `import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)

    onMounted(() => {
      console.log('Component mounted')
    })

    return { count, doubleCount }
  }
}`,
    language: 'javascript',
    timestamp: Date.now() - 1000 * 60 * 5,
    relevanceScore: 0.88,
    source: '代码示例',
    tokens: 80
  },
  {
    id: 'ctx3',
    type: 'text',
    content: 'Vue 3 引入了许多新特性，包括Composition API、更好的TypeScript支持、更小的包体积等。这些改进使得开发更加高效。',
    timestamp: Date.now() - 1000 * 60 * 2,
    relevanceScore: 0.82,
    source: '用户输入'
  }
])

// 设置一些测试的工作流数据
const setupTestData = () => {
  store.setShowDebugAndPreviewPanel(true)
  store.setShowInputsPanel(true)
  store.setWorkflowRunningData({
    result: {
      status: WorkflowRunningStatus.Succeeded,
      finished_at: Math.floor(Date.now() / 1000),
      inputs: { query: '测试输入' },
      outputs: { result: '测试输出结果' },
      elapsed_time: 2.34,
      total_tokens: 150
    },
    resultText: '这是一个测试结果，包含**markdown**格式的内容。\n\n### 标题\n- 项目1\n- 项目2',
    tracing: [
      {
        id: '1',
        node_type: 'start',
        title: '开始节点',
        status: 'succeeded',
        elapsed_time: 0.1,
        inputs: {},
        outputs: { status: 'ready' }
      },
      {
        id: '2',
        node_type: 'llm',
        title: 'LLM节点',
        status: 'succeeded',
        elapsed_time: 2.0,
        total_tokens: 120,
        inputs: { prompt: 'test prompt' },
        outputs: { content: 'AI response' }
      }
    ]
  })
}

setupTestData()
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <div class="min-h-screen bg-gray-100 p-8">
        <div class="max-w-6xl mx-auto space-y-8">
          <h1 class="text-3xl font-bold text-gray-900">Dify Vue Workflow 组件测试</h1>

          <!-- 基础组件测试 -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">基础组件</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- NButton 测试 -->
              <div>
                <h3 class="font-medium mb-3">NButton 组件</h3>
                <div class="space-x-2">
                  <NButton type="primary" @click="showToast('success')">Primary</NButton>
                  <NButton type="default" @click="showToast('info')">Secondary</NButton>
                  <NButton type="warning" @click="showToast('warning')">Warning</NButton>
                  <NButton ghost @click="showToast('error')">Ghost</NButton>
                  <NButton type="primary">Loading</NButton>
                </div>
              </div>

              <!-- Loading 测试 -->
              <div>
                <h3 class="font-medium mb-3">Loading 组件</h3>
                <div class="flex items-center space-x-4">
                  <Loading type="area" />
                  <LoadingAnim type="text" />
                  <LoadingAnim type="avatar" />
                </div>
              </div>
            </div>
          </div>

          <!-- 聊天组件测试 -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">聊天组件</h2>
            <div class="space-y-4 max-w-2xl">
              <Question
                :item="testChatItem"
                @regenerate="(item, data) => console.log('Regenerate:', item, data)"
              />
              <Answer
                :item="testAnswerItem"
                question="测试问题"
                :index="1"
                @regenerate="(item) => console.log('Regenerate answer:', item)"
                @ask-question="(question) => console.log('Ask:', question)"
              />
            </div>
          </div>

                  <!-- Workflow组件测试 -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">Workflow 组件</h2>

            <!-- 控制按钮 -->
            <div class="mb-4 flex flex-wrap gap-2">
              <NButton
                type="default"
                size="small"
                @click="store.setShowDebugAndPreviewPanel(!store.showDebugAndPreviewPanel)"
              >
                {{ store.showDebugAndPreviewPanel ? '隐藏' : '显示' }} 预览面板
              </NButton>
              <NButton
                type="default"
                size="small"
                @click="store.setShowEnvPanel(!store.showEnvPanel)"
              >
                {{ store.showEnvPanel ? '隐藏' : '显示' }} 环境面板
              </NButton>
              <NButton
                type="default"
                size="small"
                @click="toggleChatRecord"
              >
                {{ showChatRecord ? '隐藏' : '显示' }} 聊天记录
              </NButton>
                          <NButton
                type="default"
                size="small"
                @click="toggleChatVariable"
              >
                {{ showChatVariable ? '隐藏' : '显示' }} 聊天变量
              </NButton>
              <NButton
                type="default"
                size="small"
                @click="toggleDebugAndPreview"
              >
                {{ showDebugAndPreview ? '隐藏' : '显示' }} 调试预览
              </NButton>
              <NButton
                type="default"
                size="small"
                @click="toggleVersionHistory"
              >
                {{ showVersionHistory ? '隐藏' : '显示' }} 版本历史
              </NButton>
            </div>

            <!-- 工作流面板容器 -->
            <div class="relative h-[800px] bg-gray-50 rounded-lg overflow-hidden">
              <!-- 工作流预览面板 -->
              <WorkflowPreview v-if="store.showDebugAndPreviewPanel" />

              <!-- 环境面板 -->
              <div v-if="store.showEnvPanel" class="absolute right-0 top-0 h-full">
                <EnvPanel />
              </div>

              <!-- 聊天记录面板 -->
              <div v-if="showChatRecord" class="absolute right-0 top-0 h-full">
                <ChatRecord />
              </div>

                          <!-- 聊天变量面板 -->
              <div v-if="showChatVariable" class="absolute right-0 top-0 h-full">
                <ChatVariablePanel />
              </div>

              <!-- 调试预览面板 -->
              <div v-if="showDebugAndPreview" class="absolute right-0 top-0 h-full">
                <DebugAndPreview />
              </div>

              <!-- 版本历史面板 -->
              <div v-if="showVersionHistory" class="absolute right-0 top-0 h-full">
                <VersionHistoryPanel />
              </div>

              <!-- 提示信息 -->
              <div v-if="!store.showDebugAndPreviewPanel && !store.showEnvPanel && !showChatRecord && !showChatVariable && !showDebugAndPreview && !showVersionHistory"
                  class="flex items-center justify-center h-full text-gray-500">
                <div class="text-center">
                  <Icon icon="ri:layout-grid-line" class="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>点击上方按钮显示不同的面板组件</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 新增聊天组件测试 -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">新增聊天组件</h2>

            <!-- Citation 引用组件 -->
            <div class="mb-6">
              <h3 class="text-lg font-medium mb-2">Citation 引用组件</h3>
              <Citation :data="testCitationData" :show-hit-info="true" />
            </div>

            <!-- Thought 思考过程组件 -->
            <div class="mb-6">
              <h3 class="text-lg font-medium mb-2">Thought 思考过程组件</h3>
              <Thought :thought="testThoughtData" :is-finished="true" />
            </div>

            <!-- ContentSwitch 内容切换组件 -->
            <div class="mb-6">
              <h3 class="text-lg font-medium mb-2">ContentSwitch 内容切换组件</h3>
              <ContentSwitch
                :text-content="testContentSwitchData.textContent"
                :structured-data="testContentSwitchData.structuredData"
                :chart-data="testContentSwitchData.chartData"
                :code-content="testContentSwitchData.codeContent"
                default-tab="text"
              />
            </div>

            <!-- ChatContext 对话上下文组件 -->
            <div class="mb-6">
              <h3 class="text-lg font-medium mb-2">ChatContext 对话上下文组件</h3>
              <ChatContext
                :context-items="testContextData"
                @remove="(id) => console.log('Remove context:', id)"
                @clear="() => console.log('Clear all context')"
                @export="(items) => console.log('Export context:', items)"
              />
            </div>

            <!-- ChatInputArea 聊天输入区域 -->
            <div class="mb-6">
              <h3 class="text-lg font-medium mb-2">ChatInputArea 聊天输入区域</h3>
              <ChatInputArea
                placeholder="输入你的消息..."
                :show-feature-bar="true"
                :show-file-upload="true"
                :speech-to-text-config="{ enabled: true }"
                @send="(query, inputs, files) => console.log('Send:', { query, inputs, files })"
                @input-change="(variable, value) => console.log('Input change:', variable, value)"
                @feature-bar-click="(state) => console.log('Feature bar:', state)"
              />
            </div>
          </div>

          <!-- 运行结果组件测试 -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">运行结果组件</h2>
            <div class="space-y-4">
              <div>
                <h3 class="font-medium mb-2">正常结果</h3>
                <ResultText
                  :outputs="'这是一个**测试输出**结果\\n\\n包含多行内容'"
                  :all-files="[{
                    varName: 'output_files',
                    list: [
                      { id: '1', name: 'result.pdf' },
                      { id: '2', name: 'data.xlsx' }
                    ]
                  }]"
                />
              </div>

              <div>
                <h3 class="font-medium mb-2">运行中状态</h3>
                <ResultText :is-running="true" />
              </div>

              <div>
                <h3 class="font-medium mb-2">错误状态</h3>
                <ResultText error="这是一个测试错误信息" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
