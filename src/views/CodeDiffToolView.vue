<script setup lang="ts" name="CodeDiffToolView">
import { reactive, ref } from 'vue';
import { CodeDiff } from 'v-code-diff'
import { formatStr } from '../utils/util.ts'
import { NButton, NModal, NInput, NSelect, NRadioGroup, NRadio, NSpace, NInputNumber, NForm, NFormItem } from 'naive-ui'
const showModal = ref(true)
const errMsg = ref()
const leftStr = ref()
const rightStr = ref()
const tempLeftStr = ref('')
const tempRightStr = ref('')
const codeDiffConfig = reactive({
    type: 'json',
    context: 5,
    outputFormat: 'side-by-side',
    outputFomatOptions: ['side-by-side', 'line-by-line'],
    diffStyle: 'word',
    diffStyleOptions: ['word', 'char'],
    typeOptions: [
        { label: 'plaintext', value: 'plaintext' },
        { label: 'xml', value: 'xml' },
        { label: 'html', value: 'html' },
        { label: 'javascript', value: 'javascript' },
        { label: 'json', value: 'json' },
        { label: 'yaml', value: 'yaml' },
        { label: 'python', value: 'python' },
        { label: 'java', value: 'java' },
        { label: 'bash', value: 'bash' },
        { label: 'sql', value: 'sql' },
    ]
})
const submitCallback = () => {
    if (tempLeftStr.value === '' || tempRightStr.value === '') {
        errMsg.value = '请输入要对比的内容';
        return;
    }
    if (['json', 'xml', 'html', 'sql'].includes(codeDiffConfig.type)) {
        try {
            leftStr.value = formatStr(tempLeftStr.value, codeDiffConfig.type);
            rightStr.value = formatStr(tempRightStr.value, codeDiffConfig.type);
            showModal.value = false;
        } catch (error) {
            errMsg.value = `${codeDiffConfig.type}格式化失败`;
            return;
        }
    } else {
        leftStr.value = tempLeftStr.value;
        rightStr.value = tempRightStr.value;
        showModal.value = false;
    }
}
const cancelCallback = () => {
    showModal.value = false;
}

</script>

<template>
    <div class="content">
        <n-button @click="showModal = true; errMsg = ''">
            点击传入要对比的内容
        </n-button>

        <n-modal v-model:show="showModal" preset="dialog" :mask-closable="false" title="请传入对应信息">
            <div><span>json/xml/html/sql会自动格式化，如果是其他语言请自行格式化，如果是上述4种语言但不想格式化，请选择plaintext</span></div>
            <div class="modal-content">
                <div class="textspace">
                    <n-input v-model:value="tempLeftStr" type="textarea" placeholder="请输入第一段内容" @blur="errMsg = ''" />
                </div>
                <div class="textspace">
                    <n-input v-model:value="tempRightStr" type="textarea" placeholder="请输入第二段内容" @blur="errMsg = ''" />
                </div>
            </div>
            <span style=" display: inline-block;color: red;height: 1em;">{{ errMsg }}</span>
            <n-select v-model:value="codeDiffConfig.type" :options="codeDiffConfig.typeOptions"></n-select>
            <template #action>
                <div>
                    <n-button @click="cancelCallback" type="default" style="margin-right: 1em;">取消</n-button>
                    <n-button @click="submitCallback" type="primary">确认</n-button>
                </div>

            </template>
        </n-modal>
        <div>
            <code-diff :old-string="leftStr" :new-string="rightStr" style="height:70vh;"
                :context="codeDiffConfig.context" :diff-style="codeDiffConfig.diffStyle"
                :output-format="codeDiffConfig.outputFormat" :language="codeDiffConfig.type" />
        </div>
        <div>
            <n-form ref="formRef" inline :model="codeDiffConfig" label-placement="left" label-width="auto">
                <n-form-item label="对比颗粒度" path="diffStyle">
                    <n-radio-group v-model:value="codeDiffConfig.diffStyle" name="diffStyleGroup">
                        <n-space>
                            <n-radio value="word">word</n-radio>
                            <n-radio value="char">char</n-radio>
                        </n-space>
                    </n-radio-group>
                </n-form-item>
                <n-form-item label="对比方式" path="outputFormat">
                    <n-radio-group v-model:value="codeDiffConfig.outputFormat" name="outputFormatGroup">
                        <n-space>
                            <n-radio v-for="(item, index) in codeDiffConfig.outputFomatOptions" :value="item"
                                :key="index">{{
                                    item
                                }}</n-radio>
                        </n-space>
                    </n-radio-group>
                </n-form-item>
                <n-form-item label="折叠代码：" path="context" title="每处不同上下文超过X行没有其他不同，则折叠后续代码直至下一处不同的前X行展开">
                    <n-input-number v-model:value="codeDiffConfig.context" placeholder="上下文行数" />
                </n-form-item>
            </n-form>
        </div>
    </div>
</template>

<style scoped>
.content {
    padding: 1vh 1rem;
}

.modal-content {
    display: flex;
    flex-direction: row;
    gap: 1em;
}

.textspace {
    flex: 1;
}

@media (max-width: 768px) {
    .modal-content {
        flex-direction: column;
    }
}
</style>