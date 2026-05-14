<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

onMounted(() => {
  if (route.query.register === 'true') {
    isLogin.value = false
  }
})

import type { FormSubmitEvent } from '@nuxt/ui'

const handleSubmit = async (event: FormSubmitEvent<any>) => {
  if (!event) return
  loading.value = true
  error.value = ''
  console.log(event.data.email)

  try {
    if (isLogin.value) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: event.data.email,
        password: event.data.password
      })
      if (signInError) throw signInError
    } else {
      const { error: sugnUpError } = await supabase.auth.signUp({
        email: event.data.email,
        password: event.data.password
      })
      if (sugnUpError) throw sugnUpError
      alert('Registration successfully! Check your email.')
    }
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Error occured'
  } finally {
    loading.value = false
  }
}
















import type { AuthFormField } from '@nuxt/ui'

const fieldsLogin = ref<AuthFormField[]>([{
    name: 'email',
    type: 'text',
    label: 'Email'
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password'
  }, {
    name: 'remember',
    label: 'Remember me',
    type: 'checkbox' as const
}])

const fieldsSignup = ref<AuthFormField[]>([{
    name: 'name',
    type: 'text' as const,
    label: 'Name',
    placeholder: 'Enter your name'
  }, {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Enter your email'
  }, {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter your password'
}])
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard
      variant="subtle"
      class="w-full max-w-md"
    >
      <UAuthForm
        v-if="isLogin"
        title="Welcome back"
        :fields="fieldsLogin"
        icon="custom:logo"
        :ui="{
          leadingIcon: 'size-14 text-primary'
        }"
        class="max-w-md"
        @submit="handleSubmit"
      >
        <template #description>
          Don't have an account? <ULink
            to="#"
            @click.prevent="isLogin = false"
            class="text-primary font-medium"
          >Sign up</ULink>.
        </template>

        <template #password-hint>
          <ULink
            to=""
            class="text-primary font-medium"
            tabindex="-1"
          >Forgot password?</ULink>
        </template>
      </UAuthForm>

      <UAuthForm
        v-else
        title="Create an account"
        :submit="{ label: 'Create account' }"
        :fields="fieldsSignup"
        icon="custom:logo"
        :ui="{
          leadingIcon: '-my-3 size-14 text-primary'
        }"
        class="max-w-md"
        @submit="handleSubmit"
      >
        <template #description>
          Already have an account? <ULink
            to="#"
            @click.prevent="isLogin = true"
            class="text-primary font-medium"
          >Login</ULink>.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
<!--  <div class="flex-1 flex items-center justify-center p-4">-->
<!--    <div class="auth-form max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">-->
<!--      <h3 class="text-xl font-bold mb-6 text-center text-gray-800">-->
<!--        {{isLogin ? 'Вход' : 'Регистрация'}}-->
<!--      </h3>-->
<!--      <form @submit.prevent="handleSubmit" class="space-y-4">-->
<!--        <input-->
<!--            v-model="email"-->
<!--            type="email"-->
<!--            placeholder="Email"-->
<!--            required-->
<!--            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"-->
<!--        />-->
<!--        <input-->
<!--            v-model="password"-->
<!--            type="password"-->
<!--            placeholder="Password"-->
<!--            required-->
<!--            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"-->
<!--        />-->
<!--        <button-->
<!--            type="submit"-->
<!--            :disabled="loading"-->
<!--            class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"-->
<!--        >-->
<!--          {{ loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}}-->
<!--        </button>-->
<!--      </form>-->
<!--      <p v-if="error" class="text-red-600 text-sm text-center p-2 bg-red-50 rounded">{{error}}</p>-->
<!--      <button-->
<!--          @click="isLogin = !isLogin"-->
<!--          class="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm"-->
<!--      >-->
<!--        {{isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}}-->
<!--      </button>-->
<!--    </div>-->
<!--  </div>-->
</template>

<style scoped>

</style>