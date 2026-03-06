<script setup lang="ts" name="DataToolView">
import { reactive, ref, watch } from 'vue';
import { useMessage, NScrollbar, NInput, NSpace, NRadioGroup, NRadio, NButton, NConfigProvider, NCode, NIcon, NFloatButton } from 'naive-ui';
import DynamicForm from '../components/DynamicForm.vue';
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'

const DynamicFormRef = ref<InstanceType<typeof DynamicForm> | null>(null);
hljs.registerLanguage('json', json)
const textArea = ref('');
const sqlString = ref('');
const executeType = ref(1);
const message = useMessage();
let keyList: string[] = [];
let jsonList: object[] = reactive([]);
const flag = ref(false);
const execute = () => {
    flag.value = false;
    jsonList = [];
    keyList = textArea.value.split(',').map(item => item.trim()).filter(item => item);
    if (executeType.value === 1) {
        sqlString.value = keyList.filter(item => item !== 'is_deleted').map(item => `${item} = \${${item}}`).join(' and ') + ' and is_deleted = 0';
    }
    if (DynamicFormRef.value) {
        DynamicFormRef.value.renderJson(executeType.value, keyList);
    }
    if (keyList.length === 0) {
        message.error('请输入要转换的字段名，用英文逗号隔开');
        return;
    }
}
const copyText = () => {
    if (!flag.value) {
        message.error('请先生成json');
        return;
    }
    navigator.clipboard.writeText(JSON.stringify(jsonList, replacer, 4)).then(() => {
        message.success('复制成功')
    })
}
const getJsonList = () => {
    if (DynamicFormRef.value) {
        if (DynamicFormRef.value.jsonList.length > 0) {
            jsonList = [];
            jsonList.push(...DynamicFormRef.value.jsonList);
            if (jsonList.length > 0) {
                flag.value = true;
            }
        } else {
            message.error('请先转换数据');
        }

    }

}
// 监听executeType的变化,参数可以有(newVal,oldVal) 2个，但是这里只用到new值，所以省略old值
watch(executeType, (newVal) => {
    if (newVal) {
        sqlString.value = '';
        jsonList = [];
        flag.value = false;
        if (DynamicFormRef.value) {
            DynamicFormRef.value.renderJson(0, []);
        }
    }
})
// 过滤掉值为 null 或空字符串的属性
const replacer = (key: any, value: any) => {
    if (key === 'optionList' || key === 'optionValueType') {
        return undefined;
    }
    // 如果值是 null 或者是一个空字符串，则返回 undefined，这样它就不会被包含在最终的 JSON 字符串中
    if (value === null || value === '') {
        return undefined;
    }
    // 对于其他情况，返回该值（保持不变）
    return value;
}
</script>

<template>
    <div class="container">
        <n-scrollbar x-scrollable>
            <div class="content left">

                <label>待转换字段
                    <n-input v-model:value="textArea" autofocus placeholder="请输入字段名，以英文逗号隔开" type="textarea"
                        :autosize="{ minRows: 3, maxRows: 10, }" />
                </label>
                <n-radio-group v-model:value="executeType" name="executeTypeGroup">
                    <n-space style="margin-top: 1em;">
                        <n-radio :value="1">dbutil请求结构体</n-radio>
                        <n-radio :value="2">dbutil响应结构体</n-radio>
                        <n-radio :value="3">dg请求入参</n-radio>
                    </n-space>
                </n-radio-group>
                <n-button type="primary" @click="execute" style="margin-top: 1em;">转换</n-button>
                <n-button type="default" @click="getJsonList" style="margin-top: 1em;">生成json</n-button>
                <n-button text tag="a" size="tiny" style="margin-top: 1em;" target="_blank" type="primary"
                    href="./#/revertData">反向解析</n-button>
                <span v-if="executeType === 1" @update:value="sqlString" style="margin-top: 1em;">{{ sqlString }}</span>
            </div>
        </n-scrollbar>
        <n-scrollbar x-scrollable>
            <div class="content middle">
                <div>
                    <n-space vertical>
                        <DynamicForm ref="DynamicFormRef"></DynamicForm>
                    </n-space>
                </div>
            </div>
        </n-scrollbar>
        <n-scrollbar x-scrollable>
            <div class="content right">
                <n-config-provider :hljs="hljs">
                    <n-space vertical>
                        <n-code v-if="flag" :code="JSON.stringify(jsonList, replacer, 4)" language="json" />
                    </n-space>
                </n-config-provider>
            </div>
        </n-scrollbar>
    </div>
    <div>
        <n-float-button v-if="flag" :right="300" :bottom="200" width="75" height="75" shape="circle" type="primary"
            @click="copyText">
            <n-icon size="1.5em">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">
                    <path
                        d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2z"
                        fill="currentColor"></path>
                    <path d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4z" fill="currentColor"></path>
                </svg>
            </n-icon>
        </n-float-button>
    </div>
</template>

<style scoped>
.container {
    height: 100%;
    width: 95%;
    display: flex;
    flex-direction: row;
    overflow: auto;
}

.content {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    flex-shrink: 0;
    padding: 2em;

    &:hover {
        background-color: #f7f5f5;
    }
}
</style>