<script setup lang="ts">
import { NTooltip, NInput } from 'naive-ui'
import type { JsonListItem } from '../../entitys/JsonListItem'

defineProps<{ items: JsonListItem[] }>()
</script>

<template>
  <div v-for="(jsonObj, index) in items" :key="index">
    <div class="form" :id="jsonObj.key">
      <div class="form-item">
        <n-tooltip trigger="hover" :show-arrow="false">
          <template #trigger><label class="left-ele">key:</label></template>
          当前编辑的字段名，应该等于对应数据表中的字段名，dbutil根据该字段值从表里取数，不可修改
        </n-tooltip>
        <n-input class="right-ele" v-model:value="jsonObj.key" disabled />
      </div>
      <div class="form-item">
        <n-tooltip trigger="hover" :show-arrow="false">
          <template #trigger><label class="left-ele">alias:</label></template>
          当前字段名在dbutil页面查询框前显示的别名，例如key=mall_name，这里写店铺名，则最终dbutil的查询项的字段名会显示"店铺名"
        </n-tooltip>
        <n-input class="right-ele" v-model:value="jsonObj.alias" />
      </div>
      <div class="form-item">
        <n-tooltip trigger="hover" :show-arrow="false">
          <template #trigger><label class="left-ele">width:</label></template>
          当前字段在dbutil页面显示的输入框宽度，一般300px就够啦
        </n-tooltip>
        <n-input class="right-ele" v-model:value="jsonObj.width" />
      </div>
      <div class="form-item">
        <n-tooltip trigger="hover" :show-arrow="false">
          <template #trigger><label class="left-ele">default:</label></template>
          当前字段在dbutil页面输入框内显示的默认值，如果该字段查询时经常使用某个值的话可以设置一下，省得每次都手动输入
        </n-tooltip>
        <n-input class="right-ele" v-model:value="jsonObj.default" />
      </div>
      <hr />
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
