<script setup lang="ts" name="HomeView">
import Card from '../components/Card.vue'
import { useRouter } from 'vue-router'
import { NGrid, NGi } from 'naive-ui';
const cardList = [
  { id: 1, title: '时间工具', path: '/dateTool', icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M10 8v6l4.7 2.9l.8-1.2l-4-2.4V8z" fill="currentColor"></path><path d="M17.92 12A6.957 6.957 0 0 1 11 20c-3.9 0-7-3.1-7-7s3.1-7 7-7c.7 0 1.37.1 2 .29V4.23c-.64-.15-1.31-.23-2-.23c-5 0-9 4-9 9s4 9 9 9a8.963 8.963 0 0 0 8.94-10h-2.02z" fill="currentColor"></path><path d="M20 5V2h-2v3h-3v2h3v3h2V7h3V5z" fill="currentColor"></path></svg>' },
  // { id: 2, title: '工时脚本', path: '/workTimeCalcCode', icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.795 21H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"></path><circle cx="18" cy="18" r="4"></circle><path d="M15 3v4"></path><path d="M7 3v4"></path><path d="M3 11h16"></path><path d="M18 16.496V18l1 1"></path></g></svg>' },
  { id: 3, title: '数据转换', path: '/dataTool', icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M6.25 3A2.25 2.25 0 0 0 4 5.25v2.5A2.25 2.25 0 0 0 6.25 10h9.5A2.25 2.25 0 0 0 18 7.75v-2.5A2.25 2.25 0 0 0 15.75 3h-9.5zM5.5 5.25a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75h-9.5a.75.75 0 0 1-.75-.75v-2.5zM8.7 16c-.387 0-.7.336-.7.75s.313.75.7.75h4.6c.387 0 .7-.336.7-.75s-.313-.75-.7-.75H8.7zm8.653.445l-.073.084a.75.75 0 0 1-.976.073l-.084-.073l-2-2a.75.75 0 0 1-.073-.976l.073-.084l2-2a.75.75 0 0 1 1.133.976l-.073.084l-.719.721h1.5a1.25 1.25 0 0 0 1.243-1.122l.007-.128V9.75a.75.75 0 0 1 1.493-.102l.007.102V12a2.75 2.75 0 0 1-2.583 2.745l-.167.005h-1.499l.718.719a.75.75 0 0 1 .073.976zM18 19.25v-2.026l-.013.012c-.405.406-.96.57-1.487.495v1.519a.75.75 0 0 1-.75.75h-9.5a.75.75 0 0 1-.75-.75v-5a.75.75 0 0 1 .75-.75h6.822c.058-.192.148-.376.272-.543l.022-.03l.12-.14l.788-.787H6.25A2.25 2.25 0 0 0 4 14.25v5a2.25 2.25 0 0 0 2.25 2.25h9.5A2.25 2.25 0 0 0 18 19.25z" fill="currentColor"></path></g></svg>' },
  { id: 4, title: '图片生成', path: '/imageTool', icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M18.75 4A3.25 3.25 0 0 1 22 7.25v11.5A3.25 3.25 0 0 1 18.75 22H7.25A3.25 3.25 0 0 1 4 18.75v-6.248c.474.198.977.34 1.5.422v5.826c0 .208.036.408.103.594l5.823-5.701a2.25 2.25 0 0 1 3.02-.116l.128.116l5.822 5.702c.067-.186.104-.386.104-.595V7.25a1.75 1.75 0 0 0-1.75-1.75h-5.826a6.457 6.457 0 0 0-.422-1.5h6.248zm-6.191 10.644l-.084.07l-5.807 5.687c.182.064.378.099.582.099h11.5c.203 0 .399-.035.58-.099l-5.805-5.686a.75.75 0 0 0-.966-.071zM16.252 7.5a2.252 2.252 0 1 1 0 4.504a2.252 2.252 0 0 1 0-4.504zM6.5 1a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11zm9.752 8a.752.752 0 1 0 0 1.504a.752.752 0 0 0 0-1.504zM6.5 3l-.09.007a.5.5 0 0 0-.402.402L6 3.5V6L3.498 6l-.09.008a.5.5 0 0 0-.402.402l-.008.09l.008.09a.5.5 0 0 0 .402.402l.09.008H6v2.503l.008.09a.5.5 0 0 0 .402.402l.09.009l.09-.009a.5.5 0 0 0 .402-.402l.008-.09V7L9.505 7l.09-.008a.5.5 0 0 0 .402-.402l.008-.09l-.008-.09a.5.5 0 0 0-.403-.402L9.504 6H7V3.5l-.008-.09a.5.5 0 0 0-.402-.403L6.5 3z" fill="currentColor"></path></g></svg>' },
  { id: 5, title: '内容对比', path: '/codeDiffTool', icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2"></path><path d="M10 8H8v2"></path><path d="M8 14v2h2"></path><path d="M14 8h2v2"></path><path d="M16 14v2h-2"></path></g></svg>' },
]
const router = useRouter()
</script>

<template>
  <div class="contianer">
    <n-grid :cols="8">
      <n-gi v-for="card in cardList">
        <Card :title="card.title" :key="card.id" @click="() => router.push(card.path)">
          <div class="logo" v-html="card.icon ? card.icon : card.title"></div>
        </Card>
      </n-gi>
    </n-grid>
  </div>
</template>

<style scoped>
.contianer {
  width: 95vw;
  display: flex;
  flex-wrap: wrap;
}

.logo {
  padding: 12%;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #04052255);
}
</style>
