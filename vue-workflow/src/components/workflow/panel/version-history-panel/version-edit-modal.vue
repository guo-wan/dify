<template>
  <Modal
    v-model:visible="modalVisible"
    :title="version ? '编辑版本信息' : '版本信息'"
    size="md"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 版本名称 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          版本名称
        </label>
        <Input
          v-model="formData.name"
          placeholder="为此版本输入一个描述性名称"
          :auto-focus="true"
        />
        <div class="mt-1 text-xs text-gray-500">
          留空将显示为"未命名版本"
        </div>
      </div>

      <!-- 版本描述 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          版本描述
        </label>
        <textarea
          v-model="formData.description"
          placeholder="描述此版本的主要更改和功能"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          rows="4"
        />
        <div class="mt-1 text-xs text-gray-500">
          详细描述有助于团队成员了解此版本的变更内容
        </div>
      </div>

      <!-- 版本标签 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          版本标签
        </label>
        <div class="space-y-2">
          <label class="flex items-center">
            <input
              v-model="formData.is_published"
              type="checkbox"
              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">标记为已发布版本</span>
          </label>
          <div class="text-xs text-gray-500">
            已发布的版本将显示特殊标识，便于识别稳定版本
          </div>
        </div>
      </div>

      <!-- 版本信息（只读） -->
      <div v-if="version" class="version-info bg-gray-50 rounded-lg p-3">
        <h4 class="text-sm font-medium text-gray-700 mb-2">版本信息</h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">版本号:</span>
            <span class="ml-2 text-gray-900">{{ version.version }}</span>
          </div>
          <div>
            <span class="text-gray-500">创建时间:</span>
            <span class="ml-2 text-gray-900">{{ formatDateTime(version.created_at) }}</span>
          </div>
          <div>
            <span class="text-gray-500">创建者:</span>
            <span class="ml-2 text-gray-900">{{ version.created_by.name }}</span>
          </div>
          <div v-if="version.is_current">
            <span class="text-blue-600 text-sm font-medium">当前活跃版本</span>
          </div>
        </div>
      </div>

      <!-- 操作历史（如果有的话） -->
      <div v-if="version && operationHistory.length" class="operation-history">
        <h4 class="text-sm font-medium text-gray-700 mb-2">操作历史</h4>
        <div class="max-h-32 overflow-y-auto space-y-1">
          <div
            v-for="operation in operationHistory"
            :key="operation.id"
            class="operation-item flex items-center text-xs text-gray-600 bg-gray-50 rounded p-2"
          >
            <Icon :icon="getOperationIcon(operation.type)" class="h-3 w-3 mr-2" />
            <span>{{ operation.description }}</span>
            <span class="ml-auto">{{ formatDateTime(operation.timestamp) }}</span>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <Button variant="secondary" @click="handleClose">
        取消
      </Button>
      <Button
        variant="primary"
        @click="handleSubmit"
      >
        保存
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '@/components/base/modal/index.vue'
import Input from '@/components/base/input/index.vue'
import Button from '@/components/base/button/index.vue'

interface VersionHistory {
  id: string
  name?: string
  description?: string
  created_at: string
  created_by: {
    id: string
    name: string
    avatar?: string
  }
  version: string
  is_current?: boolean
  is_published?: boolean
}

interface Operation {
  id: string
  type: 'create' | 'edit' | 'publish' | 'unpublish' | 'restore'
  description: string
  timestamp: string
}

interface Props {
  visible: boolean
  version?: VersionHistory
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  save: [version: VersionHistory]
}>()

// 响应式状态
const modalVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const formData = ref({
  name: '',
  description: '',
  is_published: false
})

// 模拟操作历史
const operationHistory = ref<Operation[]>([
  {
    id: '1',
    type: 'create',
    description: '版本创建',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'edit',
    description: '更新版本描述',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    type: 'publish',
    description: '标记为已发布',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
])

// 方法
const handleSubmit = () => {
  if (props.version) {
    const updatedVersion: VersionHistory = {
      ...props.version,
      name: formData.value.name || undefined,
      description: formData.value.description || undefined,
      is_published: formData.value.is_published
    }

    emit('save', updatedVersion)
  }
}

const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    is_published: false
  }
}

const formatDateTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getOperationIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'create': 'ri:add-line',
    'edit': 'ri:edit-line',
    'publish': 'ri:eye-line',
    'unpublish': 'ri:eye-off-line',
    'restore': 'ri:history-line'
  }
  return iconMap[type] || 'ri:settings-line'
}

// 监听props变化，初始化表单数据
watch(() => props.version, (newVersion) => {
  if (newVersion) {
    formData.value = {
      name: newVersion.name || '',
      description: newVersion.description || '',
      is_published: newVersion.is_published || false
    }
  } else {
    resetForm()
  }
})

watch(() => props.visible, (visible) => {
  if (!visible) {
    resetForm()
  }
})
</script>

<style scoped>
.version-info {
  /* 版本信息样式 */
}

.operation-history {
  /* 操作历史样式 */
}

.operation-item {
  /* 操作项样式 */
}
</style>
