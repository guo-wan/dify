<template>
  <div class="chart-renderer">
    <!-- 图表标题 -->
    <div v-if="data.title" class="chart-title text-lg font-semibold text-gray-900 mb-4">
      {{ data.title }}
    </div>

    <!-- 图表容器 -->
    <div ref="chartContainer" class="chart-container bg-white rounded-lg border border-gray-200 p-4">
      <!-- 柱状图 -->
      <div v-if="data.type === 'bar'" class="bar-chart">
        <div class="chart-header flex items-center justify-between mb-4">
          <div class="text-sm font-medium text-gray-700">柱状图</div>
          <div class="chart-legend flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-blue-500 rounded mr-1"></div>
              <span class="text-xs text-gray-600">数据</span>
            </div>
          </div>
        </div>

        <div class="bars-container space-y-2">
          <div
            v-for="(item, index) in normalizedData"
            :key="index"
            class="bar-item flex items-center"
          >
            <div class="bar-label w-20 text-sm text-gray-700 truncate">
              {{ item.label }}
            </div>
            <div class="bar-track flex-1 bg-gray-200 rounded-full h-6 relative">
              <div
                class="bar-fill bg-blue-500 h-full rounded-full transition-all duration-300"
                :style="{ width: `${item.percentage}%` }"
              ></div>
              <div class="bar-value absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-white">
                {{ item.value }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 折线图 -->
      <div v-else-if="data.type === 'line'" class="line-chart">
        <div class="chart-header flex items-center justify-between mb-4">
          <div class="text-sm font-medium text-gray-700">折线图</div>
        </div>

        <div class="line-container h-40 border border-gray-200 rounded relative">
          <svg class="w-full h-full">
            <polyline
              :points="linePoints"
              fill="none"
              stroke="#3b82f6"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle
              v-for="(point, index) in linePointsArray"
              :key="index"
              :cx="point.x"
              :cy="point.y"
              r="3"
              fill="#3b82f6"
            />
          </svg>

          <!-- X轴标签 -->
          <div class="x-labels absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-gray-600">
            <span v-for="(item, index) in normalizedData" :key="index">
              {{ item.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- 饼图 -->
      <div v-else-if="data.type === 'pie'" class="pie-chart">
        <div class="chart-header flex items-center justify-between mb-4">
          <div class="text-sm font-medium text-gray-700">饼图</div>
        </div>

        <div class="pie-container flex items-center justify-between">
          <!-- 饼图SVG -->
          <div class="pie-svg relative">
            <svg width="120" height="120" class="transform -rotate-90">
              <circle
                v-for="(segment, index) in pieSegments"
                :key="index"
                :cx="60"
                :cy="60"
                :r="40"
                fill="none"
                :stroke="segment.color"
                stroke-width="20"
                :stroke-dasharray="`${segment.length} ${circumference - segment.length}`"
                :stroke-dashoffset="-segment.offset"
                class="transition-all duration-300"
              />
            </svg>
          </div>

          <!-- 图例 -->
          <div class="pie-legend flex-1 ml-6 space-y-2">
            <div
              v-for="(item, index) in normalizedData"
              :key="index"
              class="legend-item flex items-center"
            >
              <div
                class="w-3 h-3 rounded mr-2"
                :style="{ backgroundColor: getColor(index) }"
              ></div>
              <span class="text-sm text-gray-700">{{ item.label }}</span>
              <span class="ml-auto text-sm font-medium">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 散点图 -->
      <div v-else-if="data.type === 'scatter'" class="scatter-chart">
        <div class="chart-header flex items-center justify-between mb-4">
          <div class="text-sm font-medium text-gray-700">散点图</div>
        </div>

        <div class="scatter-container h-40 border border-gray-200 rounded relative bg-gray-50">
          <svg class="w-full h-full">
            <circle
              v-for="(point, index) in scatterPoints"
              :key="index"
              :cx="point.x"
              :cy="point.y"
              r="4"
              :fill="getColor(index % 5)"
              class="opacity-70 hover:opacity-100 transition-opacity"
            />
          </svg>
        </div>
      </div>

      <!-- 不支持的图表类型 -->
      <div v-else class="unsupported-chart text-center py-8 text-gray-500">
        <Icon icon="ri:bar-chart-line" class="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p>不支持的图表类型: {{ data.type }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ChartDataItem {
  label: string
  value: number
  x?: number
  y?: number
}

interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'scatter'
  title?: string
  data: ChartDataItem[]
  options?: any
}

interface Props {
  data: ChartData
}

const props = defineProps<Props>()

// 计算属性
const normalizedData = computed(() => {
  if (!props.data.data || !Array.isArray(props.data.data)) return []

  const maxValue = Math.max(...props.data.data.map(item => item.value))

  return props.data.data.map(item => ({
    ...item,
    percentage: maxValue > 0 ? (item.value / maxValue) * 100 : 0
  }))
})

const linePoints = computed(() => {
  if (normalizedData.value.length === 0) return ''

  const width = 300 // 假设容器宽度
  const height = 120 // 假设容器高度
  const padding = 20

  const points = normalizedData.value.map((item, index) => {
    const x = padding + (index / (normalizedData.value.length - 1)) * (width - 2 * padding)
    const y = height - padding - (item.percentage / 100) * (height - 2 * padding)
    return `${x},${y}`
  })

  return points.join(' ')
})

const linePointsArray = computed(() => {
  if (normalizedData.value.length === 0) return []

  const width = 300
  const height = 120
  const padding = 20

  return normalizedData.value.map((item, index) => ({
    x: padding + (index / (normalizedData.value.length - 1)) * (width - 2 * padding),
    y: height - padding - (item.percentage / 100) * (height - 2 * padding)
  }))
})

const circumference = computed(() => 2 * Math.PI * 40) // r=40

const pieSegments = computed(() => {
  const total = normalizedData.value.reduce((sum, item) => sum + item.value, 0)
  let currentOffset = 0

  return normalizedData.value.map((item, index) => {
    const percentage = total > 0 ? item.value / total : 0
    const length = percentage * circumference.value
    const segment = {
      length,
      offset: currentOffset,
      color: getColor(index)
    }
    currentOffset += length
    return segment
  })
})

const scatterPoints = computed(() => {
  if (!props.data.data || props.data.type !== 'scatter') return []

  const width = 300
  const height = 120
  const padding = 20

  return props.data.data.map(item => ({
    x: padding + ((item.x || Math.random()) * (width - 2 * padding)),
    y: padding + ((item.y || Math.random()) * (height - 2 * padding))
  }))
})

// 方法
const getColor = (index: number) => {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ]
  return colors[index % colors.length]
}
</script>

<style scoped>
.chart-renderer {
  /* 图表渲染器样式 */
}

.chart-container {
  /* 图表容器样式 */
  min-height: 200px;
}

.bar-chart .bar-item {
  /* 柱状图项样式 */
}

.bar-track {
  /* 柱状图轨道样式 */
}

.bar-fill {
  /* 柱状图填充样式 */
}

.line-chart .line-container {
  /* 折线图容器样式 */
}

.pie-chart .pie-container {
  /* 饼图容器样式 */
}

.scatter-chart .scatter-container {
  /* 散点图容器样式 */
}
</style>
