<template>
  <div class="form-item">
    <!-- 标签 -->
    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700">
        {{ payload.label }}
        <span v-if="payload.required" class="text-red-500 ml-1">*</span>
      </label>
      <div v-if="payload.description" class="text-xs text-gray-500 mt-1">
        {{ payload.description }}
      </div>
    </div>

    <!-- 输入控件 -->
    <div class="form-control">
      <!-- 文本输入 -->
      <Input
        v-if="payload.type === 'string'"
        v-model="inputValue"
        :placeholder="`请输入${payload.label}`"
        :auto-focus="autoFocus"
        @update:model-value="handleChange"
      />

      <!-- 段落文本 -->
      <textarea
        v-else-if="payload.type === 'paragraph'"
        v-model="inputValue"
        :placeholder="`请输入${payload.label}`"
        :auto-focus="autoFocus"
        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        rows="4"
        @input="handleChange"
      />

      <!-- 数字输入 -->
      <Input
        v-else-if="payload.type === 'number'"
        v-model="inputValue"
        type="number"
        :placeholder="`请输入${payload.label}`"
        :auto-focus="autoFocus"
        :min="payload.min"
        :max="payload.max"
        :step="payload.step || 0.1"
        @update:model-value="handleChange"
      />

      <!-- 选择器 -->
      <Select
        v-else-if="payload.type === 'select'"
        v-model="inputValue"
        :placeholder="`请选择${payload.label}`"
        @update:model-value="handleChange"
      >
        <option
          v-for="option in payload.options"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </Select>

      <!-- 布尔值 -->
      <div v-else-if="payload.type === 'boolean'" class="flex items-center">
        <input
          :id="payload.variable"
          v-model="inputValue"
          type="checkbox"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          @change="handleChange"
        />
        <label :for="payload.variable" class="ml-2 text-sm text-gray-700">
          启用 {{ payload.label }}
        </label>
      </div>

      <!-- 文件上传 -->
      <div v-else-if="payload.type === 'files'" class="space-y-2">
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
          <Icon icon="ri:upload-cloud-line" class="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <div class="text-sm text-gray-600">
            <button class="text-blue-600 hover:text-blue-700 font-medium">
              点击上传文件
            </button>
            或拖拽文件到此处
          </div>
          <div class="text-xs text-gray-500 mt-1">
            支持 PDF、Word、图片等格式
          </div>
        </div>

        <!-- 已上传文件列表 -->
        <div v-if="fileList.length" class="space-y-2">
          <div
            v-for="file in fileList"
            :key="file.id"
            class="flex items-center justify-between bg-gray-50 rounded p-2"
          >
            <div class="flex items-center">
              <Icon icon="ri:file-line" class="h-4 w-4 text-gray-500 mr-2" />
              <span class="text-sm">{{ file.name }}</span>
            </div>
            <button
              class="text-red-500 hover:text-red-700 p-1"
              @click="removeFile(file.id)"
            >
              <Icon icon="ri:close-line" class="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <!-- 数组类型 -->
      <div v-else-if="payload.type === 'array'" class="space-y-2">
        <div
          v-for="(item, index) in arrayValue"
          :key="index"
          class="flex items-center space-x-2"
        >
          <Input
            v-model="arrayValue[index]"
            :placeholder="`${payload.label} ${index + 1}`"
            class="flex-1"
            @update:model-value="updateArrayItem(index, $event)"
          />
          <button
            class="text-red-500 hover:text-red-700 p-2"
            @click="removeArrayItem(index)"
          >
            <Icon icon="ri:delete-bin-line" class="h-4 w-4" />
          </button>
        </div>

        <button
          class="flex items-center text-blue-600 hover:text-blue-700 text-sm"
          @click="addArrayItem"
        >
          <Icon icon="ri:add-line" class="h-4 w-4 mr-1" />
          添加项目
        </button>
      </div>

      <!-- 代码编辑器 -->
      <div v-else-if="payload.type === 'code'" class="border border-gray-300 rounded-lg overflow-hidden">
        <textarea
          v-model="inputValue"
          :placeholder="`请输入${payload.label}代码`"
          class="w-full p-3 font-mono text-sm bg-gray-50 border-0 focus:ring-0 outline-none resize-none"
          rows="8"
          @input="handleChange"
        />
      </div>

      <!-- 默认文本输入 -->
      <Input
        v-else
        v-model="inputValue"
        :placeholder="`请输入${payload.label}`"
        :auto-focus="autoFocus"
        @update:model-value="handleChange"
      />
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="mt-1 text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Input from '@/components/base/input/index.vue'
import Select from '@/components/base/select/index.vue'

interface InputVariable {
  variable: string
  type: string
  label: string
  required?: boolean
  default?: any
  options?: string[]
  description?: string
  min?: number
  max?: number
  step?: number
}

interface Props {
  payload: InputVariable
  value?: any
  autoFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoFocus: false
})

const emit = defineEmits<{
  change: [value: any]
}>()

// 内部状态
const inputValue = ref(props.value)
const fileList = ref<Array<{ id: string; name: string }>>([])
const arrayValue = ref<string[]>(Array.isArray(props.value) ? props.value : [''])
const errorMessage = ref('')

// 监听外部value变化
watch(() => props.value, (newValue) => {
  inputValue.value = newValue
  if (Array.isArray(newValue)) {
    arrayValue.value = newValue
  }
})

// 监听内部值变化并验证
watch(() => inputValue.value, () => {
  validateInput()
})

// 处理值变化
const handleChange = () => {
  let value = inputValue.value

  // 类型转换
  if (props.payload.type === 'number') {
    value = value === '' ? undefined : Number(value)
  }

  validateInput()
  emit('change', value)
}

// 验证输入
const validateInput = () => {
  errorMessage.value = ''

  if (props.payload.required && !inputValue.value) {
    errorMessage.value = `${props.payload.label}为必填项`
    return
  }

  if (props.payload.type === 'number' && inputValue.value !== undefined) {
    const num = Number(inputValue.value)
    if (isNaN(num)) {
      errorMessage.value = '请输入有效的数字'
      return
    }

    if (props.payload.min !== undefined && num < props.payload.min) {
      errorMessage.value = `最小值为 ${props.payload.min}`
      return
    }

    if (props.payload.max !== undefined && num > props.payload.max) {
      errorMessage.value = `最大值为 ${props.payload.max}`
      return
    }
  }
}

// 数组操作
const updateArrayItem = (index: number, value: string) => {
  arrayValue.value[index] = value
  emit('change', [...arrayValue.value])
}

const addArrayItem = () => {
  arrayValue.value.push('')
  emit('change', [...arrayValue.value])
}

const removeArrayItem = (index: number) => {
  arrayValue.value.splice(index, 1)
  emit('change', [...arrayValue.value])
}

// 文件操作
const removeFile = (fileId: string) => {
  const index = fileList.value.findIndex(f => f.id === fileId)
  if (index > -1) {
    fileList.value.splice(index, 1)
    emit('change', [...fileList.value])
  }
}

// 初始化
if (props.payload.default !== undefined && inputValue.value === undefined) {
  inputValue.value = props.payload.default
  handleChange()
}
</script>

<style scoped>
.form-item {
  /* 可以添加特定样式 */
}

.form-control {
  /* 可以添加表单控件样式 */
}
</style>
