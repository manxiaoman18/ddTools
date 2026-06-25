<script setup lang="ts" name="WorkTimeCalcView">
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript'
import { useMessage, NConfigProvider, NScrollbar, NTabs, NTabPane, NFloatButton, NIcon, NCode } from 'naive-ui'
hljs.registerLanguage('javascript', javascript)
const qaCode = `
javascript: (function () {
    /**requireTime是日均工作时长要求，根据项目组要求修改即可*/
    const requireTime = 12;
    /**判断input输入是null(后面弹窗时点击取消) 或者空字符串，字符串并且不是纯数字构成，就返回true，否则返回false*/
    function checkInput(input) {
        if (input === null || typeof input === 'string' && isNaN(input) || input === '') {
            return true;
        }
        return false;
    }
    /**判断当前页面的域名是不是pa.pdd.net，如果不是，则弹窗提示用户，并在用户点确认时自动跳转到OA系统，如果已经在oa系统则会跳过这段逻辑 */
    if (window.location.host !== 'oa.pdd.net') {
        let gotoOA = confirm('请先打开OA系统,点击确定将自动跳转至OA系统，跳转后需重新执行脚本');
        if (!gotoOA) {
            return;
        } else {
            window.open('https://oa.pdd.net');
            return;
        }
    }

    /**构造事件对象并获取当前年份信息和月份信息 */
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    /**弹窗询问是否查看当前月份信息，确认=true，取消=false */
    let isNow = confirm('查看当前月?');
    /**点了取消，则取反=true，进入下方判断逻辑，需要用户分2步输入年和月，每步都用了前面checkInput函数判断输入内容 */
    if (!isNow) {
        /**弹窗让用户输入年份，点取消，则year会取null，点确定会调用checkInput函数进行相关校验 */
        year = prompt('请输入查询的年份:', year);
        while (checkInput(year)) {
            /**如果year===null，即点了取消，则结束运行，否则提示用户输入有误*/
            if (!year) {
                return;
            }
            year = prompt('输入的年份有误,请重新输入:', year);
        }
        /**同上 */
        month = prompt('请输入查询的月份:', month);
        while (checkInput(month)) {
            if (!month) {
                return;
            }
            month = prompt('输入的月份有误,请重新输入:', month);
        }
    }
    /**定义一个函数，参数是毫秒数,返回时分秒对象 */
    function convertMillisecondsToHoursMinutesSeconds(milliseconds) {
        let seconds = Math.floor(milliseconds / 1000);
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        seconds = seconds % 60;
        return { hours, minutes, seconds };
    }

    /**获取月份的总天数，daysOfMonth用来存调用接口时传的日期，outPutDayOfMonth用来判断是否是加班的日期*/
    function getDaysInMonth(year, month) {
        if (parseInt(month) < 10) {
            month = '0' + month;
        }
        const daysOfMonth = [];
        const outPutDayOfMonth = [];
        /**outPutDayOfMonth用来判断日期是否在加班list里 */
        outPutDayOfMonth.push(year + '-' + month + '-01');
        let lastDayOfMonth = new Date(year, month, 0).getDate();
        /**因为查工时用了接口返回的yesterday的数据，所以daysOfMonth开始日期从2号开始 */
        for (let i = 2; i <= lastDayOfMonth; i++) {
            if (i < 10) {
                daysOfMonth.push(year + '-' + month + '-0' + i);
                outPutDayOfMonth.push(year + '-' + month + '-0' + i);
            } else {
                daysOfMonth.push(year + '-' + month + '-' + i);
                outPutDayOfMonth.push(year + '-' + month + '-' + i);
            }
        }
        /**到这里生成了2个数组，daysOfMonth和outPutDayOfMonth，日期错开了1天，即：daysOfMonth3号时，outPutDayOfMonth是2号 */
        /**因为用接口yesterday的数据，所以要给当前整个月的日期后面加一天下个月1号，才可以统计到当前月最后一天的公式，这里判断如果当前月份不是12月，直接月份+1即可，否则年份加，月份重置为01，天都是01 */
        if (month !== '12') {
            daysOfMonth.push(year + '-' + (Number(month) + 1) + '-01');
        } else {
            daysOfMonth.push((Number(year) + 1) + '-01-01');
        }
        /**这里将daysOfMonth和outPutDayOfMonth转成一个二维数组，大数组的每一项是一个有2个元素的小数组，0是调接口传的日期，1是判断是否是加班的日期 */
        let dayJsonList = daysOfMonth.map((val, index) => [val, outPutDayOfMonth[index]]);
        /**如果是查看当前月数据，则从数组取前days项，避免计算未来日期造成不必要的调用 */
        if (Number(year) === date.getFullYear() && Number(month) === date.getMonth() + 1) {
            let days = new Date().getDate();
            dayJsonList = dayJsonList.slice(0, days);
        }
        return dayJsonList;
    }
    /**调用前面的函数，传入要查询考勤的年月，将二维数组结果赋值给dayJsonList */
    const dayJsonList = getDaysInMonth(year, month);
    /**加班日期list */
    let overTimeDateList = [];
    const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;
    let days = 0;
    let leaveDays = 0;
    let total = 0;
    let overTimeDays = 0;
    let count = 1;
    const promiseAll = [];

    fetch('https://oa-api.pdd.net/ei-ob/moon/asc-web/ei-asc/api/menu/root', {
        method: 'POST',
        body: '{"isNewVersion":true}',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json()).then(resJson => {
        let overTimeUUID = resJson.result[1].childVos[3].id;
        let body = \`{"page":1,"pageSize":30,"queryCondition":{"dateFrom":"\${year}-\${month}-01","dateTo":"\${year}-\${month}-\${new Date(year, month, 0).getDate()}"}}\`;
        fetch(\`https://oa-api.pdd.net/ei-ob/moon/asc-web/ei-asc/api/menu/list/application/\${overTimeUUID}\`, {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }).then(res => res.json()).then(resJson => {
            let infoList = resJson.result.list;
            if (infoList.length !== 0) {
                for (let overTimeInfo of infoList) {
                    let date = new Date(overTimeInfo.businessMap.attnDate);
                    /**将日期格式化为yyyy-MM-dd*/
                    let y = date.getFullYear();
                    let m = date.getMonth() + 1;
                    let d = date.getDate();
                    if (m < 10) {
                        m = '0' + m;
                    }
                    if (d < 10) {
                        d = '0' + d;
                    }
                    overTimeDateList.push(y+'-'+m+'-'+d);
                }
            }

        })
    }).then(() => {
        for (const dates of dayJsonList) {
            count++;
            const date = dates[0];
            const outPutDay = dates[1];
            
            /**在数组里调用接口，for循环传入要查询考勤的年月和日期 */
            promiseAll.push(new Promise((resolve, reject) => {
                /**创建一个Promise，异步获取一天的打卡信息，通过setTimeout，防止同一时间调用频率过高 */
                setTimeout(() => {
                    fetch('https://oa-api.pdd.net/ei-ob/moon/asc-web/ei-oa/api/attendance/calendar/oneDay', {
                        method: 'POST',
                        body: JSON.stringify({ date }),
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    }).then(res => {
                        /**将返回的数据转换为JSON格式，并使用json格式进行后续数据处理 */
                        res.json().then((resJson) => {
                            const dayInfo = resJson.result.yesterdayRecord;
                            if (dayInfo.checkOut && dayInfo.checkOut.checkOutTime && dayInfo.checkIn && dayInfo.checkIn.checkInTime) {
                                /**获取下班时间checkOutTime和上班时间checkInTime */
                                const checkOutTime = new Date(\`\${date} \${dayInfo.checkOut.checkOutTime}\`);
                                const checkInTime = new Date(\`\${date} \${dayInfo.checkIn.checkInTime}\`);
                                /**计算工作时长，使用getTime()转成毫秒，方便计算并且结果更精确 */
                                let duration = checkOutTime.getTime() - checkInTime.getTime();
                                /**如果工作时长小于0，则加一整天的毫秒数 */
                                if (duration < 0) {
                                    duration += MILLISECONDS_IN_A_DAY;
                                }
                                total += duration;
                                /**应上班总天数+1 */
                                days++;
                            } else if (dayInfo.approvalList && dayInfo.approvalList.length !== 0 && dayInfo.approvalList[0].type === 'LEAVE') {
                                /**请假，应上班总天数+1，请假天数也+1 */
                                days++;
                                leaveDays++;
                            }
                            resolve();
                        });
                    });
                }, 10 * count);
            }));
        }
        Promise.all(promiseAll).then(() => {
        /**overTimeDateList.length=月加班总天数,days是前面计算应上班总天数，之前未去掉加班，这里扣掉 */
        overTimeDays = overTimeDateList.length;
        days = days - overTimeDays;
            /**这个字段是计算的月份上班的总时间，转成时分秒 */
            const allMonthTime = convertMillisecondsToHoursMinutesSeconds(total);
            if (days > 0) {
                let avgTime = convertMillisecondsToHoursMinutesSeconds(total / days);
                /**总缺失工时计算，单位为毫秒 */
                let loseTimeDifference = (days * requireTime * MILLISECONDS_IN_A_DAY / 24 - total);
                /**Reminder后缀的都是最后alert弹窗文案相关字段 */
                let workingTimeReminder;
                /**如果工时差大于0，说明还有工时不足，则计算工时时分秒，并且文案使用欠缺工时x时x分 */
                if (loseTimeDifference >= 0) {
                    let loseTime = convertMillisecondsToHoursMinutesSeconds(loseTimeDifference);
                    workingTimeReminder = \`截止上一个工作日本月欠缺工时共计\${loseTime.hours}时\${loseTime.minutes}分\`;
                } else {
                    /**否则取绝对值并计算工时时分秒，并且文案使用超额完成x时x分 */
                    loseTimeDifference = Math.abs(loseTimeDifference);
                    let loseTime = convertMillisecondsToHoursMinutesSeconds(loseTimeDifference);
                    workingTimeReminder = \`截止上一个工作日本月工时已超额完成\${loseTime.hours}时\${loseTime.minutes}分\`;
                }
                /**alert文案第一行内容，计算的年月展示，下方都是alert里的内容了 */
                let dateReminder = \`\${year}年\${month}月\`;
                let workReminder = \`截止目前应上班\${days}天，实际上班\${(days - leaveDays + overTimeDays)}天，其中加班\${overTimeDays}天，请假\${leaveDays}天\`;
                let avgReminder = \`截止目前共计上班\${allMonthTime.hours}时\${allMonthTime.minutes}分，平均每日工作时长:\${avgTime.hours}时\${avgTime.minutes}分\${avgTime.seconds}秒\`;
                alert(dateReminder + '\\n' + workReminder + '\\n' + avgReminder + '\\n' + workingTimeReminder + '\\n' + '每日考勤可通过OA日历视图查看');
            } else {
                /**如果这个月截止到查询日前一天，一个工作日都还没有，则展示这个文案 */
                alert(\`\${year}年\${month}月\n别闹,你这个月还没上过班吧!?\`);
            }
        });
    })
})()
`
const rdCode = `
averageRdTime = 0;
promiseAll = []
tester = 'manxiaoman'
let body = { "filterRequest": { "sceneType": "SceneType_Workbench", "pageSize": 100, "pageIndex": 0, "filter": { "conditions": [{ "type": "MultipleBox", "multipleCondition": { "fieldName": "executors", "operator": "Contains", "value": [{ "type": "Text", "strValue": \`\${tester}\` }] }, "editable": true }, { "type": "MultipleBox", "multipleCondition": { "fieldName": "taskStatus", "operator": "Contains", "value": [{ "valueDetails": "Done", "strValue": "Done", "type": "Text_Special" }] }, "editable": true }, { "type": "Date", "dateCondition": { "operator": "Between", "fieldName": "doneTime", "specialValue": "LastMonth" } }, { "type": "MultipleBox", "multipleCondition": { "fieldName": "templateId", "operator": "Contains", "value": [{ "valueDetails": "测试任务", "strValue": "测试任务", "type": "Text_Group" }] } }] }, "sceneTypeV2": "SceneType_Workbench" } }
fetch('https://brook.pdd.net/api/pyke/filter/listWorkbenchTasksByFilter', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include'
}).then(res => res.json()).then(resJson =>
    resJson.listByFilterItems.map(item => item.taskInfo.shortId)
).then(item => {
    console.log(item.length);
    for (let i in item) {
        promiseAll.push(
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    fetch(\`https://brook.pdd.net/api/v1/requirement/extension/id/\${item[i]}\`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    }).then(res => res.json()).then(resJson => {
                        rd_time = 0;
                        tester_num = 0;
                        for (const task_info of resJson.result.task_list) {
                            if (task_info.is_development_task) {
                                if (task_info.effort_estimation !== null) {
                                    rd_time += task_info.effort_estimation;
                                } else {
                                    console.log(\`https://brook.pdd.net/requirement/\${item[i]}\`, '有开发任务没有填充工时');
                                }
                            } else if (task_info.is_test_task) {
                                tester_num++;
                            }
                        }
                        ave_rd_time = rd_time / tester_num;
                        resolve(ave_rd_time);
                    })
                }, i * 10)
            })
        )
    }
    Promise.all(promiseAll).then((value) => console.log('all-------------------------', value.reduce((v1, v2) => v1 + v2)))
})
`
let code = qaCode

const message = useMessage()
const copyText = () => {
    navigator.clipboard.writeText(code.replace('\$', '$').replace('\\`', '\`')).then(() => {
        message.success('复制成功');
    })
}
const handleUpdateValue = (value: string) => {
    if (value === '开发工时脚本') {
        code = rdCode
    } else {
        code = qaCode
    }
}
</script>

<template>
    <n-config-provider :hljs="hljs">
        <div class="codeDiv">
            <n-scrollbar x-scrollable>
                <n-tabs type="line" animated justify-content="center" @update:value="handleUpdateValue" size="large">
                    <n-tab-pane name="日均工时脚本" style="max-width: 800px; margin: 0 auto;" title="用来计算个人月度工时和欠缺工时"><n-code
                            :code="qaCode" language="javascript" word-wrap /></n-tab-pane>
                    <n-tab-pane name="开发工时脚本" style="max-width: 800px; margin: 0 auto;"
                        title="测试同学用来计算上个月所测的需求对应开发总工时，使用前需要把代码第3行tester的值改为自己的花名拼音"><n-code :code="rdCode"
                            language="javascript" word-wrap /></n-tab-pane>
                </n-tabs>
            </n-scrollbar>
        </div>
    </n-config-provider>
    <div>
        <n-float-button :right="24" :bottom="24" width="56" height="56" shape="circle" type="primary"
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
.codeDiv {
    height: 100%;
    width: 100%;
    padding: 0 1rem;
}

@media (max-width: 768px) {
    .codeDiv {
        padding: 0 0.5rem;
    }
}
</style>