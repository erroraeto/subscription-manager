<script setup lang="ts">
definePageMeta({
  hideNavigation: true
})

const countdown = ref(3)
let timer: NodeJS.Timeout | null = null

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--

    if (countdown.value <= 0) {
      if (timer) clearInterval(timer)
      setTimeout(() => {
        navigateTo('/')
      }, 100)
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <UPageSection
    icon="i-lucide-circle-check"
    title="Email Verified"
    :description="`Redirecting to the app in …${countdown}`"
    :ui="{
      root: '-mt-[var(--ui-header-height)]',
      container: 'h-full content-center justify-center',
      leadingIcon: 'size-30',
      title: 'text-2xl sm:text-3xl lg:text-4xl'
    }"
  />
</template>

<style scoped>

</style>