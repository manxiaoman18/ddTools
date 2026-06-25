<script setup lang="ts" name="DynamicForm">
import { computed, watch } from 'vue'
import type { JsonListItem } from '../entitys/JsonListItem'
import { ExecuteType, createItems, parseOptionsToList } from '../utils/dataTool'
import DbReqForm from './forms/DbReqForm.vue'
import DbResForm from './forms/DbResForm.vue'
import DgForm from './forms/DgForm.vue'

const props = defineProps<{
  modelValue: JsonListItem[]
  executeType: ExecuteType
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: JsonListItem[]): void
}>()

const items = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const currentComponent = computed(() => {
  switch (props.executeType) {
    case ExecuteType.DbReq: return DbReqForm
    case ExecuteType.DbRes: return DbResForm
    case ExecuteType.DgReq: return DgForm
    default: return null
  }
})

const generateItems = (keys: string[]) => {
  items.value = createItems(props.executeType, keys)
}

const setFormData = (data: JsonListItem[]) => {
  data.forEach(item => parseOptionsToList(item))
  items.value = [...data]
}

const clear = () => {
  items.value = []
}

watch(items, (val) => emit('update:modelValue', val), { deep: true })

defineExpose({ generateItems, setFormData, clear })
</script>

<template>
  <component v-if="currentComponent" :is="currentComponent" :items="items" />
</template>
