<template>
  <div class="content-switch">
    <!-- 内容标签页 -->
    <div v-if="tabs.length > 1" class="tab-header flex border-b border-gray-200 mb-3">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'tab-button px-3 py-2 text-sm font-medium border-b-2 transition-colors',
          activeTab === tab.key
            ? 'border-blue-500 text-blue-600 bg-blue-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
        @click="setActiveTab(tab.key)"
      >
        <Icon v-if="tab.icon" :icon="tab.icon" class="h-4 w-4 mr-1" />
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="ml-1 text-xs bg-gray-200 text-gray-600 px-1 rounded-full">
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="tab-content">
      <!-- 文本内容 -->
      <div v-if="activeTab === 'text' && textContent" class="text-content">
        <div class="prose prose-sm max-w-none">
          <div v-html="renderMarkdown(textContent)" />
        </div>
      </div>

      <!-- 结构化数据 -->
      <div v-else-if="activeTab === 'data' && structuredData" class="data-content">
        <JsonViewer
          :data="structuredData"
          :expanded="true"
          class="bg-gray-50 rounded-lg p-3"
        />
      </div>

      <!-- 文件列表 -->
      <div v-else-if="activeTab === 'files' && files?.length" class="files-content space-y-2">
        <div
          v-for="file in files"
          :key="file.id"
          class="file-item flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center">
            <Icon :icon="getFileIcon(file.type)" class="h-5 w-5 mr-3 text-gray-600" />
            <div>
              <div class="font-medium text-gray-900">{{ file.name }}</div>
              <div class="text-sm text-gray-500">
                {{ formatFileSize(file.size) }} • {{ file.type }}
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              class="text-blue-600 hover:text-blue-700 text-sm"
              @click="downloadFile(file)"
            >
              下载
            </button>
            <button
              class="text-gray-600 hover:text-gray-700 text-sm"
              @click="previewFile(file)"
            >
              预览
            </button>
          </div>
        </div>
      </div>

      <!-- 图表内容 -->
      <div v-else-if="activeTab === 'chart' && chartData" class="chart-content">
        <ChartRenderer :data="chartData" class="h-64" />
      </div>

      <!-- 代码内容 -->
      <div v-else-if="activeTab === 'code' && codeContent" class="code-content">
        <div class="code-header flex items-center justify-between mb-2">
          <div class="flex items-center">
            <Icon icon="ri:code-line" class="h-4 w-4 mr-1 text-gray-600" />
            <span class="text-sm font-medium text-gray-700">{{ codeContent.language || 'Code' }}</span>
          </div>
          <button
            class="text-sm text-blue-600 hover:text-blue-700"
            @click="copyCode"
          >
            复制代码
          </button>
        </div>
        <pre class="code-block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ codeContent.content }}</code></pre>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-content text-center py-8 text-gray-500">
        <Icon icon="ri:file-list-line" class="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p>暂无内容</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import JsonViewer from './json-viewer.vue'
import ChartRenderer from './chart-renderer.vue'
import { useToast } from '@/components/base/toast/useToast'

interface FileItem {
  id: string
  name: string
  type: string
  size: number
  url?: string
  content?: string
}

interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'scatter'
  data: any[]
  options?: any
}

interface CodeContent {
  language: string
  content: string
}

interface Tab {
  key: string
  label: string
  icon?: string
  count?: number
}

interface Props {
  textContent?: string
  structuredData?: any
  files?: FileItem[]
  chartData?: ChartData
  codeContent?: CodeContent
  defaultTab?: string
}

const props = defineProps<Props>()

// 响应式状态
const activeTab = ref('')

const toast = useToast()

// 计算属性
const tabs = computed<Tab[]>(() => {
  const tabList: Tab[] = []

  if (props.textContent) {
    tabList.push({
      key: 'text',
      label: '文本',
      icon: 'ri:file-text-line'
    })
  }

  if (props.structuredData) {
    tabList.push({
      key: 'data',
      label: '数据',
      icon: 'ri:database-line'
    })
  }

  if (props.files?.length) {
    tabList.push({
      key: 'files',
      label: '文件',
      icon: 'ri:file-line',
      count: props.files.length
    })
  }

  if (props.chartData) {
    tabList.push({
      key: 'chart',
      label: '图表',
      icon: 'ri:bar-chart-line'
    })
  }

  if (props.codeContent) {
    tabList.push({
      key: 'code',
      label: '代码',
      icon: 'ri:code-line'
    })
  }

  return tabList
})

// 方法
const setActiveTab = (tabKey: string) => {
  activeTab.value = tabKey
}

const renderMarkdown = (content: string) => {
  try {
    return marked(content)
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return content.replace(/\n/g, '<br>')
  }
}

const getFileIcon = (type: string) => {
  if (type.includes('image')) return 'ri:image-line'
  if (type.includes('pdf')) return 'ri:file-pdf-line'
  if (type.includes('word')) return 'ri:file-word-line'
  if (type.includes('excel')) return 'ri:file-excel-line'
  if (type.includes('video')) return 'ri:video-line'
  if (type.includes('audio')) return 'ri:music-line'
  return 'ri:file-line'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const downloadFile = (file: FileItem) => {
  if (file.url) {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    toast.error('文件下载链接不可用')
  }
}

const previewFile = (file: FileItem) => {
  if (file.url) {
    window.open(file.url, '_blank')
  } else {
    toast.info('文件预览功能暂不可用')
  }
}

const copyCode = async () => {
  if (props.codeContent?.content) {
    try {
      await navigator.clipboard.writeText(props.codeContent.content)
      toast.success('代码已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
      toast.error('复制失败')
    }
  }
}

// 初始化
onMounted(() => {
  // 设置默认活动标签
  if (props.defaultTab && tabs.value.some(tab => tab.key === props.defaultTab)) {
    activeTab.value = props.defaultTab
  } else if (tabs.value.length > 0) {
    activeTab.value = tabs.value[0].key
  }
})
</script>

<style scoped>
.content-switch {
  /* 内容切换器样式 */
}

.tab-header {
  /* 标签头部样式 */
}

.tab-button {
  /* 标签按钮样式 */
}

.tab-content {
  /* 标签内容样式 */
}

.code-block {
  /* 代码块样式 */
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Fira Mono', 'Droid Sans Mono', 'Consolas', monospace;
}

.prose {
  /* 文本内容样式 */
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.prose p {
  margin-bottom: 0.75rem;
}

.prose ul,
.prose ol {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.25rem;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.prose blockquote {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
}
</style>
