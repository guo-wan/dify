<template>
  <Modal
    v-model:visible="modalVisible"
    :title="env ? '编辑环境变量' : '添加环境变量'"
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
          placeholder="例如：API_KEY"
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
        <Select v-model="formData.value_type">
          <option value="text">文本</option>
          <option value="secret">密钥</option>
        </Select>
        <div class="mt-1 text-xs text-gray-500">
          密钥类型的变量值会被加密存储和显示
        </div>
      </div>

      <!-- 变量值 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          变量值 <span class="text-red-500">*</span>
        </label>
        <div v-if="formData.value_type === 'secret'" class="relative">
          <Input
            v-model="formData.value"
            :type="showSecret ? 'text' : 'password'"
            placeholder="请输入密钥值"
          />
          <button
            type="button"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            @click="showSecret = !showSecret"
          >
            <Icon
              :icon="showSecret ? 'ri:eye-off-line' : 'ri:eye-line'"
              class="h-4 w-4 text-gray-500"
            />
          </button>
        </div>
        <textarea
          v-else
          v-model="formData.value"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          rows="3"
          placeholder="请输入变量值"
        />
        <div v-if="valueError" class="mt-1 text-sm text-red-600">
          {{ valueError }}
        </div>
      </div>

      <!-- 描述 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          描述
        </label>
        <Input
          v-model="formData.description"
          placeholder="请输入变量描述（可选）"
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
        {{ env ? '保存' : '添加' }}
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

interface EnvironmentVariable {
  id: string
  name: string
  value: string
  value_type: 'text' | 'secret'
  description?: string
}

interface Props {
  visible: boolean
  env?: EnvironmentVariable
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  save: [env: EnvironmentVariable]
  close: []
}>()

// 响应式状态
const modalVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const formData = ref({
  name: '',
  value: '',
  value_type: 'text' as 'text' | 'secret',
  description: ''
})

const showSecret = ref(false)
const nameError = ref('')
const valueError = ref('')

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

const validateValue = () => {
  valueError.value = ''

  if (!formData.value.value) {
    valueError.value = '变量值不能为空'
    return false
  }

  return true
}

const isValid = computed(() => {
  return formData.value.name &&
         formData.value.value &&
         !nameError.value &&
         !valueError.value
})

// 方法
const handleSubmit = () => {
  if (!validateName() || !validateValue()) {
    return
  }

  const envData: EnvironmentVariable = {
    id: props.env?.id || '',
    name: formData.value.name,
    value: formData.value.value,
    value_type: formData.value.value_type,
    description: formData.value.description || undefined
  }

  emit('save', envData)
}

const handleClose = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    value: '',
    value_type: 'text',
    description: ''
  }
  nameError.value = ''
  valueError.value = ''
  showSecret.value = false
}

// 监听props变化，初始化表单数据
watch(() => props.env, (newEnv) => {
  if (newEnv) {
    formData.value = {
      name: newEnv.name,
      value: newEnv.value === '[__HIDDEN__]' ? '' : newEnv.value,
      value_type: newEnv.value_type,
      description: newEnv.description || ''
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
