<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
const localePath = useLocalePath()
const user = useSupabaseUser()

const links = computed<ButtonProps[]>(() => {
  if (!user.value) {
    return [
      {
        label: $t('common.create_account'),
        to: localePath('/auth?register=true'),
        icon: 'i-lucide-square-play'
      },
      {
        label: $t('common.login'),
        to: localePath('/auth'),
        color: 'neutral',
        variant: 'subtle',
        trailingIcon: 'i-lucide-arrow-right'
      }
    ]
  } else {
    return [
      {
        label: $t('index.subscription'),
        to: localePath('/table'),
        trailingIcon: 'i-lucide-arrow-right'
      }
    ]
  }

})




import type { PageFeatureProps } from '@nuxt/ui'

const featuresDashboard = ref<PageFeatureProps[]>([
  {
    title: $t('index.dashboard_features.first.title'),
    description: $t('index.dashboard_features.first.description'),
    icon: 'i-lucide-gallery-vertical-end',
  },
  {
    title: $t('index.dashboard_features.second.title'),
    description: $t('index.dashboard_features.second.description'),
    icon: 'i-lucide-calendar-days',
  },
  {
    title: $t('index.dashboard_features.third.title'),
    description: $t('index.dashboard_features.third.description'),
    icon: 'i-lucide-area-chart',
  }
])

const featuresTable = ref<PageFeatureProps[]>([
  {
    title: $t('index.table_features.first.title'),
    description: $t('index.table_features.first.description'),
    icon: 'i-lucide-clipboard-plus',
  },
  {
    title: $t('index.table_features.second.title'),
    description: $t('index.table_features.second.description'),
    icon: 'i-lucide-clipboard-pen',
  },
  {
    title: $t('index.table_features.third.title'),
    description: $t('index.table_features.third.description'),
    icon: 'i-lucide-clipboard-list',
  }
])

const itemsTable = [
  {
    light: '/content/table_light.png',
    dark: '/content/table_dark.png'
  },
  {
    light: '/content/table_light_modal.png',
    dark: '/content/table_dark_modal.png'
  }
]
</script>

<template>
  <div class="flex-1 w-full">
    <UPageHero
      :headline="$t('index.headline')"
      :title="$t('index.title')"
      :description="$t('index.description')"
      :links="links"
    >
      <LazyStarsBg class="-top-[var(--ui-header-height)] h-[calc(100vh+var(--ui-header-height))]"/>
    </UPageHero>
    <UPageSection
      :title="$t('index.dashboard_title')"
      :description="$t('index.dashboard_description')"
      orientation="horizontal"
      :features="featuresDashboard"
    >
      <UCard
        variant="subtle"
        :ui="{
          root: '',
          header: 'flex p-2! gap-x-2',
          body: 'p-0!'
        }"
      >
        <template #header>
          <UBadge class="size-3" variant="subtle" color="error"/>
          <UBadge class="size-3" variant="subtle" color="warning"/>
          <UBadge class="size-3" variant="subtle" color="success"/>
        </template>
        <UColorModeImage
          light="/content/dashboard_light.png"
          dark="/content/dashboard_dark.png"
          alt="Illustration dashboard"
          class="w-full"
          loading="lazy"
        />
      </UCard>
    </UPageSection>
    <UPageSection
      :title="$t('index.table_title')"
      :description="$t('index.table_description')"
      orientation="horizontal"
      :features="featuresTable"
      reverse
    >
      <UCard
        variant="subtle"
        :ui="{
          header: 'flex p-2! gap-x-2',
          body: 'p-0!'
        }"
      >
        <template #header>
          <UBadge class="size-3" variant="subtle" color="error"/>
          <UBadge class="size-3" variant="subtle" color="warning"/>
          <UBadge class="size-3" variant="subtle" color="success"/>
        </template>
        <UCarousel
          v-slot="{ item }"
          arrows
          dots
          loop
          :autoplay="{ delay: 2000 }"
          :items="itemsTable"
          prev-icon="i-lucide-chevron-left"
          next-icon="i-lucide-chevron-right"
          :ui="{
            root: 'max-w-full!',
            container: 'transition-[height]',
            controls: 'absolute inset-0 pointer-events-none',
            arrows: 'pointer-events-auto',
            prev: '-start-px! ring-default rounded-s-none',
            next: '-end-px! ring-default rounded-e-none',
            dots: 'pointer-events-auto bottom-0 w-max p-2 bg-default ring-1 ring-default rounded-t-xs inset-x-1/2 -translate-x-1/2',
            dot: 'w-6 h-1'
          }"
          class="w-full max-w-xs mx-auto"
        >
          <UColorModeImage
            :light="item.light"
            :dark="item.dark"
            alt="Illustration table"
            class="w-full"
            loading="lazy"
          />
        </UCarousel>
      </UCard>
    </UPageSection>

    <UPageCTA
      variant="naked"
      class="overflow-hidden"
      :title="$t('index.CTA')"
      :links="links"
      :ui="{
        header: 'flex justify-center',
        title: 'w-sm'
      }"
    >
      <LazyStarsBg/>
    </UPageCTA>

    <AppFooter/>
  </div>
</template>

<style scoped>
</style>