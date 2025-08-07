<template>
  <div class="relative flex h-full w-[420px] flex-col rounded-l-2xl border border-gray-200 bg-white">
    <!-- 头部 -->
    <div class="flex shrink-0 items-center justify-between p-4 pb-0 text-xl font-semibold text-gray-900">
      环境变量
      <div class="flex items-center">
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
      管理工作流中使用的环境变量，支持明文和密钥类型
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
      <div v-if="!envList.length" class="text-center py-8 text-gray-500">
        <Icon icon="ri:settings-line" class="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>暂无环境变量</p>
        <p class="text-sm">点击上方按钮添加第一个环境变量</p>
      </div>

      <div v-else class="space-y-2">
        <EnvItem
          v-for="env in envList"
          :key="env.id"
          :env="env"
          @edit="handleEdit"
          @delete="handleDeleteCheck"
        />
      </div>
    </div>

    <!-- 变量编辑模态框 -->
    <VariableModal
      v-model:visible="showVariableModal"
      :env="currentVar"
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
        <p>确定要删除环境变量 <strong>{{ deleteTarget?.name }}</strong> 吗？</p>
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
import { storeToRefs } from 'pinia'
import { useWorkflowStore } from '@/stores/workflow'
import Button from '@/components/base/button/index.vue'
import Modal from '@/components/base/modal/index.vue'
import EnvItem from './env-item.vue'
import VariableModal from './variable-modal.vue'
import { generateUUID } from '@/utils/workflow'

interface EnvironmentVariable {
  id: string
  name: string
  value: string
  value_type: 'text' | 'secret'
  description?: string
}

const store = useWorkflowStore()

// 响应式状态
const envList = ref<EnvironmentVariable[]>([
  {
    id: '1',
    name: 'API_KEY',
    value: '[__HIDDEN__]',
    value_type: 'secret',
    description: 'API密钥'
  },
  {
    id: '2',
    name: 'MODEL_NAME',
    value: 'gpt-3.5-turbo',
    value_type: 'text',
    description: '默认模型名称'
  }
])

const envSecrets = ref<Record<string, string>>({
  '1': 'sk-abc***********xyz'
})

const showVariableModal = ref(false)
const currentVar = ref<EnvironmentVariable>()

const showDeleteConfirm = ref(false)
const deleteTarget = ref<EnvironmentVariable>()

// 计算属性
const affectedNodes = computed(() => {
  // 这里应该查找使用了该变量的节点
  // 暂时返回空数组，实际应该从工作流图中查找
  return []
})

// 方法
const closePanel = () => {
  store.setShowEnvPanel(false)
}

const openAddModal = () => {
  currentVar.value = undefined
  showVariableModal.value = true
}

const handleEdit = (env: EnvironmentVariable) => {
  currentVar.value = env
  showVariableModal.value = true
}

const handleDeleteCheck = (env: EnvironmentVariable) => {
  deleteTarget.value = env
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    const index = envList.value.findIndex(e => e.id === deleteTarget.value!.id)
    if (index > -1) {
      envList.value.splice(index, 1)
    }

    // 如果是密钥类型，也从secrets中删除
    if (deleteTarget.value.value_type === 'secret') {
      delete envSecrets.value[deleteTarget.value.id]
    }
  }

  showDeleteConfirm.value = false
  deleteTarget.value = undefined
}

const handleSave = (env: EnvironmentVariable) => {
  if (currentVar.value) {
    // 编辑现有变量
    const index = envList.value.findIndex(e => e.id === currentVar.value!.id)
    if (index > -1) {
      envList.value[index] = env
    }
  } else {
    // 添加新变量
    const newEnv = {
      ...env,
      id: generateUUID()
    }
    envList.value.unshift(newEnv)
  }

  // 如果是密钥类型，格式化显示
  if (env.value_type === 'secret') {
    envSecrets.value[env.id] = formatSecret(env.value)
    // 隐藏实际值
    const targetEnv = envList.value.find(e => e.id === env.id)
    if (targetEnv) {
      targetEnv.value = '[__HIDDEN__]'
    }
  }

  handleCloseModal()
}

const handleCloseModal = () => {
  showVariableModal.value = false
  currentVar.value = undefined
}

const formatSecret = (secret: string): string => {
  if (secret.length > 8) {
    return `${secret.slice(0, 6)}************${secret.slice(-2)}`
  }
  return '********************'
}
</script>
