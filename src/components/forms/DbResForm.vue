<script setup lang="ts">
import { NTooltip, NInput, NSwitch } from 'naive-ui'
import type { JsonListItem } from '../../entitys/JsonListItem'
import { railStyle } from '../../utils/dataTool'

defineProps<{ items: JsonListItem[] }>()
</script>

<template>
  <div v-for="(jsonObj, index) in items" :key="index">
    <div class="form">
      <div class="form-item">
        <n-tooltip trigger="hover" :show-arrow="false">
          <template #trigger><label class="left-ele">key:</label></template>
          当前编辑的字段名，应该等于对应数据表中的字段名，不可修改
        </n-tooltip>
        <n-input class="right-ele" v-model:value="jsonObj.key" disabled />
      </div>
      <div class="form-item">
        <n-tooltip trigger="hover" :show-arrow="false">
          <template #trigger><label class="left-ele">alias:</label></template>
          当前字段名在dbutil页查询结果的表头处显示的别名，例如key=mall_name，这里写店铺名，则最终dbutil的查询结果的表头显示效果为"店铺名(mall_name)"
        </n-tooltip>
        <n-input class="right-ele" v-model:value="jsonObj.alias" />
      </div>
      <div class="form-item">
        <n-tooltip trigger="hover" :show-arrow="false">
          <template #trigger><label class="left-ele">desc:</label></template>
          当前字段名在dbutil页查询结果的表头处hover时显示的提示文字，可以对该字段进行解释说明
        </n-tooltip>
        <n-input class="right-ele" v-model:value="jsonObj.desc" />
      </div>
      <div class="form-item">
        <n-tooltip trigger="hover" :show-arrow="false">
          <template #trigger><label class="left-ele">primary:</label></template>
          当前字段是否是主键，通过dbtuil编辑表数据保存的时候实际是根据主键进行update的，一般默认id字段是主键
        </n-tooltip>
        <n-switch v-model:value="jsonObj.primary" :rail-style="railStyle">
          <template #checked>用作主键</template>
          <template #unchecked>不作主键</template>
        </n-switch>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form {
  margin-top: 1em;
  display: flex;
  border-bottom: 1px solid var(--border-color);
  flex-direction: column;
}
.form-item {
  margin-bottom: 1em;
  display: flex;
  align-items: center;
}
.left-ele {
  text-align: right;
  margin-right: 2em;
  min-width: 20%;
}
.right-ele {
  flex-grow: 1;
}
</style>
