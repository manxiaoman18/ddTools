<template>
  <div class="json-template-tool">
    <div class="layout-container">
      <!-- 左侧：模板编辑区 -->
      <n-card title="JSON模板编辑" class="layout-item template-item">
        <div class="vertical-form-wrapper">
          <div class="label-wrapper">
            <span class="form-label">模板内容</span>
          </div>

          <n-input v-model:value="jsonTemplate" type="textarea" :placeholder="placeholderText" :rows="12" autosize
            class="template-textarea" />

          <n-space justify="end" style="margin-top: 12px;">
            <n-button type="primary" @click="parseTemplate" size="medium">解析模板变量</n-button>
            <n-button @click="resetTemplate" size="medium">重置</n-button>
            <n-button @click="generateTemplate" size="medium">点击生成示例</n-button>
          </n-space>
        </div>
        <div style="margin-top:15px">
          <n-table :bordered="true" :single-line="true">
            <thead>
              <tr>
                <th>内置函数</th>
                <th>用法</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${_md5(param,n,m)}</td>
                <td>param是要求md5的入参，n是截取位置，m是截取的总长度。只填n，则是0-n。都不填则返回整个md5结果。</td>
              </tr>
              <tr>
                <td>${_timestampFormat(ts,fmt)}</td>
                <td>参数1填时间戳(默认当前)，参数2填格式(如yyyy-MM-dd HH:mm:ss)。</td>
              </tr>
              <tr>
                <td>${_timeOffset(base,offset,unit,fmt)}</td>
                <td>计算偏移时间。base基准时间戳(默认当前)，offset偏移量，unit单位(ms/s/m/h/d，默认s)，fmt输出格式(默认时间戳)。</td>
              </tr>
            </tbody>
          </n-table>
        </div>
      </n-card>


      <!-- 中间：变量配置区 -->
      <n-card title="变量配置" class="layout-item variable-item" :bordered="variables.length > 0">
        <div v-if="variables.length" class="variable-kv-container">
          <div class="kv-item" v-for="(variable, index) in variables" :key="index">
            <div class="kv-key">
              <n-tag type="info" size="medium">{{ variable }}</n-tag>
            </div>
            <div class="kv-value">
              <n-input v-model:value="formData[variable]" :placeholder="`请输入${variable}的值`" size="medium"
                class="value-input" />
            </div>
          </div>
        </div>
        <div v-else class="empty-tip">
          <n-empty description="暂无模板变量，请先解析模板" />
        </div>
      </n-card>

      <!-- 右侧：结果生成区 -->
      <n-card title="生成结果" class="layout-item result-item">
        <n-form-item label="最终JSON" label-align="left" label-width="80px">
          <n-space justify="start" style="margin-bottom: 12px;">
            <n-button type="success" @click="generateResult" size="medium">生成最终JSON</n-button>
            <n-button @click="copyResult" v-if="finalResult" size="medium">复制结果</n-button>
          </n-space>
          <n-input v-model:value="finalResult" type="textarea" :rows="12" readonly placeholder="生成的JSON结果将显示在这里..."
            class="result-textarea" />
        </n-form-item>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { NCard, NFormItem, NInput, NButton, NSpace, NTag, NEmpty, useMessage, NTable } from 'naive-ui'
import CryptoJS from 'crypto-js'

// 消息提示
const message = useMessage()

// Placeholder文本
const placeholderText = ref('请填入json模板')

// 初始化模板
const jsonTemplate = ref('')
// 解析出的变量列表
const variables = ref<string[]>([])
// 变量表单数据
const formData = reactive<Record<string, string>>({})
// 最终生成的JSON结果
const finalResult = ref('')

/**
 * 递归提取所有变量（修复：解决嵌套变量无法提取的问题）
 * 原理：不断匹配最内层的 ${...}，如果是变量则收集，如果是函数则解析参数继续递归
 */
const extractVariablesRecursive = (template: string): string[] => {
  const foundVars = new Set<string>()
  
  // 匹配最内层的 ${...}
  const innerRegex = /\$\{([^{}]*)\}/g
  
  let match: RegExpExecArray | null
  // 由于我们要递归处理，这里用 while 循环每一层
  // 为了避免死循环，我们需要对字符串进行替换处理，直到没有 ${...} 为止
  
  let currentTemplate = template
  let hasMatch = true

  while (hasMatch) {
    hasMatch = false
    innerRegex.lastIndex = 0
    
    while ((match = innerRegex.exec(currentTemplate)) !== null) {
      const fullMatch = match[0]
      const content = match[1]
      
      hasMatch = true

      // 判断是函数还是变量
      if (content.startsWith('_') && content.includes('(') && content.endsWith(')')) {
        // 是函数，提取参数部分进行递归
        const funcNameEnd = content.indexOf('(')
        // 将函数调用替换为参数内容，以便下一轮循环提取参数里的变量
        // 例如 ${_md5(${bb}, 0)} -> 替换为 ${bb}, 0
        // 注意：这里只是为了让正则能继续扫描内部，实际不修改原模板，只用于提取
        const argsStr = content.substring(funcNameEnd + 1, content.length - 1)
        
        // 我们将当前匹配到的函数调用替换为一个占位符或直接展开参数
        // 这里为了简单，我们将函数调用替换为它的参数字符串
        // 但是参数字符串里可能有逗号，所以要小心处理。
        // 更好的方法：直接把函数调用从 currentTemplate 中移除，只保留参数部分？
        // 不行，参数部分可能是变量。
        // 策略：将 ${_md5(${bb}, 0)} 替换为 ${bb}, 0 (去掉外壳，保留内部变量)
        // 这样下一轮正则就能匹配到 ${bb}
        
        // 为了避免替换破坏字符串结构，我们实际上可以只针对参数部分递归调用 extractVariablesRecursive
        // 但这里我们在一个循环里处理，所以我们需要修改 currentTemplate
        
        // 将函数调用替换为它的参数内容（去掉外壳，露出里面的变量）
        currentTemplate = currentTemplate.replace(fullMatch, argsStr)
        
        // 因为修改了字符串，必须重置正则索引，从头开始扫描
        innerRegex.lastIndex = 0
        // break 重新进入外层 while，重新扫描新的 currentTemplate
        break 
      } else {
        // 是普通变量
        foundVars.add(content)
        // 将已识别的变量替换为空字符串或占位符，防止重复匹配，并露出外层结构
        currentTemplate = currentTemplate.replace(fullMatch, '')
        innerRegex.lastIndex = 0
        break
      }
    }
  }

  return Array.from(foundVars)
}

/**
 * 解析JSON模板，提取所有变量
 */
const parseTemplate = () => {
  try {
    variables.value = []
    Object.keys(formData).forEach(key => delete formData[key])

    // 使用递归提取方法
    const extractedVars = extractVariablesRecursive(jsonTemplate.value)
    
    // 过滤掉以 _ 开头的函数名（虽然逻辑上不应该提取到，但做个保险）
    extractedVars.forEach(v => {
      if (!v.startsWith('_') && !variables.value.includes(v)) {
        variables.value.push(v)
        formData[v] = ''
      }
    })

    if (variables.value.length === 0) {
      message.warning('未解析到任何可编辑的变量！')
    } else {
      message.success(`成功解析到 ${variables.value.length} 个变量：${variables.value.join(', ')}`)
    }
  } catch (error) {
    console.error('解析模板失败：', error)
    message.error(`解析失败：${(error as Error).message}`)
  }
}

const executeFunction = (funcName: string, args: string[]): string => {
  switch (funcName) {
    case '_md5': {
      const content = args[0] || ''
      const md5Result = CryptoJS.MD5(content).toString()
      // 处理截取逻辑
      if (args[1]) {
        if (!args[2]){
        const length = parseInt(args[1])
        if (!isNaN(length) && length > 0 && length <= 32) {
          return md5Result.substring(0, length)
        }
        }
      }
      if (args[1] && args[2]) {
        const len1 = parseInt(args[1])
        const len2 = parseInt(args[2])
        if (!isNaN(len1) && len1 >= 0 && !isNaN(len2) && len1 <= len2 && len2 <= 32) {
          return md5Result.substring(len1, len1+len2)
        }
      }
      return md5Result
    }
    case '_timestampFormat': {
      const timestamp = args[0] ? parseInt(args[0]) : Date.now()
      const format = args[1] || 'yyyy-MM-dd HH:mm:ss'
      
      if (isNaN(timestamp)) {
        return '[无效的时间戳]'
      }

      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      // 预定义格式处理
      const formatMap: {[key: string]: string} = {
        'yyyy-MM-dd HH:mm:ss': `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
        'yyyy/MM/dd': `${year}/${month}/${day}`,
        'yyyyMMdd': `${year}${month}${day}`,
        'yyyy-MM-dd': `${year}-${month}-${day}`,
        'HH:mm:ss': `${hours}:${minutes}:${seconds}`,
        'yyyy年MM月dd日 HH:mm:ss': `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`,
        'yyyy年MM月dd日': `${year}年${month}月${day}日`,
        'MM/dd/yyyy': `${month}/${day}/${year}`,
        'dd-MM-yyyy': `${day}-${month}-${year}`
      }
      
      if (formatMap.hasOwnProperty(format)) {
        return formatMap[format]
      }
      
      // 自定义格式化
      return format
        .replace('yyyy', String(year))
        .replace('MM', month)
        .replace('dd', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
    }
    case '_timeOffset': {
      const baseTime = args[0] ? parseInt(args[0]) : Date.now()
      const offset = args[1] ? parseInt(args[1]) : 0
      const unit = args[2] || 's'
      const outputFormat = args[3] || 'timestamp'

      if (isNaN(baseTime) || isNaN(offset)) {
        return '[无效的参数]'
      }

      let offsetTime = offset 
      switch (unit) {
        case 'ms': offsetTime = offset; break
        case 's': offsetTime = offset * 1000; break
        case 'm': offsetTime = offset * 60 * 1000; break
        case 'h': offsetTime = offset * 60 * 60 * 1000; break
        case 'd': offsetTime = offset * 24 * 60 * 60 * 1000; break
        default: return '[不支持的单位]'
      }

      const targetTime = baseTime + offsetTime

      if (outputFormat === 'timestamp') {
        return String(targetTime)
      }
      
      // 如果需要格式化，直接处理
      const date = new Date(targetTime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      if (outputFormat === 'yyyy-MM-dd HH:mm:ss') {
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } else if (outputFormat === 'yyyy/MM/dd') {
          return `${year}/${month}/${day}`
      } else if (outputFormat === 'yyyyMMdd') {
          return `${year}${month}${day}`
      }

      return outputFormat
          .replace('yyyy', String(year))
          .replace('MM', month)
          .replace('dd', day)
          .replace('HH', hours)
          .replace('mm', minutes)
          .replace('ss', seconds)
    }
    default:
      return `[函数${funcName}未实现]`
  }
}

/**
 * 递归替换模板中的变量和函数
 */
const recursiveReplace = (template: string): string => {
  const innerRegex = /\$\{([^{}]*)\}/g
  
  let match: RegExpExecArray | null
  let hasChange = false
  
  innerRegex.lastIndex = 0
  
  while ((match = innerRegex.exec(template)) !== null) {
    const fullMatch = match[0]
    const content = match[1]
    
    let replacement = fullMatch

    if (content.startsWith('_') && content.includes('(') && content.endsWith(')')) {
      const funcNameEnd = content.indexOf('(')
      const funcName = content.substring(0, funcNameEnd)
      const argsStr = content.substring(funcNameEnd + 1, content.length - 1)
      const args = argsStr ? argsStr.split(',').map(s => s.trim()) : []
      replacement = executeFunction(funcName, args)
    } else {
      if (formData.hasOwnProperty(content)) {
        replacement = formData[content]
      }
    }

    if (replacement !== fullMatch) {
      template = template.replace(fullMatch, replacement)
      hasChange = true
      innerRegex.lastIndex = 0
    }
  }

  if (hasChange) {
    return recursiveReplace(template)
  }

  return template
}

/**
 * 生成最终JSON结果
 */
const generateResult = () => {
  try {
    if (!jsonTemplate.value) {
      message.warning('请输入JSON模板！')
      return
    }

    const replacedStr = recursiveReplace(jsonTemplate.value)
    const parsedJson = JSON.parse(replacedStr)
    finalResult.value = JSON.stringify(parsedJson, null, 2)

    message.success('JSON生成成功！')
  } catch (error) {
    console.error('生成JSON失败：', error)
    message.error(`生成失败：${(error as Error).message}`)
  }
}

/**
 * 重置模板
 */
const resetTemplate = () => {
  jsonTemplate.value = ''
  variables.value = []
  Object.keys(formData).forEach(key => delete formData[key])
  finalResult.value = ''
  message.info('模板已重置')
}

/**
 * 填充模板示例
 */
const generateTemplate = () => {
  jsonTemplate.value = '{"paramA":"${a}","paramB":"${b}","md5Demo":"${_md5(${bb}, 0, 8)}","time":"${_timestampFormat(${_timeOffset()},yyyy-MM-dd)}"}'
  variables.value = []
  Object.keys(formData).forEach(key => delete formData[key])
  finalResult.value = ''
  message.info('已生成模板示例')
}

/**
 * 复制结果到剪贴板
 */
const copyResult = () => {
  navigator.clipboard.writeText(finalResult.value)
    .then(() => message.success('结果已复制到剪贴板'))
    .catch(() => message.error('复制失败，请手动复制'))
}
</script>

<style scoped>
/* 全局容器 */
.json-template-tool {
  width: 98vw;
  height: 88vh;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f5f7fa;
  overflow: hidden;
}

/* 左中右布局容器：横向三等分 */
.layout-container {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 20px;
}

/* 每个布局项：平均分配宽度 */
.layout-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 模板区样式 */
.template-item {
  max-width: calc(100% / 3 - 15px);
}

.template-textarea {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
}

/* 变量区样式 */
.variable-item {
  max-width: calc(100% / 3 - 15px);
  overflow-y: auto;
}

/* K-V键值对容器 */
.variable-kv-container {
  display: flex;
  flex-direction: column;
  gap: 则16px;
  padding: 8px 0;
  height: 100%;
  overflow-y: auto;
}

/* K-V项样式 */
.kv-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.kv-key {
  min-width: 80px;
  display: flex;
  align-items: center;
}

.kv-value {
  flex: 1;
}

.value-input {
  width: 100%;
}

.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

/* 结果区样式 */
.result-item {
  max-width: calc(100% / 3 - 15px);
}

.result-textarea {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  background-color: #f9fafb;
}

/* Naive UI样式覆盖 */
:deep(.n-card__header) {
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.n-card__body) {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

:deep(.n-button) {
  border-radius: 6px;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .layout-container {
    flex-direction: column;
  }

  .layout-item {
    max-width: 100%;
    max-height: calc(100% / 3 - 15px);
  }
}
</style>