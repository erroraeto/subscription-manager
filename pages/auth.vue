<script setup lang="ts">
import {useProfile} from "~/composables/useProfile";

const { changeName } = useProfile();
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

const isWaiting = ref(false)
const registrationEmail = ref('')
let authListener: any = null

onMounted(() => {
  if (route.query.register === 'true') {
    isLogin.value = false
  }

  if (import.meta.client) {
    const savedWaiting = sessionStorage.getItem('is_waiting_confirm')
    const savedEmail = sessionStorage.getItem('awaiting_email')

    if (savedWaiting === 'true' && savedEmail) {
      isWaiting.value = true
      registrationEmail.value = savedEmail
      error.value = `A confirmation email has been sent to ${savedEmail}.\nFollow the link, then log in.`
    }
  }

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      sessionStorage.removeItem('is_waiting_confirm')
      sessionStorage.removeItem('awaiting_email')

      isWaiting.value = false
      loading.value = false

      router.push('/')
    }
  })

  authListener = data.subscription
})

onUnmounted(() => {
  if (authListener) {
    authListener.unsubscribe()
  }
})

import type { FormSubmitEvent } from '@nuxt/ui'

const handleSubmit = async (event: FormSubmitEvent<any>) => {
  if (!event) return
  loading.value = true
  error.value = ''

  try {
    if (isLogin.value) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: event.data.email,
        password: event.data.password
      })
      if (signInError) throw signInError
    } else {
      const { data, error: sugnUpError } = await supabase.auth.signUp({
        email: event.data.email,
        password: event.data.password,
        options: { data: { username: event.data.name } }
      })
      if (sugnUpError) throw sugnUpError
      if (!data.session) {
        isWaiting.value = true
        registrationEmail.value = event.data.email
        error.value = `A confirmation email has been sent to ${event.data.email}.\nFollow the link, then log in.`;

        sessionStorage.setItem('is_waiting_confirm', 'true')
        sessionStorage.setItem('awaiting_email', event.data.email)

        return;
      }
    }
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Error occured'
  } finally {
    loading.value = false
  }
}

const cancelWaiting = () => {
  sessionStorage.removeItem('is_awaiting_confirm')
  sessionStorage.removeItem('awaiting_email')
  isWaiting.value = false
  isLogin.value = true
  error.value = ''
}














import type { AuthFormField } from '@nuxt/ui'

const fieldsLogin = ref<AuthFormField[]>([{
    name: 'email',
    type: 'email',
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
    type: 'text',
    label: 'Name',
    placeholder: 'Enter your name'
  }, {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Enter your email'
  }, {
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password'
}])
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard
      variant="subtle"
      class="w-full max-w-md"
    >
      <template v-if="isWaiting">
        <UAuthForm
          title="Confirm"
          :description="error"
          icon="custom:logo"
          :ui="{
            leadingIcon: 'size-14 text-primary',
            description: 'whitespace-pre-line',
            body: 'hidden'
        }"
          class="max-w-md"
        >
          <template #footer>
            <UButton
              @click="cancelWaiting"
              label="Cancel & Back to Login"
            />
          </template>
        </UAuthForm>
      </template>
      <template v-else>
        <UAuthForm
          v-if="isLogin"
          title="Welcome back"
          :fields="fieldsLogin"
          icon="custom:logo"
          :ui="{
            leadingIcon: 'size-14 text-primary'
          }"
          class="max-w-md"
          :submit="{
            loading: loading
          }"
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
          :fields="fieldsSignup"
          icon="custom:logo"
          :ui="{
            leadingIcon: '-my-3 size-14 text-primary'
          }"
          class="max-w-md"
          :submit="{
            label: 'Create account',
            loading: loading
          }"
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
      </template>
    </UPageCard>
  </div>
</template>

<style scoped>

</style>