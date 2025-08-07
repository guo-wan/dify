<template>
  <div class="relative flex h-full w-[420px] flex-col rounded-l-2xl border border-gray-200 bg-white">
    <!-- 头部 -->
    <div class="flex shrink-0 items-center justify-between p-4 pb-0 text-xl font-semibold text-gray-900">
      聊天变量
      <div class="flex items-center space-x-2">
        <!-- 帮助按钮 -->
        <button
          class="flex h-6 w-6 cursor-pointer items-center justify-center hover:bg-gray-100 rounded"
          @click="showHelpTip = !showHelpTip"
          title="帮助"
        >
          <Icon icon="ri:question-line" class="h-4 w-4 text-gray-500" />
        </button>

        <!-- 关闭按钮 -->
        <button
          class="flex h-6 w-6 cursor-pointer items-center justify-center hover:bg-gray-100 rounded"
          @click="closePanel"
        >
          <Icon icon="ri:close-line" class="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>

    <!-- 描述 -->
    <div class="shrink-0 px-4 py-1 text-sm text-gray-500">
      管理对话中使用的变量，可以在不同节点间传递和引用
    </div>

    <!-- 帮助提示 -->
    <div v-if="showHelpTip" class="mx-4 my-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-start">
        <Icon icon="ri:lightbulb-line" class="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
        <div class="text-sm text-blue-800">
          <div class="font-medium mb-1">聊天变量使用说明：</div>
          <ul class="text-xs space-y-1">
            <li>• 用于在对话过程中存储和传递数据</li>
            <li>• 可以在工作流节点中通过 {{conversation.变量名}} 引用</li>
            <li>• 支持字符串、数字、数组等多种数据类型</li>
          </ul>
        </div>
        <button
          class="ml-auto p-0.5 hover:bg-blue-100 rounded"
          @click="showHelpTip = false"
        >
          <Icon icon="ri:close-line" class="h-3 w-3 text-blue-600" />
        </button>
      </div>
    </div>

    <!-- 添加按钮 -->
    <div class="shrink-0 px-4 pb-3 pt-2">
      <Button
        variant="primary"
        size="small"
        @click="openAddModal"
      >
        <Icon icon="ri:add-line" class="h-4 w-4 mr-1" />
        添加变量
      </Button>
    </div>

    <!-- 变量列表 -->
    <div class="grow overflow-y-auto rounded-b-2xl px-4">
      <div v-if="!varList.length" class="text-center py-8 text-gray-500">
        <Icon icon="ri:chat-3-line" class="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>暂无聊天变量</p>
        <p class="text-sm">点击上方按钮添加第一个聊天变量</p>
      </div>

      <div v-else class="space-y-2">
        <VariableItem
          v-for="variable in varList"
          :key="variable.id"
          :variable="variable"
          @edit="handleEdit"
          @delete="handleDeleteCheck"
        />
      </div>
    </div>

    <!-- 变量编辑模态框 -->
    <VariableModal
      v-model:visible="showVariableModal"
      :variable="currentVar"
      @save="handleSave"
      @close="handleCloseModal"
    />

    <!-- 删除确认模态框 -->
    <Modal
      v-model:visible="showDeleteConfirm"
      title="确认删除"
      size="sm"
    >
      <div class="space-y-3">
        <p>确定要删除聊天变量 <strong>{{ deleteTarget?.name }}</strong> 吗？</p>
        <div v-if="affectedNodes.length" class="bg-yellow-50 border border-yellow-200 rounded p-3">
          <div class="flex items-center text-yellow-800 mb-2">
            <Icon icon="ri:alert-line" class="h-4 w-4 mr-1" />
            <span class="font-medium">影响范围</span>
          </div>
          <p class="text-sm text-yellow-700">
            该变量正在被 {{ affectedNodes.length }} 个节点使用，删除后这些节点中的变量引用将被移除。
          </p>
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" @click="showDeleteConfirm = false">
          取消
        </Button>
        <Button variant="warning" @click="confirmDelete">
          确认删除
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '@/components/base/button/index.vue'
import Modal from '@/components/base/modal/index.vue'
import VariableItem from './variable-item.vue'
import VariableModal from './variable-modal.vue'
import { generateUUID } from '@/utils/workflow'

interface ConversationVariable {
  id: string
  name: string
  value_type: 'string' | 'number' | 'select' | 'array'
  description?: string
  default?: any
  options?: string[]
}

// 响应式状态
const showHelpTip = ref(true)
const varList = ref<ConversationVariable[]>([
  {
    id: '1',
    name: 'user_name',
    value_type: 'string',
    description: '用户姓名',
    default: ''
  },
  {
    id: '2',
    name: 'conversation_style',
    value_type: 'select',
    description: '对话风格',
    options: ['正式', '轻松', '专业'],
    default: '轻松'
  },
  {
    id: '3',
    name: 'topics',
    value_type: 'array',
    description: '感兴趣的话题',
    default: []
  }
])

const showVariableModal = ref(false)
const currentVar = ref<ConversationVariable>()

const showDeleteConfirm = ref(false)
const deleteTarget = ref<ConversationVariable>()

// 计算属性
const affectedNodes = computed(() => {
  // 这里应该查找使用了该变量的节点
  // 暂时返回空数组，实际应该从工作流图中查找
  return []
})

// 方法
const closePanel = () => {
  // 关闭聊天变量面板
  console.log('关闭聊天变量面板')
}

const openAddModal = () => {
  currentVar.value = undefined
  showVariableModal.value = true
}

const handleEdit = (variable: ConversationVariable) => {
  currentVar.value = variable
  showVariableModal.value = true
}

const handleDeleteCheck = (variable: ConversationVariable) => {
  deleteTarget.value = variable
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    const index = varList.value.findIndex(v => v.id === deleteTarget.value!.id)
    if (index > -1) {
      varList.value.splice(index, 1)
    }
  }

  showDeleteConfirm.value = false
  deleteTarget.value = undefined
}

const handleSave = (variable: ConversationVariable) => {
  if (currentVar.value) {
    // 编辑现有变量
    const index = varList.value.findIndex(v => v.id === currentVar.value!.id)
    if (index > -1) {
      varList.value[index] = variable
    }
  } else {
    // 添加新变量
    const newVar = {
      ...variable,
      id: generateUUID()
    }
    varList.value.unshift(newVar)
  }

  handleCloseModal()
}

const handleCloseModal = () => {
  showVariableModal.value = false
  currentVar.value = undefined
}
</script>
