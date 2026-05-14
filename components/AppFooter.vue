<script setup lang="ts">

</script>

<template>
  <UFooter
    :ui="{
      root: 'border-t border-default'
    }"
  >
    <template #left>
      <p class="text-muted text-sm">
        Built with Nuxt UI • © {{ new Date().getFullYear() }}
      </p>
    </template>

    <template #right>
      <UButton
          to="https://www.linkedin.com/in/danila-dippel/"
          target="_blank"
          icon="i-simple-icons-linkedin"
          aria-label="Nuxt on Discord"
          color="neutral"
          variant="ghost"
      />
      <UButton
          to="https://t.me/dippel_d_s"
          target="_blank"
          icon="i-simple-icons-telegram"
          aria-label="Nuxt on X"
          color="neutral"
          variant="ghost"
      />
      <UButton
          to="https://github.com/erroraeto"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="Nuxt UI on GitHub"
          color="neutral"
          variant="ghost"
      />
    </template>
  </UFooter>
</template>

<style scoped>

</style>