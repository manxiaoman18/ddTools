<script setup lang="ts">
import { ref, computed, provide, watch } from 'vue';
import Header from './components/Header.vue';
import { NConfigProvider, NMessageProvider, NNotificationProvider, darkTheme, type GlobalThemeOverrides } from 'naive-ui';

const isDark = ref(localStorage.getItem('ddtools-theme') === 'dark');

const setThemeAttr = (dark: boolean) => {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
};
setThemeAttr(isDark.value);

const toggleTheme = () => {
  isDark.value = !isDark.value;
};

watch(isDark, (val) => {
  localStorage.setItem('ddtools-theme', val ? 'dark' : 'light');
  setThemeAttr(val);
});

provide('isDark', isDark);
provide('toggleTheme', toggleTheme);

const theme = computed(() => (isDark.value ? darkTheme : null));

const themeOverrides = computed<GlobalThemeOverrides>(() => ({
  common: {
    fontWeightStrong: '600',
    borderRadius: '8px',
  },
}));

const buildTime = import.meta.env.BUILD_TIME;
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-notification-provider>
      <n-message-provider>
        <div class="app-layout">
          <Header class="app-header" />
          <main class="app-main">
            <RouterView />
          </main>
          <footer class="app-footer">最近更新: {{ buildTime }}</footer>
        </div>
      </n-message-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 999;
  background-color: var(--card-bg, #fff);
  border-bottom: 1px solid var(--divider-color, #e6e6e6);
  user-select: none;
}

.app-main {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.app-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.4em 1em;
  font-size: 13px;
  color: gray;
  user-select: none;
  background-color: var(--card-bg, #fff);
  border-top: 1px solid var(--divider-color, #e6e6e6);
}
</style>
