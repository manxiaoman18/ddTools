<script setup lang="ts" name="DynamicForm">
import { ref, reactive } from 'vue';
import type { CSSProperties } from 'vue'
import { JsonListItem } from '../entitys/JsonListItem'
import { useMessage, NTooltip, NInput, NSwitch, NRadio, NRadioGroup, NDynamicInput, NSpace, NCheckbox, NCheckboxGroup, NDatePicker } from 'naive-ui';

const message = useMessage();

const jsonList: JsonListItem[] = reactive([]);
const changeType = ref(0);

const setFormData = (newData: any, type: number) => {
    changeType.value = type;
    jsonList.length = 0;
    newData.forEach((item: JsonListItem) => {
        if (item.options) {
            Object.entries(item.options).forEach(([key, value]) => {
                if (!item.optionValueType) {
                    if ((typeof value) === 'number') {
                        item.optionValueType = true;
                    } else {
                        item.optionValueType = false;
                    }
                }
                if (!item.optionList) {
                    item.optionList = [];
                }
                item.optionList.push({ key, value: String(value) });
            });
        }
        jsonList.push(item);
    });
};
const renderJson = (type: number, keyList: string[]) => {
    if (type === 0) {
        jsonList.length = 0;
        return;
    }
    changeType.value = type;
    jsonList.length = 0;
    for (const key of keyList) {
        const dbReqTemplate: JsonListItem = { key: 'id', alias: 'alias', width: '300px', default: '' };
        const dbResTemplate: JsonListItem = { key: 'id', alias: 'name', desc: '', primary: false };
        const dgTemplate: JsonListItem = { key: 'id', label: 'label', placeholder: '请输入', type: 'input', options: null, expand: false, required: true, description: '', requiredMessage: '', default: null };
        if (type === 1) {
            dbReqTemplate.key = key;
            dbReqTemplate.alias = key;

            jsonList.push(dbReqTemplate);
        } else if (type === 2) {
            dbResTemplate.key = key;
            dbResTemplate.alias = key;
            dbResTemplate.desc = key;
            if (dbResTemplate.key === 'id') {
                dbResTemplate.primary = true;
            }
            jsonList.push(dbResTemplate);
        } else if (type === 3) {
            dgTemplate.key = key;
            dgTemplate.label = key;
            dgTemplate.placeholder += `${dgTemplate.label}`;
            jsonList.push(dgTemplate);
        }
    }
}

const funcChangeType = (jsonObj: JsonListItem) => {
    delete jsonObj.format;
    delete jsonObj.showTime;
    delete jsonObj.options;
    if (['checkbox', 'select'].includes(jsonObj.type ? jsonObj.type : '')) {
        jsonObj.optionList = [{ key: '', value: '' }];
        jsonObj.options = {};
    } else if (jsonObj.type === 'date') {
        jsonObj.options = null;
        jsonObj.format = 'yyyy-MM-dd HH:mm:ss';
        jsonObj.showTime = true;
    }
}

defineExpose({ renderJson, jsonList, setFormData });
defineProps({ jsonList: [] });
const updateOption = (jsonObj: JsonListItem) => {
    jsonObj.default = null;
    if (['checkbox', 'select'].includes(jsonObj.type ? jsonObj.type : '')) {
        jsonObj.options = {};
        jsonObj.optionList?.forEach(item => {
            const newVal = parseFloat(item.value);
            if (jsonObj.optionValueType) {
                if (!jsonObj.options || !jsonObj) return;
                if (!isNaN(newVal)) {
                    jsonObj.options[item.key] = newVal;
                } else {
                    jsonObj.options[item.key] = item.value;
                }
            } else {
                jsonObj.options[item.key] = item.value;
            }
        })
    }
}

const railStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
    const style: CSSProperties = {}
    if (checked) {
        style.background = '#d03050'
        if (focused) {
            style.boxShadow = '0 0 0 2px #d0305040'
        }
    } else {
        style.background = '#2080f0'
        if (focused) {
            style.boxShadow = '0 0 0 2px #2080f040'
        }
    }
    return style
}
</script>

<template>
    <div v-for="(jsonObj, index) in jsonList" :key="index">
        <template v-if="changeType === 1">
            <div class="form" :id="jsonObj.key">
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">key:</label>
                        </template>
                        当前编辑的字段名，应该等于对应数据表中的字段名，dbutil根据该字段值从表里取数，不可修改
                    </n-tooltip>
                    <n-input class="right-ele" v-model:value="jsonObj.key" disabled></n-input>
                </div>

                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">alias:</label>
                        </template>
                        当前字段名在dbutil页面查询框前显示的别名，例如key=mall_name，这里写店铺名，则最终dbutil的查询项的字段名会显示“店铺名”
                    </n-tooltip>
                    <n-input class="right-ele" v-model:value="jsonObj.alias"></n-input>
                </div>
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">width:</label>
                        </template>
                        当前字段在dbutil页面显示的输入框宽度，一般300px就够啦
                    </n-tooltip>
                    <n-input class="right-ele" v-model:value="jsonObj.width"></n-input>
                </div>
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">default:</label>
                        </template>
                        当前字段在dbutil页面输入框内显示的默认值，如果该字段查询时经常使用某个值的话可以设置一下，省得每次都手动输入
                    </n-tooltip>
                    <n-input class="right-ele" v-model:value="jsonObj.default"></n-input>
                </div>
                <hr />
            </div>
        </template>
        <template v-else-if="changeType === 2">
            <div class="form">
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">key:</label>
                        </template>
                        当前编辑的字段名，应该等于对应数据表中的字段名，不可修改
                    </n-tooltip>
                    <n-input class="right-ele" style="width: auto;" v-model:value="jsonObj.key" disabled></n-input>
                </div>
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">alias:</label>
                        </template>
                        当前字段名在dbutil页查询结果的表头处显示的别名，例如key=mall_name，这里写店铺名，则最终dbutil的查询结果的表头显示效果为“店铺名(mall_name)”
                    </n-tooltip>
                    <n-input class="right-ele" style="width: auto;" v-model:value="jsonObj.alias"></n-input>
                </div>
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">desc:</label>
                        </template>
                        当前字段名在dbutil页查询结果的表头处hover时显示的提示文字，可以对该字段进行解释说明
                    </n-tooltip>
                    <n-input class="right-ele" v-model:value="jsonObj.desc"></n-input>
                </div>
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">primary:</label>
                        </template>
                        当前字段是否是主键，通过dbtuil编辑表数据保存的时候实际是根据主键进行update的，一般默认id字段是主键
                    </n-tooltip>
                    <n-switch v-model:value="jsonObj.primary" :rail-style="railStyle">
                        <template #checked>
                            用作主键
                        </template>
                        <template #unchecked>
                            不作主键
                        </template>
                    </n-switch>
                </div>
            </div>
        </template>
        <template v-else-if="changeType === 3">
            <div class="form">
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">key:</label>
                        </template>
                        入参字段名，传给testgo时这个字段值就是参数的key值
                    </n-tooltip>
                    <n-input v-model:value="jsonObj.key" disabled></n-input>
                </div>
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">label:</label>
                        </template>
                        入参字段名的别名，方便在dg上知道正在编辑的是什么参数
                    </n-tooltip>
                    <n-input v-model:value="jsonObj.label"></n-input>
                </div>
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">placeholder:</label>
                        </template>
                        入参字段在dg上的输入框为空时，在dg上显示的提示文字，一般写上该字段的含义，方便用户理解
                    </n-tooltip>
                    <n-input v-model:value="jsonObj.placeholder"></n-input>
                </div>
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">type:</label>
                        </template>
                        入参字段在dg上的输入框类型，有input、select、switch、checkbox、date五种，一般根据字段传参类型按需选择
                    </n-tooltip>
                    <n-radio-group class="right-ele" v-model:value="jsonObj.type" @change="funcChangeType(jsonObj)"
                        name="radiogroup">
                        <n-space>
                            <n-radio value="input">input</n-radio>
                            <n-radio value="select">select</n-radio>
                            <n-radio value="switch">switch</n-radio>
                            <n-radio value="checkbox">checkbox</n-radio>
                            <n-radio value="date">date</n-radio>
                        </n-space>
                    </n-radio-group>
                </div>
                <div class="form-item" v-if="jsonObj.type === 'date'">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">format:</label>
                        </template>
                        type字段为date时才显示该字段，控制当前字段传的时间参数的格式化规则，默认yyyy-MM-dd HH:mm:ss，格式化的字母大小写敏感
                    </n-tooltip>
                    <n-input v-model:value="jsonObj.format"></n-input>
                </div>
                <div class="form-item" v-if="jsonObj.type === 'date'">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">showTime:</label>
                        </template>
                        type字段为date时才展示该字段，控制dg页面是否显示时分秒选择入口，true时为精确到时分秒，false时为精确到年月日
                    </n-tooltip>
                    <n-switch v-model:value="jsonObj.showTime" :rail-style="railStyle">
                        <template #checked>
                            精确到时分秒
                        </template>
                        <template #unchecked>
                            精确到年月日
                        </template>
                    </n-switch>
                </div>
                <div class="form-item">
                    <div v-if="['select', 'checkbox'].includes(jsonObj.type!)">
                        <n-dynamic-input v-model:value="jsonObj.optionList" preset="pair" key-placeholder="key" :min="1"
                            value-placeholder="value" @update:value="updateOption(jsonObj)" />

                    </div>
                    <n-switch v-if="['checkbox', 'select'].includes(jsonObj.type ? jsonObj.type : '')"
                        v-model:value="jsonObj.optionValueType" :rail-style="railStyle"
                        @update:value="updateOption(jsonObj)">
                        <template #checked>
                            number
                        </template>
                        <template #unchecked>
                            string
                        </template>
                    </n-switch>
                </div>
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">expand:</label>
                        </template>
                        控制当前字段在dg页面默认折叠(true)还是露出(false),当前字段该值为true时请确保default字段不要为空
                    </n-tooltip>
                    <n-switch v-model:value="jsonObj.expand" :rail-style="railStyle" @update:value="() => {
                        if (jsonObj.expand) {
                            message.info('当前字段为折叠状态，请确保default字段不为空');
                        }
                    }">
                        <template #checked>
                            默认折叠
                        </template>
                        <template #unchecked>
                            默认露出
                        </template>
                    </n-switch>
                </div>
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">required:</label>
                        </template>
                        当前字段在dg页面是否必填
                    </n-tooltip>
                    <n-switch v-model:value="jsonObj.required" :rail-style="railStyle">
                        <template #checked>
                            字段必填
                        </template>
                        <template #unchecked>
                            字段选填
                        </template>
                    </n-switch>
                </div>
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">description:</label>
                        </template>
                        显示在字段下方，可以用来描述字段意思和作用
                    </n-tooltip>
                    <n-input v-model:value="jsonObj.description"></n-input>
                </div>
                <div class="form-item">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">requiredMessage:</label>
                        </template>
                        必填字段为空时的提示
                    </n-tooltip>
                    <n-input v-model:value="jsonObj.requiredMessage"></n-input>
                </div>
                <div class="form-item" title="默认值，type不同，默认值类型也不同，具体清参考dg文档">
                    <n-tooltip trigger="hover" :show-arrow="false">
                        <template #trigger>
                            <label class="left-ele">default:</label>
                        </template>
                        字段在dg上显示的默认值，不修改的话会默认传该字段值，type不同，默认值类型也不同，具体清参照dg文档
                    </n-tooltip>
                    <template v-if="jsonObj.type === 'input'">
                        <n-input v-model:value="jsonObj.default" class="right-ele"></n-input>
                    </template>
                    <template v-else-if="jsonObj.type === 'switch'">
                        <n-switch v-model:value="jsonObj.default"></n-switch>
                    </template>
                    <template v-else-if="jsonObj.type === 'select'">
                        <n-radio-group class="right-ele" v-model:value="jsonObj.default" name="defaultgroup">
                            <n-space v-for="item in jsonObj.optionList">
                                <n-radio :value="!jsonObj.optionValueType ? item.value : parseFloat(item.value)">{{
                                    item.key
                                    }}</n-radio>
                            </n-space>
                        </n-radio-group>
                    </template>
                    <template v-else-if="jsonObj.type === 'checkbox'" class="right-ele">
                        <n-checkbox-group v-model:value="jsonObj.default">
                            <n-space v-for="item in jsonObj.optionList">
                                <n-checkbox :value="!jsonObj.optionValueType ? item.value : parseFloat(item.value)"
                                    :label="item.key" />
                            </n-space>
                        </n-checkbox-group>
                    </template>
                    <template v-else-if="jsonObj.type === 'date'">
                        <n-date-picker class="right-ele" v-model:formatted-value="jsonObj.default"
                            :value-format="jsonObj.format"
                            :type="jsonObj.format?.includes('HH:mm:ss') ? 'datetime' : 'date'" clearable />
                    </template>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.form {
    margin-top: 1em;
    display: flex;
    border-bottom: 1px solid #ccc;
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