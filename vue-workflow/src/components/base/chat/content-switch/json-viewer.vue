<template>
  <div class="json-viewer">
    <div class="json-content font-mono text-sm">
      <JsonNode
        :data="data"
        :expanded="expanded"
        :level="0"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import JsonNode from './json-node.vue'

interface Props {
  data: any
  expanded?: boolean
}

withDefaults(defineProps<Props>(), {
  expanded: false
})
</script>

<style scoped>
.json-viewer {
  /* JSON查看器样式 */
}

.json-content {
  /* JSON内容样式 */
}
</style>
