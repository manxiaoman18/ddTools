<script setup lang="ts">
import Header from './components/Header.vue';
import { NConfigProvider, NMessageProvider, NNotificationProvider } from 'naive-ui';
const buildTime = import.meta.env.BUILD_TIME;
</script>

<template>
  <n-config-provider :theme-overrides="{ common: { fontWeightStrong: '600' } }">
    <n-notification-provider>
      <n-message-provider>
        <Header class="header" />
        <div class="content">
          <RouterView />
        </div>
        <div class="footer">最近更新: {{ buildTime }}</div>
      </n-message-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<style scoped>
.header {
  /* header吸顶 */
  height: 8vh;
  user-select: none;
  background-color: #fff;
  z-index: 999;
  top: 0vh;
  position: sticky;
  border-bottom: 1px solid #e6e6e6;
}

.content {
  height: 89vh;
}

.footer {
  user-select: none;
  top: 90vh;
  display: flex;
  justify-content: center;
  position: bottom;
  height: 2.75vh;
  padding: 0 1em;
  font-size: 15px;
  color: gray;
}
</style>
