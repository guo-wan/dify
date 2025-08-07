<template>
  <div class="version-history-panel relative flex h-full w-[420px] flex-col rounded-l-2xl border border-gray-200 bg-white shadow-xl">
    <!-- 头部 -->
    <div class="panel-header flex shrink-0 items-center justify-between p-4 border-b border-gray-200">
      <div class="header-left">
        <h2 class="text-lg font-semibold text-gray-900">版本历史</h2>
        <p class="text-sm text-gray-500 mt-1">查看和管理工作流版本</p>
      </div>

      <div class="header-right">
        <button
          class="close-btn p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          @click="handleClose"
          title="关闭"
        >
          <Icon icon="ri:close-line" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filter-section p-4 border-b border-gray-200 bg-gray-50">
      <div class="filter-controls space-y-3">
        <!-- 版本筛选 -->
        <div class="filter-group">
          <label class="text-sm font-medium text-gray-700 mb-2 block">版本范围</label>
          <div class="filter-options flex space-x-2">
            <button
              v-for="option in filterOptions"
              :key="option.value"
              :class="[
                'filter-option px-3 py-1 text-sm rounded-md transition-colors',
                filterValue === option.value
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              ]"
              @click="setFilterValue(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- 仅显示命名版本 -->
        <div class="filter-group">
          <label class="flex items-center">
            <input
              v-model="isOnlyShowNamedVersions"
              type="checkbox"
              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">仅显示命名版本</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 版本列表 -->
    <div class="versions-list flex-1 min-h-0 overflow-y-auto">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state flex items-center justify-center py-8">
        <Icon icon="ri:loader-4-line" class="h-6 w-6 text-blue-500 animate-spin mr-2" />
        <span class="text-sm text-gray-600">加载版本历史...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!filteredVersions.length" class="empty-state text-center py-12">
        <Icon icon="ri:history-line" class="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">暂无版本历史</h3>
        <p class="text-sm text-gray-500">
          {{ filterValue === 'yours' ? '您还没有创建任何版本' : '工作流还没有保存过版本' }}
        </p>
      </div>

      <!-- 版本项列表 -->
      <div v-else class="versions-container">
        <VersionHistoryItem
          v-for="version in filteredVersions"
          :key="version.id"
          :version="version"
          :is-current="version.id === currentVersion?.id"
          @click="handleVersionClick"
          @restore="handleRestore"
          @delete="handleDelete"
          @edit="handleEdit"
          @copy-url="handleCopyUrl"
        />

        <!-- 加载更多 -->
        <div v-if="hasNextPage" class="load-more-section p-4">
          <button
            :disabled="isFetchingNext"
            class="load-more-btn w-full flex items-center justify-center py-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            @click="loadNextPage"
          >
            <Icon
              v-if="isFetchingNext"
              icon="ri:loader-4-line"
              class="h-4 w-4 mr-1 animate-spin"
            />
            <Icon
              v-else
              icon="ri:arrow-down-double-line"
              class="h-4 w-4 mr-1"
            />
            {{ isFetchingNext ? '加载中...' : '加载更多' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 恢复确认模态框 -->
    <Modal
      v-model:visible="showRestoreConfirm"
      title="确认恢复版本"
      size="md"
    >
      <div class="space-y-3">
        <p>确定要恢复到版本 <strong>{{ operatedVersion?.name || '未命名版本' }}</strong> 吗？</p>
        <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
          <div class="flex items-start">
            <Icon icon="ri:alert-line" class="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
            <div class="text-sm text-yellow-800">
              <p class="font-medium mb-1">注意：</p>
              <ul class="list-disc list-inside space-y-1">
                <li>当前未保存的更改将丢失</li>
                <li>工作流将回退到选定版本的状态</li>
                <li>此操作无法撤销</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" @click="showRestoreConfirm = false">
          取消
        </Button>
        <Button variant="warning" @click="confirmRestore">
          确认恢复
        </Button>
      </template>
    </Modal>

    <!-- 删除确认模态框 -->
    <Modal
      v-model:visible="showDeleteConfirm"
      title="确认删除版本"
      size="md"
    >
      <div class="space-y-3">
        <p>确定要删除版本 <strong>{{ operatedVersion?.name || '未命名版本' }}</strong> 吗？</p>
        <div class="bg-red-50 border border-red-200 rounded p-3">
          <div class="flex items-start">
            <Icon icon="ri:error-warning-line" class="h-4 w-4 text-red-600 mr-2 mt-0.5" />
            <div class="text-sm text-red-800">
              <p class="font-medium mb-1">警告：</p>
              <p>此操作将永久删除该版本，无法恢复。请谨慎操作。</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" @click="showDeleteConfirm = false">
          取消
        </Button>
        <Button variant="danger" @click="confirmDelete">
          确认删除
        </Button>
      </template>
    </Modal>

    <!-- 编辑版本信息模态框 -->
    <VersionEditModal
      v-model:visible="showEditModal"
      :version="operatedVersion"
      @save="handleSaveEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Modal from '@/components/base/modal/index.vue'
import Button from '@/components/base/button/index.vue'
import VersionHistoryItem from './version-history-item.vue'
import VersionEditModal from './version-edit-modal.vue'
import { useToast } from '@/components/base/toast/useToast'

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
  workflow_data?: any
}

// 响应式状态
const filterValue = ref<'all' | 'yours' | 'published'>('all')
const isOnlyShowNamedVersions = ref(false)
const isLoading = ref(false)
const isFetchingNext = ref(false)
const hasNextPage = ref(true)

const currentVersion = ref<VersionHistory>()
const operatedVersion = ref<VersionHistory>()

const showRestoreConfirm = ref(false)
const showDeleteConfirm = ref(false)
const showEditModal = ref(false)

// 模拟版本历史数据
const versions = ref<VersionHistory[]>([
  {
    id: '1',
    name: '初始版本',
    description: '工作流的第一个版本，包含基础聊天功能',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: {
      id: 'user1',
      name: '张三',
      avatar: ''
    },
    version: 'v1.0.0',
    is_published: true
  },
  {
    id: '2',
    name: '添加引用功能',
    description: '新增了文档引用和citation功能',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: {
      id: 'user1',
      name: '张三'
    },
    version: 'v1.1.0',
    is_published: true
  },
  {
    id: '3',
    description: '修复了一些bug和性能优化',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: {
      id: 'user2',
      name: '李四'
    },
    version: 'v1.1.1'
  },
  {
    id: '4',
    name: '当前版本',
    description: '最新的开发版本，包含所有新功能',
    created_at: new Date().toISOString(),
    created_by: {
      id: 'user1',
      name: '张三'
    },
    version: 'v1.2.0-dev',
    is_current: true
  }
])

const toast = useToast()

// 计算属性
const filterOptions = computed(() => [
  { value: 'all', label: '全部版本' },
  { value: 'yours', label: '我的版本' },
  { value: 'published', label: '已发布' }
])

const filteredVersions = computed(() => {
  let filtered = versions.value

  // 按筛选条件过滤
  if (filterValue.value === 'yours') {
    filtered = filtered.filter(v => v.created_by.id === 'user1') // 假设当前用户ID为user1
  } else if (filterValue.value === 'published') {
    filtered = filtered.filter(v => v.is_published)
  }

  // 是否只显示命名版本
  if (isOnlyShowNamedVersions.value) {
    filtered = filtered.filter(v => v.name)
  }

  return filtered
})

// 方法
const handleClose = () => {
  console.log('关闭版本历史面板')
}

const handleVersionClick = (version: VersionHistory) => {
  if (version.id !== currentVersion.value?.id) {
    currentVersion.value = version
    console.log('切换到版本:', version)
    toast.success(`已切换到版本 ${version.version}`)
  }
}

const handleRestore = (version: VersionHistory) => {
  operatedVersion.value = version
  showRestoreConfirm.value = true
}

const handleDelete = (version: VersionHistory) => {
  operatedVersion.value = version
  showDeleteConfirm.value = true
}

const handleEdit = (version: VersionHistory) => {
  operatedVersion.value = version
  showEditModal.value = true
}

const handleCopyUrl = (version: VersionHistory) => {
  const url = `${window.location.origin}/workflow/version/${version.id}`
  navigator.clipboard.writeText(url).then(() => {
    toast.success('版本链接已复制到剪贴板')
  }).catch(() => {
    toast.error('复制失败')
  })
}

const confirmRestore = () => {
  if (operatedVersion.value) {
    console.log('恢复版本:', operatedVersion.value)

    // 模拟恢复操作
    const version = operatedVersion.value
    currentVersion.value = version

    // 更新版本列表中的当前标记
    versions.value.forEach(v => {
      v.is_current = v.id === version.id
    })

    toast.success(`已恢复到版本 ${version.version}`)
  }

  showRestoreConfirm.value = false
  operatedVersion.value = undefined
}

const confirmDelete = () => {
  if (operatedVersion.value) {
    console.log('删除版本:', operatedVersion.value)

    // 从列表中移除
    const index = versions.value.findIndex(v => v.id === operatedVersion.value!.id)
    if (index > -1) {
      versions.value.splice(index, 1)
      toast.success('版本已删除')
    }
  }

  showDeleteConfirm.value = false
  operatedVersion.value = undefined
}

const handleSaveEdit = (editedVersion: VersionHistory) => {
  const index = versions.value.findIndex(v => v.id === editedVersion.id)
  if (index > -1) {
    versions.value[index] = { ...versions.value[index], ...editedVersion }
    toast.success('版本信息已更新')
  }

  showEditModal.value = false
  operatedVersion.value = undefined
}

const loadNextPage = () => {
  if (hasNextPage.value && !isFetchingNext.value) {
    isFetchingNext.value = true

    // 模拟加载更多数据
    setTimeout(() => {
      // 这里可以添加更多版本数据
      isFetchingNext.value = false
      hasNextPage.value = false // 假设没有更多数据了
    }, 1000)
  }
}

// 初始化
onMounted(() => {
  // 设置当前版本
  const current = versions.value.find(v => v.is_current)
  if (current) {
    currentVersion.value = current
  }
})
</script>

<style scoped>
.version-history-panel {
  /* 版本历史面板样式 */
}

.filter-section {
  /* 筛选区域样式 */
}

.filter-option {
  /* 筛选选项样式 */
}

.versions-list {
  /* 版本列表样式 */
}

.load-more-btn {
  /* 加载更多按钮样式 */
}
</style>
