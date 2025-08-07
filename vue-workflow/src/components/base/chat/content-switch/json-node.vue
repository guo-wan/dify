<template>
  <div class="json-node" :style="{ paddingLeft: `${level * 16}px` }">
    <!-- 对象类型 -->
    <div v-if="isObject" class="object-node">
      <div class="node-header flex items-center cursor-pointer" @click="toggleExpanded">
        <Icon
          :icon="isExpanded ? 'ri:arrow-down-s-line' : 'ri:arrow-right-s-line'"
          class="h-3 w-3 text-gray-500 mr-1"
        />
        <span class="text-gray-600">{</span>
        <span v-if="!isExpanded" class="text-gray-400 ml-1">...</span>
        <span class="text-gray-600">}</span>
        <span class="ml-2 text-xs text-gray-400">({{ objectKeys.length }} 项)</span>
      </div>

      <div v-if="isExpanded" class="object-content">
        <div v-for="(key, index) in objectKeys" :key="key" class="object-item">
          <div class="flex items-start">
            <span class="key text-blue-600 mr-2">"{{ key }}":</span>
            <JsonNode
              :data="data[key]"
              :expanded="expanded"
              :level="level + 1"
            />
          </div>
          <span v-if="index < objectKeys.length - 1" class="text-gray-600">,</span>
        </div>
      </div>
    </div>

    <!-- 数组类型 -->
    <div v-else-if="isArray" class="array-node">
      <div class="node-header flex items-center cursor-pointer" @click="toggleExpanded">
        <Icon
          :icon="isExpanded ? 'ri:arrow-down-s-line' : 'ri:arrow-right-s-line'"
          class="h-3 w-3 text-gray-500 mr-1"
        />
        <span class="text-gray-600">[</span>
        <span v-if="!isExpanded" class="text-gray-400 ml-1">...</span>
        <span class="text-gray-600">]</span>
        <span class="ml-2 text-xs text-gray-400">({{ data.length }} 项)</span>
      </div>

      <div v-if="isExpanded" class="array-content">
        <div v-for="(item, index) in data" :key="index" class="array-item">
          <div class="flex items-start">
            <span class="index text-gray-500 mr-2">{{ index }}:</span>
            <JsonNode
              :data="item"
              :expanded="expanded"
              :level="level + 1"
            />
          </div>
          <span v-if="index < data.length - 1" class="text-gray-600">,</span>
        </div>
      </div>
    </div>

    <!-- 字符串类型 -->
    <span v-else-if="isString" class="string-value text-green-600">
      "{{ data }}"
    </span>

    <!-- 数字类型 -->
    <span v-else-if="isNumber" class="number-value text-purple-600">
      {{ data }}
    </span>

    <!-- 布尔类型 -->
    <span v-else-if="isBoolean" class="boolean-value text-orange-600">
      {{ data }}
    </span>

    <!-- null类型 -->
    <span v-else-if="isNull" class="null-value text-gray-500">
      null
    </span>

    <!-- 未知类型 -->
    <span v-else class="unknown-value text-red-600">
      {{ String(data) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  data: any
  expanded?: boolean
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  level: 0
})

// 响应式状态
const isExpanded = ref(props.expanded)

// 计算属性
const isObject = computed(() =>
  typeof props.data === 'object' &&
  props.data !== null &&
  !Array.isArray(props.data)
)

const isArray = computed(() => Array.isArray(props.data))

const isString = computed(() => typeof props.data === 'string')

const isNumber = computed(() => typeof props.data === 'number')

const isBoolean = computed(() => typeof props.data === 'boolean')

const isNull = computed(() => props.data === null)

const objectKeys = computed(() =>
  isObject.value ? Object.keys(props.data) : []
)

// 方法
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.json-node {
  /* JSON节点样式 */
}

.node-header {
  /* 节点头部样式 */
}

.object-node,
.array-node {
  /* 对象和数组节点样式 */
}

.object-item,
.array-item {
  /* 对象项和数组项样式 */
  margin: 2px 0;
}

.key {
  /* 键样式 */
  font-weight: 500;
}

.index {
  /* 索引样式 */
  font-weight: 500;
  min-width: 20px;
}

.string-value,
.number-value,
.boolean-value,
.null-value,
.unknown-value {
  /* 各种值类型样式 */
  font-weight: 500;
}
</style>
