<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'
import {useLanguage} from "~/composables/useLanguage";
const { setLanguage, currentLanguage } = useLanguage();
const { locale } = useI18n()
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Nuxt Dashboard Template'
const description = 'A professional dashboard template built with Nuxt UI, featuring multiple pages, data visualization, and comprehensive management capabilities for creating powerful admin interfaces.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})
</script>

<template>
  <UApp :locale="locales[locale]">
    <Navigation/>
    <UMain class="flex justify-center inset-0">
      <NuxtPage />
    </UMain>
  </UApp>
</template>

<style scoped>
</style>