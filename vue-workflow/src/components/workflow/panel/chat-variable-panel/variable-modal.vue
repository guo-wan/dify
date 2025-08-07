<template>
  <Modal
    v-model:visible="modalVisible"
    :title="variable ? '编辑聊天变量' : '添加聊天变量'"
    size="md"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 变量名 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          变量名 <span class="text-red-500">*</span>
        </label>
        <Input
          v-model="formData.name"
          placeholder="例如：user_name"
          :auto-focus="true"
          @update:model-value="validateName"
        />
        <div v-if="nameError" class="mt-1 text-sm text-red-600">
          {{ nameError }}
        </div>
        <div class="mt-1 text-xs text-gray-500">
          变量名只能包含字母、数字和下划线，且以字母开头
        </div>
      </div>

      <!-- 变量类型 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          变量类型 <span class="text-red-500">*</span>
        </label>
        <Select v-model="formData.value_type" @update:model-value="handleTypeChange">
          <option value="string">字符串</option>
          <option value="number">数字</option>
          <option value="select">选择</option>
          <option value="array">数组</option>
        </Select>
        <div class="mt-1 text-xs text-gray-500">
          选择变量的数据类型
        </div>
      </div>

      <!-- 选项设置（仅选择类型） -->
      <div v-if="formData.value_type === 'select'" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          可选值 <span class="text-red-500">*</span>
        </label>
        <div class="space-y-2">
          <div
            v-for="(option, index) in formData.options"
            :key="index"
            class="flex items-center space-x-2"
          >
            <Input
              v-model="formData.options[index]"
              :placeholder="`选项 ${index + 1}`"
              class="flex-1"
            />
            <button
              type="button"
              class="text-red-500 hover:text-red-700 p-2"
              @click="removeOption(index)"
            >
              <Icon icon="ri:delete-bin-line" class="h-4 w-4" />
            </button>
          </div>
        </div>
        <button
          type="button"
          class="flex items-center text-blue-600 hover:text-blue-700 text-sm"
          @click="addOption"
        >
          <Icon icon="ri:add-line" class="h-4 w-4 mr-1" />
          添加选项
        </button>
      </div>

      <!-- 默认值 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          默认值
        </label>

        <!-- 字符串类型 -->
        <Input
          v-if="formData.value_type === 'string'"
          v-model="formData.default"
          placeholder="请输入默认值"
        />

        <!-- 数字类型 -->
        <Input
          v-else-if="formData.value_type === 'number'"
          v-model="formData.default"
          type="number"
          placeholder="请输入默认数字"
        />

        <!-- 选择类型 -->
        <Select
          v-else-if="formData.value_type === 'select'"
          v-model="formData.default"
          placeholder="请选择默认值"
        >
          <option value="">无默认值</option>
          <option
            v-for="option in formData.options"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </Select>

        <!-- 数组类型 -->
        <div v-else-if="formData.value_type === 'array'" class="space-y-2">
          <div
            v-for="(item, index) in arrayDefault"
            :key="index"
            class="flex items-center space-x-2"
          >
            <Input
              v-model="arrayDefault[index]"
              :placeholder="`项目 ${index + 1}`"
              class="flex-1"
            />
            <button
              type="button"
              class="text-red-500 hover:text-red-700 p-2"
              @click="removeArrayItem(index)"
            >
              <Icon icon="ri:delete-bin-line" class="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            class="flex items-center text-blue-600 hover:text-blue-700 text-sm"
            @click="addArrayItem"
          >
            <Icon icon="ri:add-line" class="h-4 w-4 mr-1" />
            添加项目
          </button>
        </div>
      </div>

      <!-- 描述 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          描述
        </label>
        <textarea
          v-model="formData.description"
          placeholder="请输入变量描述（可选）"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          rows="2"
        />
      </div>
    </form>

    <template #footer>
      <Button variant="secondary" @click="handleClose">
        取消
      </Button>
      <Button
        variant="primary"
        :disabled="!isValid"
        @click="handleSubmit"
      >
        {{ variable ? '保存' : '添加' }}
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '@/components/base/modal/index.vue'
import Input from '@/components/base/input/index.vue'
import Select from '@/components/base/select/index.vue'
import Button from '@/components/base/button/index.vue'

interface ConversationVariable {
  id: string
  name: string
  value_type: 'string' | 'number' | 'select' | 'array'
  description?: string
  default?: any
  options?: string[]
}

interface Props {
  visible: boolean
  variable?: ConversationVariable
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  save: [variable: ConversationVariable]
  close: []
}>()

// 响应式状态
const modalVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const formData = ref({
  name: '',
  value_type: 'string' as 'string' | 'number' | 'select' | 'array',
  description: '',
  default: '',
  options: ['']
})

const arrayDefault = ref<string[]>([''])
const nameError = ref('')

// 验证规则
const validateName = () => {
  nameError.value = ''

  if (!formData.value.name) {
    nameError.value = '变量名不能为空'
    return false
  }

  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.value.name)) {
    nameError.value = '变量名只能包含字母、数字和下划线，且以字母开头'
    return false
  }

  return true
}

const isValid = computed(() => {
  const hasName = formData.value.name && !nameError.value

  if (formData.value.value_type === 'select') {
    const hasValidOptions = formData.value.options.some(opt => opt.trim())
    return hasName && hasValidOptions
  }

  return hasName
})

// 方法
const handleTypeChange = () => {
  // 重置默认值和选项
  formData.value.default = ''
  if (formData.value.value_type === 'select') {
    formData.value.options = ['']
  } else if (formData.value.value_type === 'array') {
    arrayDefault.value = ['']
  }
}

const addOption = () => {
  formData.value.options.push('')
}

const removeOption = (index: number) => {
  if (formData.value.options.length > 1) {
    formData.value.options.splice(index, 1)
  }
}

const addArrayItem = () => {
  arrayDefault.value.push('')
}

const removeArrayItem = (index: number) => {
  if (arrayDefault.value.length > 1) {
    arrayDefault.value.splice(index, 1)
  }
}

const handleSubmit = () => {
  if (!validateName()) {
    return
  }

  let defaultValue = formData.value.default
  if (formData.value.value_type === 'array') {
    defaultValue = arrayDefault.value.filter(item => item.trim())
  } else if (formData.value.value_type === 'number') {
    defaultValue = defaultValue ? Number(defaultValue) : undefined
  }

  const variableData: ConversationVariable = {
    id: props.variable?.id || '',
    name: formData.value.name,
    value_type: formData.value.value_type,
    description: formData.value.description || undefined,
    default: defaultValue,
    options: formData.value.value_type === 'select'
      ? formData.value.options.filter(opt => opt.trim())
      : undefined
  }

  emit('save', variableData)
}

const handleClose = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    value_type: 'string',
    description: '',
    default: '',
    options: ['']
  }
  arrayDefault.value = ['']
  nameError.value = ''
}

// 监听props变化，初始化表单数据
watch(() => props.variable, (newVar) => {
  if (newVar) {
    formData.value = {
      name: newVar.name,
      value_type: newVar.value_type,
      description: newVar.description || '',
      default: newVar.value_type === 'array' ? '' : (newVar.default || ''),
      options: newVar.options || ['']
    }

    if (newVar.value_type === 'array' && Array.isArray(newVar.default)) {
      arrayDefault.value = newVar.default.length ? newVar.default : ['']
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
