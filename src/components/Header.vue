<script setup lang="ts" name="Header">
import { inject, type Ref } from 'vue'
import { useMessage } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { NPageHeader, NSpace, NDropdown, NButton, NIcon } from 'naive-ui'
import { ref } from 'vue';
const router = useRouter()
const route = useRoute()
const message = useMessage()
const isDark = inject<Ref<boolean>>('isDark')!
const toggleTheme = inject<() => void>('toggleTheme')!

const handleBack = () => {
  if (route.path !== '/') {
    router.back()
  } else {
    message.info('已经是首页啦')
  }
}
const count = ref(1);
const options = [
  {
    label: '没啥用',
    key: 'nothing',
    props: {
      onClick: () => {
        message.success(`没用+${count.value}`)
        count.value++;
      }
    }
  }
]
</script>

<template>
  <n-page-header subtitle="与人方便，与己方便" @back="handleBack">
    <template #title>
      <p style="text-decoration: none; color: inherit; font-size: 1.25em; white-space: nowrap;" @click="router.push('/')">ddTools</p>
    </template>
    <template #extra>
      <n-space align="center" :wrap="false">
        <n-button :bordered="false" size="small" @click="toggleTheme" title="切换主题">
          <n-icon size="1.2em">
            <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M6.76 4.84l-1.8-1.79l-1.41 1.41l1.79 1.79l1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41l-1.79 1.79l1.41 1.41l1.79-1.79zm-3.21 13.7l1.79 1.8l1.41-1.41l-1.8-1.79l-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6s6-2.69 6-6s-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41l1.79-1.8l-1.41-1.41l-1.79 1.8z" fill="currentColor" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9s9-4.03 9-9c0-.46-.04-.92-.1-1.36c-.98 1.37-2.58 2.26-4.4 2.26c-2.98 0-5.4-2.42-5.4-5.4c0-1.81.89-3.42 2.26-4.4c-.44-.06-.9-.1-1.36-.1z" fill="currentColor" />
            </svg>
          </n-icon>
        </n-button>
        <n-dropdown :options="options" placement="bottom-start">
          <n-button :bordered="false" size="small" class="hide-on-mobile">
            我是个没用的按钮😰
          </n-button>
        </n-dropdown>
      </n-space>
    </template>
  </n-page-header>
</template>

<style scoped>
@media (max-width: 600px) {
  .hide-on-mobile {
    display: none;
  }
}
</style>
