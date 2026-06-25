<script setup lang="ts" name="RevertDataView">
import DynamicForm from "../components/DynamicForm.vue";
import { NScrollbar, NInput, NSpace, NRadioGroup, NRadio, NButton, useMessage } from 'naive-ui';
import { ref } from "vue";
import type { JsonListItem } from '../entitys/JsonListItem'
import { ExecuteType, executeTypeOptions, jsonReplacer } from '../utils/dataTool'

const executeType = ref<ExecuteType>(ExecuteType.DbReq);
const jsonText = ref('');
const jsonList = ref<JsonListItem[]>([]);
const message = useMessage();
const DynamicFormRef = ref<InstanceType<typeof DynamicForm> | null>(null);

const handleUpdateJson = (newJsonList: JsonListItem[]) => {
    jsonText.value = JSON.stringify(newJsonList, jsonReplacer, 2);
};

const revertData = () => {
    try {
        const parsedJson = JSON.parse(jsonText.value);
        DynamicFormRef.value?.setFormData(parsedJson);
    } catch (error) {
        message.error(`JSON解析失败: ${(error as Error).message}`);
    }
}
</script>

<template>
    <div class="container">
        <n-scrollbar x-scrollable>
            <div class="content left">
                <n-input v-model:value="jsonText" type="textarea" placeholder="请输入json文本"
                    :autosize="{ minRows: 10, maxRows: 20 }" />
                <n-radio-group v-model:value="executeType" name="executeTypeGroup">
                    <n-space style="margin-top: 1em;">
                        <n-radio v-for="opt in executeTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</n-radio>
                    </n-space>
                </n-radio-group>
                <n-button style="margin-top: 1em;" @click="revertData" type="primary">解析</n-button>
            </div>
        </n-scrollbar>
        <n-scrollbar x-scrollable>
            <div class="content middle">
                <div>
                    <n-space vertical>
                        <DynamicForm ref="DynamicFormRef" v-model="jsonList" :execute-type="executeType"
                            @update:model-value="handleUpdateJson" />
                    </n-space>
                </div>
            </div>
        </n-scrollbar>
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
