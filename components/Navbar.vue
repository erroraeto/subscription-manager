<script setup lang="ts">
import {
  HomeIcon
} from "@heroicons/vue/24/solid";
import {
  RectangleStackIcon
} from "@heroicons/vue/20/solid";

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()

const handleSignOut = async () => {
  await supabase.auth.signOut()
  router.push('/')
}
</script>

<template>
<!--  <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">-->
  <nav class="sticky top-0 z-50 pointer-events-none">
    <div class="container mx-auto p-3">
      <div class="flex items-center justify-between">
        <!-- Логотип и навигационные ссылки -->
        <div class="flex items-center space-x-1 p-1 rounded-3xl bg-white/90 backdrop-blur-sm border-b border-gray-300 shadow-sm pointer-events-auto">
          <NuxtLink to="/" class="flex items-center space-x-2 rounded-3xl px-2 py-1
            focus:ring-1 focus:ring-blue-300 focus:rounded-3xl focus:border-blue-500 outline-none
            transition-colors duration-200 ease hover:bg-blue-100
          ">
            <svg viewBox="0 0 17 9" fill="currentColor" class="size-7 mb-0.2 text-blue-500">
              <path d="M4.25.5h3.6152v4.0137l-3.6152-4.0137zm-3.8262 2.3555h-.0352c0-.8047.2188-1.3984.6563-1.7813.4375-.3828 1.1113-.5742 2.0215-.5742l4.7988 5.8242c0 .7734-.209 1.3262-.6269 1.6582-.4063.3242-1.0703.4863-1.9922.4863l-4.8223-5.6133zm-.0176 1.582 3.4805 4.0371h-3.4805v-4.0371zm12.9825-3.9434h.5274c1.4375 0 2.2969.4883 2.5781 1.4648.0899.3164.1348.6816.1348 1.0957v5.4199h-3.2403v-7.9805zm-4.3476 0h3.2578v7.9805h-3.2578v-7.9805z"/>
            </svg>
          </NuxtLink>
          <div class="hidden md:flex items-center space-x-1">
            <NuxtLink
                to="/"
                class="h-9 px-3 flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors
                  rounded-3xl
                  focus:ring-1 focus:ring-blue-300 focus:rounded-3xl focus:border-blue-500 outline-none
                  transition-colors duration-200 ease hover:bg-blue-100
                "
                active-class="text-blue-600"
            >
              <span class="mb-0.5">Главная</span>
            </NuxtLink>
            <NuxtLink
                v-if="user"
                to="/subscription-manager/pages/table"
                class="h-9 px-3 flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors
                  rounded-3xl
                  focus:ring-1 focus:ring-blue-300 focus:rounded-3xl focus:border-blue-500 outline-none
                  transition-colors duration-200 ease hover:bg-blue-100
                "
                active-class="text-blue-600"
            >
              <span class="mb-0.5">Все задачи</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Блок авторизации -->
        <div class="flex items-center space-x-4">
          <div v-if="user" class="flex items-center space-x-3 p-1 rounded-full bg-white/90 backdrop-blur-sm border-b border-gray-300 shadow-sm pointer-events-auto">
            <ProfileDropdown />

            <!-- Информация о пользователе -->
<!--            <div class="w-7 h-7 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">-->
<!--                <span class="text-xs font-semibold text-blue-600">-->
<!--                  {{ user.email?.charAt(0).toUpperCase() }}-->
<!--                </span>-->
<!--            </div>-->
<!--            <div class="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full">-->
<!--              -->
<!--              <span class="text-sm text-gray-700 truncate max-w-[120px]">-->
<!--                {{ user.email }}-->
<!--              </span>-->
<!--            </div>-->

            <!-- Кнопка выхода -->
<!--            <button-->
<!--                @click="handleSignOut"-->
<!--                class="px-4 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors border border-red-200"-->
<!--            >-->
<!--              Выйти-->
<!--            </button>-->
          </div>

          <div v-else class="flex items-center space-x-3">
            <!-- Кнопка входа -->
            <NuxtLink
                to="/auth"
                class="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Войти
            </NuxtLink>

            <!-- Кнопка регистрации -->
            <NuxtLink
                to="/auth"
                class="px-4 py-1.5 text-sm bg-white text-blue-600 rounded-md hover:bg-gray-50 transition-colors border border-gray-300"
            >
              Регистрация
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Мобильное меню -->
      <div class="md:hidden mt-3 pt-3 border-t border-gray-200">
        <div class="flex flex-col space-y-2">
          <NuxtLink
              to="/"
              class="text-gray-700 hover:text-blue-600 py-1.5 px-2 rounded hover:bg-gray-50"
              active-class="text-blue-600 bg-blue-50"
          >
            Главная
          </NuxtLink>

          <NuxtLink
              to="/subscription-manager/pages/table"
              class="text-gray-700 hover:text-blue-600 py-1.5 px-2 rounded hover:bg-gray-50"
              active-class="text-blue-600 bg-blue-50"
          >
            Все задачи
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>

</style>