<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { addMonths, addYears, format, setHours } from 'date-fns';
import {useProtectedSubscriptions} from '~/composables/useProtectedSubscriptions';
import type { UForm } from '#components'
import {useProfile} from "~/composables/useProfile";
const {profile} = useProfile()
const { locale } = useI18n()
const route = useRoute()
const paramToday = route.query.today;

interface SubscriptionForm {
  service: string
  price: number | null
  currency: string
  period: string
  nextBillingDate: any
}

const form = reactive<SubscriptionForm>({
  service: '',
  price: 120,
  currency: '',
  period: 'monthly',
  nextBillingDate: ''
})

watch((profile), (newProfile) => {
  if (newProfile) {
    form.currency = profile.value?.preferred_currency ?? 'RUB';
  }
},{immediate: true})

const {
  subscriptions,
  isLoading,
  error,
  fetchSubscriptions,
  addSubscription,
  deleteSubscription
} = useProtectedSubscriptions();

const inputDate = useTemplateRef('inputDate')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

const table = useTemplateRef('table')

type Payment = {
  id: number
  displayID: number
  service: string
  amount: {
    price: number | null,
    currency: string
  }
  period: string
  nextBillingDate: string
  isToday: boolean
}

const columns: TableColumn<Payment>[] = [
  {
    accessorKey: 'displayID',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: 'neutral',
        variant: 'outline',
        label: '#',
        trailingIcon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-chevron-down'
            : 'i-lucide-chevron-up'
          : 'i-lucide-chevrons-up-down',
        // class: '-mx-2.5',
        ui: {
          base: 'justify-between w-full',
          label: 'w-full text-left',
          trailingIcon: 'size-3 mt-0.5 p-1.5',
        },
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => `#${row.getValue('displayID')}`,
    meta: {
      class: {
        th: 'text-left px-4 py-3',
        td: 'text-left px-6.5',
      }
    }
  },
  {
    accessorKey: 'service',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: 'neutral',
        variant: 'outline',
        label: $t('table.service'),
        icon: 'i-lucide-a-large-small',
        trailingIcon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-chevron-down'
            : 'i-lucide-chevron-up'
          : 'i-lucide-chevrons-up-down',
        // class: '-mx-2.5',
        ui: {
          base: 'justify-between w-full',
          label: 'w-full text-left',
          trailingIcon: 'size-3 mt-0.5 p-1.5',
        },
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    meta: {
      class: {
        th: 'text-left px-4 py-3',
        td: 'text-left px-6.5',
      }
    }
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: 'neutral',
        variant: 'outline',
        label: $t('table.price'),
        icon: 'i-lucide-banknote',
        trailingIcon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-chevron-down'
            : 'i-lucide-chevron-up'
          : 'i-lucide-chevrons-up-down',
        // class: '-mx-2.5',
        ui: {
          base: 'justify-between w-full',
          label: 'w-full text-left',
          trailingIcon: 'size-3 mt-0.5 p-1.5',
        },
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      const data = row.getValue('amount') as {price: string, currency: string};
      if (!data.price || !data.currency) return '';
      const amount = Number.parseFloat(data.price)
      return new Intl.NumberFormat( locale.value, {
        style: 'currency',
        currency: data.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount)
    },
    meta: {
      class: {
        th: 'text-left px-4 py-3',
        td: 'text-left px-6.5',
      }
    }
  },
  {
    accessorKey: 'period',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: 'neutral',
        variant: 'outline',
        label: $t('table.period'),
        icon: 'i-lucide-calendar-sync',
        trailingIcon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-chevron-down'
            : 'i-lucide-chevron-up'
          : 'i-lucide-chevrons-up-down',
        // class: '-mx-2.5',
        ui: {
          base: 'justify-between w-full',
          label: 'w-full text-left',
          trailingIcon: 'size-3 mt-0.5 p-1.5',
        },
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      const color = {
        monthly: 'success' as const,
        yearly: 'warning' as const,
      }[row.getValue('period') as string]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        $t('table.' + row.getValue('period'))
      )
    },
    meta: {
      class: {
        th: 'text-left px-4 py-3',
        td: 'text-left px-6.5',
      }
    }
  },
  {
    accessorKey: 'nextBillingDate',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: 'neutral',
        variant: 'outline',
        label: $t('table.nextBilling'),
        icon: 'i-lucide-calendar-fold',
        trailingIcon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-chevron-down'
            : 'i-lucide-chevron-up'
          : 'i-lucide-chevrons-up-down',
        // class: '-mx-2.5',
        ui: {
          base: 'justify-between w-full',
          label: 'w-full text-left',
          trailingIcon: 'size-3 mt-0.5 p-1.5',
        },
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('nextBillingDate') as string);
      return date.toLocaleString( locale.value, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    },
    meta: {
      class: {
        th: 'text-left px-4 py-3',
        td: 'text-left px-6.5',
      }
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
          UButton, {
            icon: 'i-lucide-x',
            color: 'error',
            variant: 'outline',
            ui: {
              leadingIcon: 'size-4 p-1.5',
            },
            title: $t('table.deleteTask'),
            onClick: () => deleteSubscription(row.original.id)
          }
      )
    },
    meta: {
      class: {
        th: 'text-right px-4 py-3',
        td: 'text-right px-6.5',
      }
    }
  },
  {
    id: 'isToday',
    enableSorting: true,
    header: () => '',
    cell: () => '',
    meta: { class: { th: 'hidden', td: 'hidden' } }
  }
]

const data = computed(() => {
  if (!subscriptions.value) return [];
  const mapped = subscriptions.value.map((sub, id, arr) => {
    let date = new Date(sub.next_billing_date);
    const period = sub.period;
    if (!date) return '';
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let maxIter = 1000;
    while (date < now && maxIter-- > 0) {
      if (period == 'monthly') {
        date = addMonths(date, 1);
      } else {
        date = addYears(date, 1);
      }
    }
    const actualDate = date.toISOString().split('T')[0];

    return {
      id: sub.id,
      displayID: arr.length - id,
      service: sub.service,
      amount: {price: sub.price, currency: sub.currency},
      period: sub.period,
      nextBillingDate: actualDate,
      isToday: actualDate === paramToday,
    }
  })
  if (paramToday) {
    return (mapped as Payment[]).sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      return b.displayID - a.displayID;
    });
  }
  return mapped
});


const toast = useToast()
function showToast(props: any) {
  toast.add({
    title: $t('table.withdrawal_title'),
    description: $t('table.withdrawal_message', {
      get amount() {
        const amount = Number.parseFloat(props.price);
        return new Intl.NumberFormat( locale.value, {
          style: 'currency',
          currency: props.currency
        }).format(amount)
      },
      get date() {
        let date = new Date(props.nextBillingDate.year, props.nextBillingDate.month - 1, props.nextBillingDate.day);
        const now = new Date();

        if (date < now) {
          if (props.period == 'monthly') {
            date = addMonths(date, 1);
          } else {
            date = addYears(date, 1);
          }
        }

        return new Intl.DateTimeFormat(locale.value, {
          day: '2-digit',
          month: '2-digit',
          get year() {
            if (props.period == 'yearly') return 'numeric'
          }
        }).format(date)
      }
    }),
    actions: [{
      icon: 'i-lucide-refresh-cw',
      label: 'Retry',
      color: 'neutral',
      variant: 'outline',
      onClick: (e) => {
        e?.stopPropagation()
      }
    }]
  })
}

const handleAddSubscription = async () => {
  const nextBillingDate = format(form.nextBillingDate as any, 'yyyy-MM-dd');

  await addSubscription({
    service: form.service,
    price: form.price,
    currency: form.currency,
    period: form.period,
    next_billing_date: nextBillingDate
  })

  await showToast(form);

  form.service = ''
  form.price = 120
  form.currency = 'RUB'
  form.period = 'monthly'
  form.nextBillingDate = null

}

const formRef = useTemplateRef('formRef')
</script>

<template>
<!--  <div class="flex-1 flex m-4 lg:ml-0 rounded-lg ring ring-default bg-default/75 shadow min-w-0">-->
  <div class="flex-1 p-4 max-h-[calc(100svh-var(--ui-header-height))] max-w-full">
    <UCard
      :ui="{
        // root: 'flex flex-col h-full w-full shadow-lg',
        root: 'flex flex-col max-h-full shadow-md h-full',
        header: 'flex items-center justify-between gap-1.5 p-3!',
        body: 'flex flex-1 p-0! overflow-auto',
        footer: 'p-3!',
      }"
    >
      <template #header>
        <UFieldGroup>
          <UButton
              icon="i-lucide-rotate-cw"
              color="neutral"
              variant="outline"
              :loading="isLoading"
              @click="fetchSubscriptions"
          />
          <UInput
              :model-value="table?.tableApi?.getColumn('service')?.getFilterValue() as string"
              icon="i-lucide-search"
              :placeholder="$t('table.filterPlaceholder')"
              class="max-w-sm"
              @update:model-value="table?.tableApi?.getColumn('service')?.setFilterValue($event)"
          />
        </UFieldGroup>
        <div class="flex flex-wrap items-center gap-1.5">
          <UModal
              :title="$t('table.form.title')"
              :description="$t('table.form.description')"
              :ui="{
                overlay: 'bg-unset backdrop-blur-xs backdrop-brightness-95',
                content: 'w-max max-w-6xl shadow-2xl inset-shadow-xs',
                header: 'p-3! bg-elevated',
                body: 'p-3!',
                footer: 'p-3! justify-end bg-elevated'
            }"
          >
            <UButton
              icon="i-lucide-plus"
              :label="$t('table.addButton')"
              color="primary"
              :loading="isLoading"
              :ui="{
                base: 'sm:px-2.5 px-1.5',
                label: 'sm:block hidden'
              }"
            />
            <template #body>
              <UForm ref="formRef"
                class="relative flex flex-col w-full gap-y-3"
                @submit="handleAddSubscription"
              >
                <UFormField :label="$t('table.service')"
                  :ui="{
                    container: 'ms-3'
                  }"
                >
                  <UInput
                    v-model="form.service"
                    placeholder="Netflix, Spotify, iCloud..."
                    class="w-full"
                  />
                </UFormField>
                <UFormField :label="$t('table.price')"
                  :ui="{
                    container: 'ms-3'
                  }"
                >
                  <UFieldGroup class="w-full">
                    <UInputNumber
                      v-model="form.price"
                      :min="0"
                    />
                    <USelectMenu
                      v-model="form.currency"
                      :items="['RUB', 'USD', 'EUR']"
                      :search-input="false"
                    />
                  </UFieldGroup>
                </UFormField>
                <UFormField :label="$t('table.period')"
                  :ui="{
                    container: 'ms-3'
                  }"
                >
                  <URadioGroup
                    v-model="form.period"
                    indicator="hidden"
                    variant="table"
                    orientation="horizontal"
                    default-value="monthly"
                    :items="[
                      { label: $t('table.monthly'), value: 'monthly' },
                      { label: $t('table.yearly'), value: 'yearly' }
                    ]"
                    :ui="{
                      fieldset: 'bg-default -space-x-[.75px] z-2',
                      item: 'flex-1 py-1.5 border-0 ring-accented ring-inset ring-1 has-data-[state=checked]:ring-primary/50 first-of-type:rounded-s-md last-of-type:rounded-e-md'
                    }"
                  />
                </UFormField>
                <UFormField :label="$t('table.nextBilling')"
                  :ui="{
                    container: 'ms-3'
                  }"
                >
                  <UInputDate
                    ref="inputDate"
                    v-model="form.nextBillingDate"
                    class="w-full"
                  >
                    <template #trailing>
                      <UPopover :reference="inputDate?.inputsRef[3]?.$el">
                        <UButton
                          color="neutral"
                          variant="link"
                          size="sm"
                          icon="i-lucide-calendar"
                          aria-label="Select a date"
                          class="px-0"
                        />
                        <template #content>
                          <UCalendar v-model="form.nextBillingDate" class="p-2" />
                        </template>
                      </UPopover>
                    </template>
                  </UInputDate>
                </UFormField>
                <button type="submit" class="hidden" />
              </UForm>
            </template>
            <template #footer="{close}">
              <UButton :label="$t('common.cancel')" color="primary" variant="outline" @click="close" />
              <UButton :label="$t('common.add')" type="submit" :loading="isLoading" @click="formRef?.submit()" />
            </template>
          </UModal>
        </div>
      </template>

      <UTable
        ref="table"
        :data="data"
        :columns="columns"
        :loading="isLoading"
        loading-color="primary"
        loading-animation="carousel"
        sticky
        :ui="{
          root: 'flex-1',
          base: 'h-full',
          tbody: 'bg-elevated/50',
        }"
      />

      <template #footer>
        <Placeholder class="h-15" />
      </template>
    </UCard>
  </div>
</template>

<style scoped>
</style>