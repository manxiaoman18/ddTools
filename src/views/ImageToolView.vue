<script setup lang="ts" name="ImageToolView">
import { reactive, ref, watch } from 'vue';
import { useMessage, NInputGroup, NInputGroupLabel, NColorPicker, NInput, NInputNumber, NSelect, NCheckbox, NButton } from 'naive-ui';
import { localCache } from '../utils/strange';

let url = ref<string>();

const remember = ref(false);
const canvasInfo = reactive({
  width: 500,
  height: 500,
  targetSize: 0,
  unit: 'kb',
  fontSize: 50,
  innerColor: '#000000FF',
  innerText: '',
  unitOptions: [
    {
      label: 'kb',
      value: 'kb'
    },
    {
      label: 'mb',
      value: 'mb'
    },
    {
      label: 'gb',
      value: 'gb'
    }
  ]
});
if (localCache.getCache('canvasInfo')) {
  remember.value = true;
  Object.assign(canvasInfo, localCache.getCache('canvasInfo'));
}
const canvasRef = ref<HTMLCanvasElement | null>();
const message = useMessage();
const drawText = (ctx: any, words: string[], textFontSize: number) => {
  if (words.length === 0) {
    words = ['暂无文字'];
  }

  const { width, height } = canvasInfo; // 保持使用外部变量 canvasInfo
  
  ctx.font = `${textFontSize}px Arial`;

  // 极端情况校验
  if (textFontSize >= width) {
    message.error('图片宽度过窄，无法写入文字');
    return;
  }

  const content = words.join('');
  const padding = textFontSize / 2; // 左右边距
  const maxWidth = width - padding; // 最大可用宽度 (保留右侧一点空隙更美观)

  // 1. 测量整行文字宽度
  const textMetrics = ctx.measureText(content);
  const textWidth = textMetrics.width;

  // 2. 单行逻辑：如果放得下，直接绘制并居中
  if (textWidth <= maxWidth) {
    ctx.textBaseline = 'middle'; // 设置垂直对齐为中间
    ctx.textAlign = 'center'; 
    ctx.fillText(content, width / 2, height / 2);
    return;
  }

  // 3. 多行逻辑：自动换行
  ctx.textAlign = 'left'; 
  ctx.textBaseline = 'top'; // 多行计算时，使用 top 对齐更方便计算 Y 轴偏移
  
  const lines: string[] = [];
  let currentLine = '';

  // 逐字计算宽度进行换行
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const testLine = currentLine + char;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);

  // 4. 计算垂直居中的起始 Y 坐标
  const lineHeight = textFontSize * 1.2; // 行高设为字号的 1.2 倍，防止拥挤
  const totalTextHeight = lines.length * lineHeight;
  
  let startY = (height - totalTextHeight) / 2;

  // 如果文字总高度超过了画布高度，则从顶部开始画，防止文字被截断
  if (totalTextHeight > height) {
    startY = padding;
  }

  // 5. 循环绘制每一行
  lines.forEach((line) => {
    ctx.fillText(line, padding, startY);
    startY += lineHeight;
  });
};


const renderImage = () => {

  if (canvasInfo.width * canvasInfo.height >= 268421360) {
    message.error('图片过大，无法生成');
    return;
  }
  const canvas = canvasRef.value;
  if (!canvas) return;
  let targetSize: number = 0;
  if (canvasInfo.unit === 'kb') {
    targetSize = canvasInfo.targetSize * 1024;
  } else if (canvasInfo.unit === 'mb') {
    targetSize = canvasInfo.targetSize * 1024 ** 2;
  } else if (canvasInfo.unit === 'gb') {
    targetSize = canvasInfo.targetSize * 1024 ** 3;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (canvasInfo.fontSize === 0) {
    canvasInfo.fontSize = canvasInfo.width / 20;
  }
  ctx.fillStyle = canvasInfo.innerColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (canvasInfo.innerColor.startsWith('#FFFFF')) {
    ctx.fillStyle = '#000000FF';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }
  ctx.fillStyle = (parseInt(canvasInfo.innerColor.substring(1, 7), 16) > 0xffffff / 2) ? '#000000FF' : '#FFFFFFFF';
  const text = canvasInfo.innerText ? canvasInfo.innerText : `${canvasInfo.width + ' * ' + canvasInfo.height}`;
  drawText(ctx, text.split(''), canvasInfo.fontSize);
  canvas.toBlob(blob => {
    if (blob === null) {
      return;
    }
    const { size } = blob;
    const remaining = targetSize - size;
    if (targetSize > 0 && remaining < 0) {
      message.error('指定图片内存小于当前图片尺寸最小内存，指定内存未生效');
      return;
    }
    if (remaining > 0) {
      // 2、获取到 canvas 二进制数据
      blob.arrayBuffer().then((buf) => {
        // 4、生成指定大小的二进制数据
        const padding = new ArrayBuffer(remaining);
        const longInt8View = new Uint8Array(padding);
        for (var i = 0; i < longInt8View.length; i++) {
          longInt8View[i] = i % 255;
        }
        // 5、拼接图片与空文件
        const file = new Blob([buf, padding]);
        url.value = URL.createObjectURL(file);
      });
    } else {
      // 3、如果图片大小已经合适，创建url
      url.value = URL.createObjectURL(blob);
    }
  })
}
const downloadImg = () => {
  renderImage();
  //点击按钮下载图片
  const a = document.createElement('a');
  if (!url.value) return;
  a.href = url.value;
  a.download = 'image.jpg';
  a.click();
}
const remParam = () => {
  if (remember.value) {
    localCache.setCache('canvasInfo', canvasInfo);
  } else {
    localCache.removeCache('canvasInfo');
  }
}


watch(canvasInfo, (newVal, oldVal) => {
  console.debug(oldVal);
  if (remember.value) {
    localCache.setCache('canvasInfo', newVal);
  }
})

</script>

<template>
  <div class="content">
    <n-input-group class="item">
      <n-input-group-label>背景色</n-input-group-label>
      <n-color-picker v-model:value="canvasInfo.innerColor" :modes="['hex']" style="width: 100%;" />
    </n-input-group>
    <n-input-group class="item">
      <n-input-group-label>文字</n-input-group-label>
      <n-input v-model:value="canvasInfo.innerText" style="width: 100%;" />
    </n-input-group>
    <n-input-group class="item">
      <n-input-group-label>字号</n-input-group-label>
      <n-input-number v-model:value="canvasInfo.fontSize" button-placement="both" style="width: 100%;">
        <template #suffix>
          px
        </template>
      </n-input-number>
    </n-input-group>
    <n-input-group class="item">
      <n-input-group-label style="width:15%;">size</n-input-group-label>
      <n-input-number v-model:value="canvasInfo.targetSize" style="width: 100%;" />
      <n-select v-model:value="canvasInfo.unit" :options="canvasInfo.unitOptions" style="width:18%;"></n-select>
    </n-input-group>
    <n-input-group class="item">
      <n-input-group-label>width</n-input-group-label>
      <n-input-number v-model:value="canvasInfo.width" button-placement="both" style="width: 100%;">
        <template #suffix>
          px
        </template>
      </n-input-number>
    </n-input-group>
    <n-input-group class="item">
      <n-input-group-label>height</n-input-group-label>
      <n-input-number v-model:value="canvasInfo.height" button-placement="both" style="width: 100%;">
        <template #suffix>
          px
        </template>
      </n-input-number>
    </n-input-group>
    <n-checkbox class="item" v-model:checked="remember" @update:checked="remParam">记住参数</n-checkbox>
    <n-button @click="renderImage" style="width: 100%;margin-bottom: 1em;">预览</n-button>
    <n-button @click="downloadImg" type="success" style="width: 100%;margin-bottom: 1em;">下载</n-button>
    <div class="canvas-container">
      <canvas ref="canvasRef" :width="canvasInfo.width" :height="canvasInfo.height" />
    </div>
  </div>

</template>

<style scoped>
.content {
  margin-left: 35%;
  align-content: center;
  width: 30%;
  padding: 1em;
  height: 100%;
}

.item {
  margin-bottom: 1em;
}

.canvas-container {
  width: 100%;
  height: 45vh;
  overflow: hidden;
}

.canvas-container canvas {
  max-width: 100%;
  max-height: 100%;
  transform-origin: top left;
}
</style>
