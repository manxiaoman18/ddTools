<script setup lang="ts" name="DataToolView">
import { ref, watch } from 'vue';
import { useMessage, NScrollbar, NInput, NSpace, NRadioGroup, NRadio, NButton, NConfigProvider, NCode, NIcon, NFloatButton } from 'naive-ui';
import DynamicForm from '../components/DynamicForm.vue';
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import type { JsonListItem } from '../entitys/JsonListItem'
import { ExecuteType, executeTypeOptions, jsonReplacer } from '../utils/dataTool'

hljs.registerLanguage('json', json)

const DynamicFormRef = ref<InstanceType<typeof DynamicForm> | null>(null);
const textArea = ref('');
const sqlString = ref('');
const executeType = ref<ExecuteType>(ExecuteType.DbReq);
const message = useMessage();
const jsonList = ref<JsonListItem[]>([]);
const flag = ref(false);

const execute = () => {
    flag.value = false;
    jsonList.value = [];
    const keyList = textArea.value.split(',').map(item => item.trim()).filter(item => item);
    if (keyList.length === 0) {
        message.error('请输入要转换的字段名，用英文逗号隔开');
        return;
    }
    if (executeType.value === ExecuteType.DbReq) {
        sqlString.value = keyList.filter(item => item !== 'is_deleted').map(item => `${item} = \${${item}}`).join(' and ') + ' and is_deleted = 0';
    }
    DynamicFormRef.value?.generateItems(keyList);
}

const copyText = () => {
    if (!flag.value) {
        message.error('请先生成json');
        return;
    }
    navigator.clipboard.writeText(JSON.stringify(jsonList.value, jsonReplacer, 4)).then(() => {
        message.success('复制成功')
    })
}

const getJsonList = () => {
    if (jsonList.value.length > 0) {
        flag.value = true;
    } else {
        message.error('请先转换数据');
    }
}

watch(executeType, () => {
    sqlString.value = '';
    jsonList.value = [];
    flag.value = false;
    DynamicFormRef.value?.clear();
})
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
                        <n-radio v-for="opt in executeTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</n-radio>
                    </n-space>
                </n-radio-group>
                <n-button type="primary" @click="execute" style="margin-top: 1em;">转换</n-button>
                <n-button type="default" @click="getJsonList" style="margin-top: 1em;">生成json</n-button>
                <n-button text tag="a" size="tiny" style="margin-top: 1em;" target="_blank" type="primary"
                    href="./#/revertData">反向解析</n-button>
                <span v-if="executeType === ExecuteType.DbReq" style="margin-top: 1em; display: inline-block;">{{ sqlString }}</span>
            </div>
        </n-scrollbar>
        <n-scrollbar x-scrollable>
            <div class="content middle">
                <div>
                    <n-space vertical>
                        <DynamicForm ref="DynamicFormRef" v-model="jsonList" :execute-type="executeType" />
                    </n-space>
                </div>
            </div>
        </n-scrollbar>
        <n-scrollbar x-scrollable>
            <div class="content right">
                <n-config-provider :hljs="hljs">
                    <n-space vertical>
                        <n-code v-if="flag" :code="JSON.stringify(jsonList, jsonReplacer, 4)" language="json" />
                    </n-space>
                </n-config-provider>
            </div>
        </n-scrollbar>
    </div>
    <div>
        <n-float-button v-if="flag" :right="24" :bottom="24" width="56" height="56" shape="circle" type="primary"
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
    width: 100%;
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
    min-width: 300px;

    &:hover {
        background-color: var(--hover-bg);
    }
}

@media (max-width: 768px) {
    .container {
        flex-direction: column;
    }

    .content {
        min-width: 100%;
        padding: 1em;
    }
}
</style>
