<template>
  <div
    class="version-history-item group relative border-b border-gray-100 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
    :class="{
      'bg-blue-50 border-blue-200': isCurrent,
      'bg-green-50 border-green-200': version.is_published && !isCurrent
    }"
    @click="$emit('click', version)"
  >
    <!-- 版本信息 -->
    <div class="version-info flex items-start justify-between">
      <div class="version-details flex-1 min-w-0">
        <!-- 版本标题 -->
        <div class="version-header flex items-center mb-1">
          <h3 class="version-name text-sm font-medium text-gray-900 truncate">
            {{ version.name || '未命名版本' }}
          </h3>

          <!-- 版本标签 -->
          <div class="version-badges flex items-center ml-2 space-x-1">
            <span
              v-if="isCurrent"
              class="badge bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
            >
              当前
            </span>
            <span
              v-if="version.is_published"
              class="badge bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full"
            >
              已发布
            </span>
          </div>
        </div>

        <!-- 版本号 -->
        <div class="version-number text-xs text-gray-500 mb-1">
          版本 {{ version.version }}
        </div>

        <!-- 版本描述 -->
        <div v-if="version.description" class="version-description text-sm text-gray-600 mb-2 line-clamp-2">
          {{ version.description }}
        </div>

        <!-- 创建信息 -->
        <div class="version-meta flex items-center text-xs text-gray-500">
          <div class="creator flex items-center mr-4">
            <div class="avatar w-4 h-4 bg-gray-300 rounded-full mr-1 flex items-center justify-center">
              <span class="text-xs text-white font-medium">
                {{ version.created_by.name.charAt(0) }}
              </span>
            </div>
            <span>{{ version.created_by.name }}</span>
          </div>

          <div class="created-time">
            {{ formatTime(version.created_at) }}
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="version-actions flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <!-- 恢复按钮 -->
        <button
          v-if="!isCurrent"
          class="action-btn p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded"
          @click.stop="$emit('restore', version)"
          title="恢复到此版本"
        >
          <Icon icon="ri:history-line" class="h-3.5 w-3.5" />
        </button>

        <!-- 编辑按钮 -->
        <button
          class="action-btn p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          @click.stop="$emit('edit', version)"
          title="编辑版本信息"
        >
          <Icon icon="ri:edit-line" class="h-3.5 w-3.5" />
        </button>

        <!-- 复制链接按钮 -->
        <button
          class="action-btn p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          @click.stop="$emit('copy-url', version)"
          title="复制版本链接"
        >
          <Icon icon="ri:link" class="h-3.5 w-3.5" />
        </button>

        <!-- 更多操作 -->
        <div class="relative">
          <button
            class="action-btn p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            @click.stop="toggleContextMenu"
            title="更多操作"
          >
            <Icon icon="ri:more-line" class="h-3.5 w-3.5" />
          </button>

          <!-- 上下文菜单 -->
          <div
            v-if="showContextMenu"
            class="context-menu absolute right-0 top-6 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
            @click.stop
          >
            <button
              class="menu-item w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              @click="handleDuplicate"
            >
              <Icon icon="ri:file-copy-line" class="h-3.5 w-3.5 mr-2" />
              复制版本
            </button>

            <button
              v-if="version.is_published"
              class="menu-item w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              @click="handleUnpublish"
            >
              <Icon icon="ri:eye-off-line" class="h-3.5 w-3.5 mr-2" />
              取消发布
            </button>

            <button
              v-else
              class="menu-item w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              @click="handlePublish"
            >
              <Icon icon="ri:eye-line" class="h-3.5 w-3.5 mr-2" />
              发布版本
            </button>

            <div class="border-t border-gray-100"></div>

            <button
              v-if="!isCurrent"
              class="menu-item w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              @click="handleDelete"
            >
              <Icon icon="ri:delete-bin-line" class="h-3.5 w-3.5 mr-2" />
              删除版本
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 版本状态指示器 -->
    <div
      v-if="isCurrent || version.is_published"
      class="status-indicator absolute left-0 top-0 bottom-0 w-1"
      :class="{
        'bg-blue-500': isCurrent,
        'bg-green-500': version.is_published && !isCurrent
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

interface Props {
  version: VersionHistory
  isCurrent: boolean
}

const props = defineProps<Props>()

defineEmits<{
  click: [version: VersionHistory]
  restore: [version: VersionHistory]
  delete: [version: VersionHistory]
  edit: [version: VersionHistory]
  'copy-url': [version: VersionHistory]
}>()

// 响应式状态
const showContextMenu = ref(false)

// 方法
const toggleContextMenu = () => {
  showContextMenu.value = !showContextMenu.value
}

const handleDuplicate = () => {
  console.log('复制版本:', props.version)
  showContextMenu.value = false
}

const handlePublish = () => {
  console.log('发布版本:', props.version)
  showContextMenu.value = false
}

const handleUnpublish = () => {
  console.log('取消发布版本:', props.version)
  showContextMenu.value = false
}

const handleDelete = () => {
  showContextMenu.value = false
  // 使用父组件的删除事件
  setTimeout(() => {
    // 这里触发父组件的删除方法
    console.log('删除版本:', props.version)
  }, 100)
}

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }

  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }

  // 小于7天
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }

  // 超过7天显示具体日期
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  if (showContextMenu.value) {
    showContextMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.version-history-item {
  /* 版本历史项样式 */
}

.status-indicator {
  /* 状态指示器样式 */
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.context-menu {
  /* 上下文菜单样式 */
  animation: fadeIn 0.1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  /* 菜单项样式 */
}

.menu-item:first-child {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.menu-item:last-child {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}
</style>
