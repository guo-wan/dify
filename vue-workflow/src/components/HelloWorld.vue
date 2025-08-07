<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
  <h1 class="text-3xl font-bold text-blue-600 mb-4">{{ msg }}</h1>
  <div class="card p-4 bg-white rounded shadow flex flex-col gap-4">
    <button type="button" @click="count++" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
    <!-- Naive UI 示例 -->
    <n-button type="primary">Naive UI 按钮</n-button>
  </div>
  <p class="mt-4">
    TailwindCSS 和 Naive UI 已集成。
  </p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
