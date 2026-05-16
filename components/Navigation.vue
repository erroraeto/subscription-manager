<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import {useProfile} from '~/composables/useProfile';
const {
  profile,
  changeCurrency,
  changeLanguage,
  changeTheme
} = useProfile();
const user = useSupabaseUser();
const route = useRoute()
const router = useRouter()
const isHydrated = ref(false)
const localePath = useLocalePath()
const allTabs = computed<TabsItem[]>(() => [
  { label: '', icon: 'custom:logo', value: localePath('/') },
  { label: $t('common.dashboard'), icon: '', value: localePath('/dashboard'), requiresAuth: true },
  { label: $t('common.table'), icon: '', value: localePath('/table'), requiresAuth: true }
])
const itemsTabs = computed(() => allTabs.value.filter(tab => !tab.requiresAuth || user.value))
const active = computed({
  get: () => {
    const currPath = route.path
    const tabsValue = itemsTabs.value.map(i => i.value)
    const tab = tabsValue.includes(currPath) ? currPath : tabsValue[0] || '/'
    setTimeout(() => {
      isHydrated.value = true
      index.value = tab
    }, 50)
    return tab
  },
  set: (val) => router.push(val)
})

const isAnimating = ref(false)
const index = ref()

const handleIndicator = (newIndex: any) => {
  if (index != newIndex) {
    isAnimating.value = true
    setTimeout(() => {
      isAnimating.value = false
    }, 180)
  }
}











//DropdownMenu
const supabase = useSupabaseClient()
const isSettingsModalOpen = ref(false)

const handleSignOut = async () => {
  await supabase.auth.signOut()
  router.push('/')
}

const { locales } = useI18n()

import type { DropdownMenuItem } from '@nuxt/ui'
import Settings from "~/components/Settings.vue";
import {useLanguage} from "~/composables/useLanguage";
const { locale, setLanguage } = useLanguage();
import {useTheme} from "~/composables/useTheme";
const { setTheme, currentTheme } = useTheme();
import {useCurrency} from "~/composables/useCurrency";
const { setCurrency, currentCurrency } = useCurrency();
const itemsMenu = computed<DropdownMenuItem[][]>(() => [
  [
    // {
    //   label: $t('common.profile'),
    //   icon: 'i-lucide-user',
    //   onSelect() {
    //     alert('Profile')
    //   }
    // },
    {
      label: $t('common.settings'),
      icon: 'i-lucide-cog',
      onSelect() {
        isSettingsModalOpen.value = true;
      }
    }
  ],
  [
    {
      label: $t('common.language'),
      icon: 'i-lucide-languages',
      children: [
        locales.value.map(lang => ({
          label: $t(`common.${lang.name}`),
          type: 'checkbox',
          checked: locale.value === lang.code,
          onSelect(e: Event) {
            e.preventDefault()
            setLanguage(lang.code)
          }
        }))
      ],
    },
    {
      label: $t('common.theme'),
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: $t('common.light'),
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: currentTheme.value === 'light',
          onSelect(e: Event) {
            e.preventDefault()
            setTheme('light')
          }
        }, {
          label: $t('common.dark'),
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: currentTheme.value === 'dark',
          onUpdateChecked(checked: boolean) {
            if (checked) {
              setTheme('dark')
            }
          },
          onSelect(e: Event) {
            e.preventDefault()
          }
        }
      ],
    }, {
      label: $t('common.currency'),
      icon: 'i-lucide-coins',
      children: [
        {
          label: 'RUB',
          icon: 'i-lucide-russian-ruble',
          type: 'checkbox',
          checked: currentCurrency.value === 'RUB',
          onSelect(e: Event) {
            e.preventDefault()
            setCurrency('RUB');
          }
        }, {
          label: 'USD',
          icon: 'i-lucide-dollar-sign',
          type: 'checkbox',
          checked: currentCurrency.value === 'USD',
          onSelect(e: Event) {
            e.preventDefault()
            setCurrency('USD');
          }
        }, {
          label: 'EUR',
          icon: 'i-lucide-euro',
          type: 'checkbox',
          checked: currentCurrency.value === 'EUR',
          onSelect(e: Event) {
            e.preventDefault()
            setCurrency('EUR');
          }
        }
      ],
    },
  ],
  [
    {
      label: $t('common.logout'),
      color: 'error',
      icon: 'i-lucide-log-out',
      onSelect: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error(error);
        else await navigateTo('/auth');
        // alert('Logout')
      }
    }
  ]
])
</script>

<template>
  <UHeader :toggle="false" >
    <template #left>
      <UTabs
        v-model="active"
        @update:modelValue="(newIndex) => handleIndicator(newIndex)"
        :content="false"
        :items="itemsTabs"
        :ui="{
          list: 'p-0 bg-transparent',
          indicator: `h-full top-0 rounded-full transition-all duration-300 ease-in-out ${isHydrated ? 'opacity-100' : 'opacity-0'} ` +
              'bg-primary-100/60 group-has-[[data-active]:hover]:bg-primary-100/40 dark:bg-muted/80 dark:group-has-[[data-active]:hover]:bg-muted ' +
              // `${isAnimating ? 'scale-115' : 'scale-100'} ` +
              'water-pattern will-change-transform ',
          trigger: `py-2 rounded-full ${isHydrated ? 'data-[state=active]:text-primary-500' : 'data-[state=active]:text-gray-500'} hover:text-gray-700 font-semibold `,
          leadingIcon: 'flex-1 w-10 text-primary-500',
        }" />
    </template>


    <template v-if="user" #right>
      <div class="relative inline-block text-left">
        <UDropdownMenu
            :items="itemsMenu"
            :modal="false"
            :content="{
            align: 'end',
            side: 'bottom',
            sideOffset: 14
          }"
            :ui="{
            content: 'min-w-32 -mx-1 bg-muted/80 backdrop-blur-xs ring-transparent border border-muted/70 shadow-lg inset-shadow-xs',
            viewport: 'divide-muted/70',
            group: 'flex flex-col gap-y-1'
          }"
        >
          <UButton
            variant="solid"
            :avatar="{
              src: profile?.avatar_url ?? undefined,
              loading: 'lazy'
            }"
            :label="profile?.username?.charAt(0) ?? 'Avatar'"
            :ui="{
              base: 'flex items-center justify-center w-8 h-8 p-0 rounded-full ' +
                'transition-all duration-300 ease-out water-pattern shadow-md ' +
                'active:scale-110 will-change-transform',
              leadingAvatar: 'fisheye-avatar size-full mix-blend-screen ',
              label: `${profile?.avatar_url ? 'hidden' : ''} mb-[1px] uppercase text-sm font-semibold text-primary-500`,
            }"
          />
        </UDropdownMenu>
<!--        <svg style="position: absolute; width: 0; height: 0; overflow: hidden;" aria-hidden="true">-->
<!--          <defs>-->
<!--            <filter id="fisheye" filterUnits="objectBoundingBox" primitiveUnits="objectBoundingBox" x="0" y="0" width="1" height="1">-->
<!--              <feImage preserveAspectRatio="none"-->
<!--                       href="/sphere.png"-->
<!--                       result="barrel"-->
<!--              />-->
<!--              <feDisplacementMap in2="barrel" in="SourceGraphic" xChannelSelector="R" yChannelSelector="G" scale=".15"/>-->
<!--              <feComposite operator="in" in2="barrel"/>-->
<!--            </filter>-->
<!--          </defs>-->
<!--        </svg>-->
<!--          :deep(.fisheye-avatar) {-->
<!--            filter: url(#fisheye);-->
<!--          }-->

        <Settings v-model:open="isSettingsModalOpen" />
      </div>
    </template>

    <template v-else #right>
      <div class="relative inline-block text-left">
        <UButton
            variant="solid"
            icon="i-lucide-log-in"
            to="/auth"
            :ui="{
              base: 'flex items-center justify-center w-8 h-8 rounded-full ' +
                'transition-all duration-300 ease-out water-pattern shadow-md ' +
                'active:scale-110 will-change-transform',
              leadingIcon: '-ms-0.5 text-sm font-semibold text-primary-500',
            }"
        />
      </div>
    </template>

  </UHeader>
</template>

<style scoped>
</style>