<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()
const isLogin = ref<boolean>(false)
onMounted(() => {
  if (route.query.register === 'true') isLogin.value = false
})
const fieldsLogin = ref<AuthFormField[]>([
  {
    name: 'email',
    type: 'email',
    label: 'Email'
  }, {
    name: 'password',
    type: 'password',
    label: 'Password'
  }, {
    name: 'remember',
    label: 'Remember me',
    type: 'checkbox' as const
  }
])
const fieldsSignup = ref<AuthFormField[]>([
  {
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
  }
])
const otpForm = reactive({
  code: ''
})
const isLoading = ref<boolean>(false)
const error = ref<string>('')
const registrationEmail = ref<string>('')
const confirm = ref<boolean>(false)

const handleSignIn = async (event: FormSubmitEvent<any>) => {
  if (!event) return
  isLoading.value = true
  error.value = ''

  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: event.data.email,
      password: event.data.password
    })
    if (signInError) throw signInError
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Login failed'
  } finally {
    isLoading.value = false
  }
}

const handleSignUp = async (event: FormSubmitEvent<any>) => {
  if (!event) return
  isLoading.value = true
  error.value = ''

  console.log(event.data)
  try {
    const {data, error: signUpError} = await supabase.auth.signUp({
      email: event.data.email,
      password: event.data.password,
      options: {data: {username: event.data.name}}
    })
    if (signUpError) throw signUpError
    registrationEmail.value = event.data.email
    confirm.value = true
  } catch (err: any) {
    error.value = err.message || 'Registration failed'
  } finally {
    isLoading.value = false
  }
}

const handleVerifyOtp = async () => {
  if (!otpForm.code || otpForm.code.length < 6) {
    error.value = 'Please enter a valid 6-digit code'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: registrationEmail.value,
      token: otpForm.code,
      type: 'signup'
    })
    if (otpError) throw otpError
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Invalid or expired code'
  } finally {
    isLoading.value = false
  }
}

const backToLogin = () => {
  isLoading.value = false
  error.value = ''
  isLogin.value = false
  confirm.value = false
}
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
        :submit="{
          loading: isLoading
        }"
        @submit="handleSignIn"
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

      <template v-else>
        <UAuthForm
          v-if="!confirm"
          title="Create an account"
          :fields="fieldsSignup"
          icon="custom:logo"
          :ui="{
            leadingIcon: '-my-3 size-14 text-primary'
          }"
          class="max-w-md"
          :submit="{
            label: 'Create account',
            loading: isLoading
          }"
          @submit="handleSignUp"
        >
          <template #description>
            Already have an account? <ULink
              to="#"
              @click.prevent="isLogin = true"
              class="text-primary font-medium"
            >Login</ULink>.
          </template>
        </UAuthForm>

        <UForm
          v-else
          ref="formVerify"
          :state="otpForm"
          @submit="handleVerifyOtp"
          class="w-max flex flex-col items-center gap-y-6"
        >
          <div class="flex flex-col items-center gap-y-2">
            <UIcon name="i-lucide-mail" class="size-8"/>
            <div class="text-xl text-pretty font-semibold text-highlighted">Verify Your Email</div>
            <div class="text-base text-pretty text-muted text-center">Please enter the verification code we sent<br/>to <span class="text-highlighted">{{ registrationEmail }}</span>.</div>
          </div>

          <UFormField name="code">
            <UPinInput v-model="otpForm.code" :length="6" />
          </UFormField>
          <div class="flex items-center gap-x-2">
            <UButton
              label="Back"
              variant="outline"
              @click="backToLogin"
            />
            <UButton
              label="Submit"
              type="submit"
            />
          </div>
        </UForm>
      </template>
    </UPageCard>
  </div>
</template>

<style scoped>

</style>