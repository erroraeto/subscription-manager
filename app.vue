<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'
import {useLanguage} from "~/composables/useLanguage";
const { locale } = useI18n()
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'SubManager'
const description = 'A simple task manager that helps you focus on what matters most.'

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