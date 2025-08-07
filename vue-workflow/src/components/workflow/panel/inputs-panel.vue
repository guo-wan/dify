<template>
  <div>
    <!-- 输入变量表单 -->
    <div class="px-4 pb-2 pt-3">
      <div
        v-for="(variable, index) in variables"
        :key="variable.variable"
        class="mb-2 last:mb-0"
      >
        <FormItem
          :payload="variable"
          :value="inputs[variable.variable]"
          :auto-focus="index === 0"
          @change="handleValueChange(variable.variable, $event)"
        />
      </div>

      <!-- 如果没有输入变量 -->
      <div v-if="!variables.length" class="text-center py-8 text-gray-500">
        <Icon icon="ri:settings-line" class="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>暂无输入变量</p>
        <p class="text-sm">请在开始节点中配置输入变量</p>
      </div>
    </div>

    <!-- 运行按钮 -->
    <div class="flex items-center justify-between px-4 py-2">
      <Button
        variant="primary"
        :disabled="!canRun || isRunning"
        :loading="isRunning"
        class="w-full"
        @click="doRun"
      >
        {{ isRunning ? '运行中...' : '开始运行' }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkflowStore } from '@/stores/workflow'
import { WorkflowRunningStatus, BlockEnum } from '@/utils/types/workflow'
import Button from '@/components/base/button/index.vue'
import FormItem from './form-item.vue'
import { useToast } from '@/components/base/toast/useToast'

interface InputVariable {
  variable: string
  type: string
  label: string
  required?: boolean
  default?: any
  options?: string[]
  description?: string
}

interface Props {
  onRun?: () => void
}

defineProps<Props>()

const emit = defineEmits<{
  run: []
}>()

const store = useWorkflowStore()
const toast = useToast()

// 响应式状态
const { workflowRunningData } = storeToRefs(store)

// 模拟输入变量数据 - 在实际项目中这些会来自工作流配置
const inputs = ref<Record<string, any>>({
  query: '',
  context: '',
  temperature: 0.7
})

const files = ref<any[]>([])

// 模拟变量配置 - 在实际项目中这些会来自开始节点的配置
const variables = computed<InputVariable[]>(() => [
  {
    variable: 'query',
    type: 'string',
    label: '查询内容',
    required: true,
    description: '请输入要查询的内容'
  },
  {
    variable: 'context',
    type: 'paragraph',
    label: '上下文',
    required: false,
    description: '可选的上下文信息'
  },
  {
    variable: 'temperature',
    type: 'number',
    label: '温度参数',
    required: false,
    default: 0.7,
    description: '控制输出的随机性，范围0-1'
  },
  {
    variable: 'model',
    type: 'select',
    label: '模型选择',
    required: true,
    options: ['gpt-3.5-turbo', 'gpt-4', 'claude-3'],
    default: 'gpt-3.5-turbo'
  }
])

// 计算属性
const isRunning = computed(() =>
  workflowRunningData.value?.result?.status === WorkflowRunningStatus.Running
)

const canRun = computed(() => {
  // 检查必填字段是否已填写
  for (const variable of variables.value) {
    if (variable.required && !inputs.value[variable.variable]) {
      return false
    }
  }

  // 检查文件是否上传完成
  if (files.value.some(file => !file.upload_file_id)) {
    return false
  }

  return true
})

// 方法
const handleValueChange = (variable: string, value: any) => {
  if (variable === '__image') {
    files.value = value
  } else {
    inputs.value[variable] = value
  }
}

const doRun = () => {
  if (!canRun.value) {
    toast.error('请检查必填字段')
    return
  }

  // 处理输入数据
  const processedInputs = { ...inputs.value }

  // 模拟运行工作流
  console.log('Running workflow with inputs:', processedInputs)
  console.log('Files:', files.value)

  // 设置运行状态
  store.setWorkflowRunningData({
    result: {
      status: WorkflowRunningStatus.Running,
      inputs: processedInputs
    },
    resultText: null,
    tracing: []
  })

  emit('run')

  // 模拟异步运行结果
  setTimeout(() => {
    store.setWorkflowRunningData({
      result: {
        status: WorkflowRunningStatus.Succeeded,
        finished_at: Math.floor(Date.now() / 1000),
        inputs: processedInputs,
        outputs: {
          result: '这是基于输入生成的测试结果',
          processed_query: processedInputs.query
        },
        elapsed_time: Math.random() * 3 + 1,
        total_tokens: Math.floor(Math.random() * 200) + 50
      },
      resultText: `基于查询"${processedInputs.query}"生成的结果：\n\n这是一个**示例输出**，展示了工作流的执行结果。\n\n- 查询内容: ${processedInputs.query}\n- 使用模型: ${processedInputs.model}\n- 温度参数: ${processedInputs.temperature}`,
      tracing: [
        {
          id: '1',
          node_type: 'start',
          title: '开始节点',
          status: 'succeeded',
          elapsed_time: 0.1,
          inputs: processedInputs,
          outputs: processedInputs
        },
        {
          id: '2',
          node_type: 'llm',
          title: 'LLM处理',
          status: 'succeeded',
          elapsed_time: 2.3,
          total_tokens: 120,
          inputs: { prompt: `处理查询: ${processedInputs.query}` },
          outputs: { content: '处理完成' }
        }
      ]
    })
  }, 2000)
}

// 初始化默认值
watch(() => variables.value, (newVariables) => {
  const initialInputs: Record<string, any> = {}
  newVariables.forEach((variable) => {
    if (variable.default !== undefined) {
      initialInputs[variable.variable] = variable.default
    }
  })
  inputs.value = { ...initialInputs, ...inputs.value }
}, { immediate: true })
</script>
