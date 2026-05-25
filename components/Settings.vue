<script setup lang="ts">
import type {FormError, FormSubmitEvent} from "@nuxt/ui";
import {useProfile} from '~/composables/useProfile';
const {
  profile,
  isLoading,
  error,
  fetchProfile,
  changeAvatar,
  changeName,
  changeNotification,
  changeCurrency,
  changeEmail,
  changePassword,
  deleteProfile
} = useProfile();
import { useUserPreferences } from '~/stores/useUserPreferences'
const prefs = useUserPreferences()
const user = useSupabaseUser();
const open = defineModel<boolean>({ default: false })
const toast = useToast()

const showError = (err: any) => {
  return toast.add({
    title: $t('common.error'),
    description: err.value?.trim(),
    icon: 'i-lucide-circle-alert',
    color: 'error'
  })
}

// ========== Tabs Navigation ==========
import type { TabsItem } from '@nuxt/ui'

const items: TabsItem[] = [
  {
    label: $t('settings.general'),
    icon: 'i-lucide-user',
    slot: 'general' as const
  }, {
    label: $t('settings.security'),
    icon: 'i-lucide-shield',
    slot: 'security' as const
  }
];

// ========== General ==========
const fileRef = ref<HTMLInputElement>()
const avatarPreview = ref<File | null>(null);
const profileForm = reactive({
  avatar: '',
  name: '',
  notification: true,
  email: '',
  password: {
    current: '',
    new: ''
  }
})

watch(profile, (newProfile) => {
  if (newProfile) {
    profileForm.avatar = profile.value?.avatar_url ?? '';
    profileForm.name = profile.value?.username ?? 'noName';
    profileForm.notification = profile.value?.notification ?? true;
    profileForm.email = user.value?.email ?? 'noEmail';
  }
}, { immediate: true });

async function submitGeneral(event: FormSubmitEvent<any>) {
  let success;
  if (event.data.name) {
    success = await changeName({ username: event.data.name });
  }
  if (event.data.notification !== undefined || event.data.notification !== null) {
    console.log(event.data.notification)
    success = await changeNotification({ notification: event.data.notification });
  }
  if (avatarPreview._value) {
    success = await changeAvatar(avatarPreview._value);
  }

  if (!success) {
    return showError(error);
  }

  toast.add({
    title: profile.value?.username ?? '',
    description: $t('settings.general_success'),
    avatar: {
      src: profile.value?.avatar_url ?? undefined,
    }
  })

}

// ========== Security ==========
import type { AccordionItem } from '@nuxt/ui'

const itemsAcc: AccordionItem[] = [
  {
    icon: 'i-lucide-mail',
    label: $t('common.email'),
    content: $t('settings.email_description'),
    slot: 'email' as const,
  },
  {
    icon: 'i-lucide-key-round',
    label: $t('common.password'),
    content: $t('settings.password_description'),
    slot: 'password' as const,
  }
]

async function submitEmail(event: FormSubmitEvent<any>) {
  const success = await changeEmail({
    email: event.data.email,
    password: event.data.password.current
  })
  if (!success) {
    return showError(error);
  }
  toast.add({
    title: $t('common.done') + '!',
    description: $t('settings.security_email_success'),
    icon: 'i-lucide-mail',
  })
}

async function submitPassword(event: FormSubmitEvent<any>) {
  const success = await changePassword({
    password: event.data.password.current,
    newPassword: event.data.password.new
  })
  if (!success) {
    return showError(error);
  }
  toast.add({
    title: $t('common.done') + '!',
    description: $t('settings.security_password_success'),
    icon: 'i-lucide-key-round',
  })
}

async function deleteHandler(event: FormSubmitEvent<any>) {
  await deleteProfile()
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="$t('common.settings')"
    :ui="{
      overlay: 'bg-unset backdrop-blur-xs backdrop-brightness-95',
      content: 'lg:w-3xl md:w-2xl w-3/4 max-w-6xl shadow-2xl inset-shadow-xs',
      header: 'px-5! py-3!',
      body: 'p-0!',
      footer: 'p-3! justify-end'
    }"
  >
    <template #body>
      <UTabs
        :items="items"
        variant="link"
        :ui="{
          root: 'flex-1 gap-0',
          list: 'p-2',
          content: 'flex flex-col px-6 py-3 bg-elevated/50',
          label: 'sm:block hidden'
        }"
      >
        <template #general="{ item }">
          <UForm
            :state="profileForm"
            @submit="submitGeneral"
            class="flex flex-col gap-y-4"
          >
            <div class="size-full flex sm:flex-row flex-col sm:gap-x-3 gap-y-3">
              <UFormField
                name="avatar"
                :label="$t('common.avatar')"
                :help="$t('settings.avatar_description')"
                :style="{ '--avatar-url': `url(${profileForm.avatar})` }"
                :ui="{
                  root: 'flex justify-between',
                  container: 'flex flex-col',
                  help: 'w-30 sm:block hidden'
                }"
              >
                <UFileUpload
                  variant="button"
                  accept="image/*"
                  v-model="avatarPreview"
                  :ui="{
                    root: 'size-30',
                    base: 'items-center cursor-pointer rounded-full border-2 border-accented upload-avatar hover:before:opacity-75',
                    wrapper: 'absolute top-2 end-2 size-5 p-0.5 rounded-full border border-2 border-bg bg-inverted',
                    icon: 'text-inverted size-full',
                    fileLeadingAvatar: 'rounded-full p-1 bg-default border border-2 border-accented',
                    fileTrailingButton: 'top-2 end-2 size-5 items-center justify-center',
                  }"
                />
              </UFormField>
              <USeparator orientation="vertical" class="hidden sm:block h-48" />
              <USeparator class="sm:hidden" />
              <div class="size-full flex flex-col gap-4">
                <UFormField
                  name="name"
                  :label="$t('common.name')"
                  :description="$t('settings.name_description')"
                  :ui="{
                    description: 'max-w-2xl sm:contents hidden'
                  }"
                  class="flex justify-between items-center gap-4"
                >
                  <UInput
                    v-model="profileForm.name"
                    autocomplete="off"
                  />
                </UFormField>
                <UFormField
                  name="notification"
                  :label="$t('common.notification')"
                  :description="$t('settings.notification_description')"
                  :ui="{
                    description: 'max-w-2xl sm:contents hidden'
                  }"
                  class="flex justify-between items-center gap-4"
                >
                  <USwitch
                    v-model="profileForm.notification"
                  />
                </UFormField>
              </div>
            </div>
            <UButton
              :label="$t('settings.save_changes')"
              type="submit"
              variant="subtle"
              class="w-fit lg:ms-auto self-end"
            />
          </UForm>
        </template>

        <template #security="{ item }">
          <UAccordion
            :items="itemsAcc"
          >
            <template #email="{ item }">
              <p class="text-sm pb-4 text-muted">
                {{ item.content }}
              </p>
              <UForm
                :state="profileForm"
                @submit="submitEmail"
                class="flex flex-col gap-y-4"
              >
                <UFormField
                  name="email"
                >
                  <UInput
                    v-model="profileForm.email"
                    type="email"
                    autocomplete="off"
                  />
                </UFormField>
                <UFormField name="current">
                  <UInput
                    v-model="profileForm.password.current"
                    type="password"
                    :placeholder="$t('settings.password_current')"
                    class="w-fit"
                  />
                </UFormField>
                <UButton
                  :label="$t('common.update')"
                  variant="subtle"
                  class="w-fit mb-4"
                  type="submit"
                />
              </UForm>
            </template>
            <template #password="{ item }">
              <p class="text-sm pb-4 text-muted">
                {{ item.content }}
              </p>
              <UForm
                :state="profileForm"
                @submit="submitPassword"
                class="flex flex-col gap-y-4"
              >
                <UFormField name="current">
                  <UInput
                    v-model="profileForm.password.current"
                    type="password"
                    :placeholder="$t('settings.password_current')"
                    class="w-fit"
                  />
                </UFormField>
                <UFormField name="new">
                  <UInput
                    v-model="profileForm.password.new"
                    type="password"
                    :placeholder="$t('settings.password_new')"
                    class="w-fit"
                  />
                </UFormField>
                <UButton
                  :label="$t('common.update')"
                  variant="subtle"
                  class="w-fit mb-4"
                  type="submit"
                />
              </UForm>
            </template>
          </UAccordion>
          <USeparator />
          <UPageCard
            :title="$t('settings.delete_account')"
            :description="$t('settings.delete_account_description')"
            variant="naked"
            :ui="{
              root: 'rounded-none py-3.5',
              title: 'text-error',
              footer: 'ms-auto'
            }"
          >
            <template #footer>
              <UButton
                :label="$t('settings.delete')"
                variant="subtle"
                color="error"
                @click="deleteHandler"
              />
            </template>
          </UPageCard>
        </template>
      </UTabs>
    </template>
  </UModal>
</template>

<style scoped>
:deep(.upload-avatar::before) {
  content: '';
  position: absolute;
  border-radius: 100%;
  margin: calc(var(--spacing) * 1);
  inset: 0;
  background-image: var(--avatar-url);
  background-position: center;
  background-size: cover;
  transition: opacity .15s ease;
}
</style>