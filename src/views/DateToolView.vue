<script setup lang="ts" name="DateToolView">
import { ref } from 'vue';
import dayjs from 'dayjs';
import { NDatePicker, NInputNumber } from 'naive-ui'
const date = ref(dayjs().valueOf());
const startTime = ref(dayjs().valueOf());
const endTime = ref(dayjs().valueOf());
// const message = useMessage();
const timestamp = ref(dayjs().valueOf())
const timestampUnix = ref(dayjs().valueOf() / 1000)

const dateDiff = (startTime: Number | string, endTime: Number | string) => {
    const diff = Number(endTime) - Number(startTime);
    if (diff < 0) {
        return '时间差为负数，请检查时间'
    }
    //通过diff计算时间差
    const day = Math.floor(diff / (24 * 3600 * 1000));
    const leave1 = diff % (24 * 3600 * 1000);    //计算天数后剩余的毫秒数
    const hours = Math.floor(leave1 / (3600 * 1000));
    const leave2 = leave1 % (3600 * 1000);        //计算小时数后剩余的毫秒数
    const minutes = Math.floor(leave2 / (60 * 1000));
    const leave3 = leave2 % (60 * 1000);
    const seconds = Math.round(leave3 / 1000);
    const leave4 = diff % 1000;
    console.log(diff, day, hours, minutes, seconds, leave4);
    return `${day}天${hours}时${minutes}分${seconds}秒${leave4}毫秒`
}

</script>

<template>
    <div class="container">
        <h3>时间转时间戳</h3>
        <div class="row">
            <label>时间<n-date-picker v-model:value="date" type="datetime" placeholder="选择日期/时间" clearable /></label>
            <label>时间戳(毫秒)
                <div>{{ date }}</div>
            </label>
            <label>时间戳(秒)
                <div>{{ Math.floor(date / 1000) }}</div>
            </label>
        </div>
        <h3>时间戳(毫秒)转时间</h3>
        <div class="row">
            <label>时间戳(毫秒)<n-input-number v-model:value="timestamp" clearable></n-input-number></label>
            <label>
                时间
                <div>{{ dayjs(Number(timestamp)).format('YYYY-MM-DD HH:mm:ss.SSS') }}</div>
                <div>{{ dayjs(Number(timestamp)).format('YYYY/MM/DD HH:mm:ss.SSS') }}</div>
            </label>
        </div>
        <h3>时间戳(秒)转时间</h3>
        <div class="row">
            <label>时间戳(秒)<n-input-number v-model:value="timestampUnix" clearable></n-input-number></label>
            <label>
                时间
                <div>{{ dayjs.unix(Number(timestampUnix)).format('YYYY-MM-DD HH:mm:ss.SSS') }}</div>
                <div>{{ dayjs.unix(Number(timestampUnix)).format('YYYY/MM/DD HH:mm:ss.SSS') }}</div>
            </label>
        </div>
        <h3>时间差计算</h3>
        <div class="row">
            <label>时间1<n-date-picker v-model:value="startTime" type="datetime" placeholder="选择日期/时间"
                    clearable /></label>
            <label>时间2<n-date-picker v-model:value="endTime" type="datetime" placeholder="选择日期/时间" clearable /></label>
            <label>相差时间
                <div>{{ dateDiff(startTime, endTime) }}</div>
            </label>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
}

.row {
    width: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding-bottom: 1em;
    border-bottom: 1px solid var(--border-color);
}

label {
    margin: 0 1em;
}

@media (max-width: 768px) {
    .row {
        flex-direction: column;
        gap: 0.5em;
    }

    label {
        margin: 0;
        width: 100%;
    }
}
</style>