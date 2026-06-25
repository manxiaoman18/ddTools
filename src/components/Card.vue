<script setup lang="ts">

const props = defineProps<{ title: string }>()

</script>

<template>
  <div class="card">
    <div class="logo">
      <slot></slot>
    </div>
    <div class="title">{{ props.title }}</div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  justify-items: center;
  align-items: center;
  flex-direction: column;
  padding: 1.2rem 0.8rem;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border-radius: 12px;

  &:hover {
    transform: translateY(-4px);
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
  }

  .logo {
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 25%;
    padding: 0.1rem;
    box-shadow: 2px 2px 6px 0px var(--card-shadow);
    width: 4rem;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.25s ease;
  }

  .logo :deep(svg) {
    width: 100%;
    height: 100%;
  }

  .title {
    font-size: 1.1rem;
    margin-top: 0.5rem;
    user-select: none;
    text-align: center;
  }
}

@media (max-width: 600px) {
  .card {
    padding: 0.8rem 0.4rem;

    .logo {
      width: 3rem;
      height: 3rem;
    }

    .title {
      font-size: 0.95rem;
    }
  }
}
</style>
