<script setup lang="ts">
import { useProtectedSubscriptions } from '~/composables/useProtectedSubscriptions';
import {
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  format,
  addMonths,
  eachDayOfInterval,
  isSameDay,
  isAfter,
  lastDayOfMonth,
  isSameMonth,
  isSameYear,
  isBefore,
  startOfDay,
  differenceInMonths,
  startOfYear
} from 'date-fns'
import { CalendarDate } from '@internationalized/date';
import { useProfile } from '~/composables/useProfile'
import { convertCurrency } from '~/utils/currency'
const { profile } = useProfile();
const { data: rates } = await useFetch('/api/rates')
import {useCurrency} from "~/composables/useCurrency";
const { currentCurrency } = useCurrency();
const { subscriptions } = useProtectedSubscriptions();
const displayedSubscriptions = computed(() => {
  if (!rates.value) return subscriptions.value;
  const now = subscriptions.value.map((sub) => ({
    ...sub,
    convertedPrice: convertCurrency(sub.price ?? 0, sub.currency, currentCurrency.value, rates.value)
  }));
  return now
});
const { locale } = useI18n()

// ========== Card ==========
const cards = computed(() => [
  {
    iconName: 'i-lucide-chart-bar-stacked',
    title: $t('dashboard.card.total'),
    description: displayedSubscriptions.value.length,
  },
  {
    iconName: 'i-lucide-banknote-arrow-up',
    title: $t('dashboard.card.most'),
    description: new Intl.NumberFormat( locale.value, {
      style: 'currency',
      currency: currentCurrency.value ?? 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(displayedSubscriptions.value.sort((a, b) => (b.convertedPrice ?? 0) - (a.convertedPrice ?? 0))[0]?.convertedPrice),
  },
  {
    iconName: 'i-lucide-banknote',
    title: $t('dashboard.card.average'),
    description: new Intl.NumberFormat( locale.value, {
      style: 'currency',
      currency: currentCurrency.value ?? 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(displayedSubscriptions.value.sort((a, b) => (b.convertedPrice ?? 0) - (a.convertedPrice ?? 0))[Math.round(displayedSubscriptions.value.length / 2)]?.convertedPrice),
  }
])

// ========== Calendar ==========
const nowDate = new Date();
const calendar = shallowRef( new CalendarDate( nowDate.getFullYear(), nowDate.getMonth() + 1, nowDate.getDate()) );
function handleDateChange(newDate: CalendarDate) {
  if (newDate === undefined) return
  calendar.value = newDate;
}
const calendarData = computed<{ totals: { monthly: Record<string, number>; yearly: Record<string, number> }; totalSum: number }>(() => {
  if (!displayedSubscriptions.value) return { totals: { monthly: {}, yearly: {} }, totalSum: 0 }
  const monthly: Record<string, number> = {}
  const yearly: Record<string, number> = {}
  let totalSum: number = 0;
  const calendarDate = new Date(calendar.value.year, calendar.value.month - 1, calendar.value.day)

  for (const sub of displayedSubscriptions.value) {

    const billingDate = new Date(sub.next_billing_date)
    if (!sub.convertedPrice || isBefore(startOfMonth(calendarDate), startOfMonth(billingDate))) continue;

    const key: string = `${calendar.value.month - 1}-${billingDate.getDate()}`;

    if ( sub.period === 'yearly' && calendarDate.getMonth() === billingDate.getMonth() ) {
      yearly[key] = (yearly[key] || 0) + sub.convertedPrice
      totalSum += sub.convertedPrice
    } else if (sub.period === 'monthly') {
      monthly[key] = (monthly[key] || 0) + sub.convertedPrice
      totalSum += sub.convertedPrice
    }
  }
  return { totals: { monthly: monthly, yearly: yearly }, totalSum }
})

// ========== Graphic ==========
import type { EChartsType } from 'echarts';
import {useTheme} from "~/composables/useTheme";
const { currentTheme } = useTheme();

const monthNames = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, { month: 'short', year: 'numeric' })
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2024, i, 1)
    return formatter.format(date)
  })
})
const yearlyTotal = ref(0);
const chartData = computed(() => {
  if (!displayedSubscriptions.value) return []
  const now = startOfYear(new Date());
  const months = [];
  for (let i = 0; i < 12; i++) {
    const start = startOfMonth(addMonths(now, i))
    const end = endOfMonth(start)
    months.push({
      start,
      end,
      x: i,
      total: 0,
      label: format(start, 'MMM yyyy')
    })
  }

  for (const sub of displayedSubscriptions.value) {
    const price = sub.convertedPrice
    const billingDate = new Date(sub.next_billing_date)
    if (!price) continue;

    if ( sub.period === 'yearly' ) {

      const month = months.find(m => isWithinInterval(billingDate, { start: m.start, end: m.end }))
      if (month) month.total += price

    } else if (sub.period === 'monthly') {

      for (const month of months) {
        if (isBefore(startOfMonth(month.start), startOfMonth(billingDate))) continue;
        month.total += price
      }

    }
  }

  yearlyTotal.value = months.reduce((acc, m) => acc + m.total, 0)

  return months.map(m => m.total)
})

const chartRef = ref<EChartsType | null>(null);
const colorMode = useColorMode();
const isMobile = ref(false)
onMounted(() => {
  isMobile.value = window.matchMedia('(pointer: coarse)').matches
})
const chartOption = computed(() => ({
  theme: currentTheme.value,
  currency: currentCurrency.value ?? 'RUB',
}))
const chartSettings = computed<ECOption>(() => {
  const { currency } = chartOption.value;

  return ({
    xAxis: {
      type: 'category',
      data: monthNames.value,
      axisLabel: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--chart-label').trim() || '#888',
      },
      axisLine: {
        lineStyle: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--chart-line').trim() || '#888',
        }
      },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--chart-line').trim() || '#888',
        }
      },
      axisLabel: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--chart-label').trim() || '#888',
        formatter: (value: number) => {
          return new Intl.NumberFormat(locale.value, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(value)
        },
      },
    },
    tooltip: {
      trigger: 'axis',
      triggerOn: isMobile.value ? 'none' : 'mousemove',
      axisPointer: {
        axis: 'x',
        type: 'line',
        z: 0,
        lineStyle: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--chart-line').trim() || '#888',
          type: [2, 5],
          dashOffset: 5,
          width: 1.5,
        },
      },
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      padding: 0,
      extraCssText: 'box-shadow: none;',
      hideDelay: 0,
      transitionDuration: 0,
      position(point, params: CallbackDataParams | CallbackDataParams[], dom, rect, size) {
        if (Array.isArray(params) && chartRef.value) {
          const {axisValue, value, seriesIndex} = params[0] as any;
          const coord = chartRef.value.convertToPixel({seriesIndex: seriesIndex}, [axisValue, value]);
          if (coord[0] && coord[1]) {
            return [
              coord[0] - size.contentSize[0] / 2,
              coord[1] - size.contentSize[1] - 20
            ];
          }
        }
        return [point[0], point[1] - 20];
      },
      confine: true,
    },
    series: [
      {
        name: 'Сумма платежей',
        type: 'line',
        data: chartData.value,
        // smooth: true,
        showSymbol: false,
        emphasis: {
          scale: true,
          itemStyle: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#888',
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#888',
            borderWidth: 3
          }
        },
        lineStyle: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#888',
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              {
                offset: 0,
                color: getComputedStyle(document.documentElement).getPropertyValue('--chart-area-top').trim() || '#888'
              },
              {
                offset: 1,
                color: getComputedStyle(document.documentElement).getPropertyValue('--chart-area-bottom').trim() || '#888'
              }
            ]
          },
        },
      },
    ],
    grid: {
      containLabel: true,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    emphasis: {
      disabled: true
    },
    textStyle: {
      fontFamily: getComputedStyle(document.documentElement).getPropertyValue('--ui-font-sans').trim() || 'sans-serif',
    }
  })
});



const isTracking = ref(false)
let pressTimer: any = null

const onTouchStart = (e: TouchEvent) => {
  pressTimer = setTimeout(() => {
    isTracking.value = true
    const rect = chartRef.value?.getDom().getBoundingClientRect();
    const touch = e.touches[0];
    chartRef.value?.dispatchAction({
      type: 'showTip',
      x: touch?.clientX - rect.left,
      y: touch?.clientY - rect.top,
    });
  }, 150)
}

const onTouchMove = (e: TouchEvent) => {
  if (!isTracking.value) {
    clearTimeout(pressTimer)
  } else {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement
    if (target) target.style.touchAction = 'none'
    const rect = chartRef.value?.getDom().getBoundingClientRect();
    const touch = e.touches[0];
    chartRef.value?.dispatchAction({
      type: 'showTip',
      x: touch?.clientX - rect.left,
      y: touch?.clientY - rect.top,
    });
  }
}

const onTouchEnd = (e: TouchEvent) => {
  clearTimeout(pressTimer)
  const target = e.currentTarget as HTMLElement
  if (target) target.style.touchAction = ''
  isTracking.value = false
  chartRef.value?.dispatchAction({ type: 'hideTip' })
  chartRef.value?.dispatchAction({
    type: 'updateAxisPointer',
    currTrigger: 'leave'
  })
}

</script>

<template>
  <UPageGrid
    class="flex-1 p-4 lg:max-h-[calc(100svh-var(--ui-header-height))] max-w-full xl:grid-cols-3 lg:grid-cols-[repeat(2,1fr)_1.5fr] md:grid-cols-1 sm:grid-cols-1 grid-rows-[auto_1fr] xl:gap-6 gap-4"
  >
    <UPageGrid class="grid-cols-3 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-3 lg:col-span-2 md:col-span-1 xl:gap-8 gap-4">
      <div
        v-for="(card, index) in cards"
        :key="index"
        v-bind="card"
        class="flex xl:flex-row lg:flex-col-reverse md:flex-row flex-col-reverse items-center rounded-lg ring ring-muted/70 xl:divide-x xl:divide-y-0 lg:divide-y lg:divide-y-reverse lg:divide-x-0 md:divide-x divide-y divide-y-reverse divide-muted/70 shadow-sm overflow-hidden"
      >
        <div class="flex flex-col xl:gap-1 lg:gap-0 gap-0 justify-center h-full w-full xl:p-6 lg:px-4 lg:py-2 md:p-4 px-2 py-1.5 bg-elevated/50">
          <h2 class="font-normal text-muted xl:text-xs lg:text-[0.65rem] md:text-xs text-[0.6rem]/2 uppercase">{{card.title}}</h2>
          <span class="font-medium text-highlighted xl:text-2xl lg:text-xl md:text-2xl text-lg/7">{{card.description}}</span>
        </div>
        <div class="flex justify-center items-center xl:h-full lg:h-auto md:h-full h-auto xl:w-auto lg:w-15 md:w-auto w-15 xl:p-6 lg:p-2 md:p-4 p-2 bg-default">
          <UIcon :name="card.iconName" class="text-primary size-full aspect-square" />
        </div>
      </div>
    </UPageGrid>
    <UPageCard
      variant="subtle"
      :ui="{
        root: 'ring-muted/70 h-full shadow-sm lg:row-span-2 md:row-span-1 md:col-span-1 pb-4',
        body: 'flex p-0!',
        container: 'p-0! h-full'
      }"
    >
      <UCalendar
        :model-value="calendar"
        @update:model-value="handleDateChange"
        variant="subtle"
        :month-controls="false"
        :year-controls="false"
        :ui="{
          root: 'flex flex-col gap-y-2 border-b border-default row-span-1',
          header: 'justify-start pt-4',
          heading: 'w-full mx-0 flex gap-x-3 items-center',
          body: 'flex-1 p-0',
          grid: 'flex flex-col space-y-0',
          gridBody: 'calendar h-full grid-rows-6 bg-default',
          gridRow: '[&:not(:last-child)]:border-b [&:not(:last-child)]:border-default',
          gridWeekDaysRow: 'p-0 m-0 border-b border-default',
          headCell: 'm-0.5 py-1 text-default font-medium xl:text-xs lg:text-[12px] text-center mb-0',
          cell: 'size-full',
          cellTrigger: 'size-full m-0 flex-col gap-y-1 rounded-none items-center justify-start px-2 py-1 cursor-pointer'
          // cellTrigger: 'size-full m-0 flex-col gap-y-1 rounded-none items-center justify-start px-2 py-1 cursor-pointer data-selected:font-semibold ' +
          // 'hover:not-data-selected:text-primary text-muted xl:text-xs lg:text-[12px] ' +
          // 'border border-transparent hover:not-data-selected:border-primary/50  ' +
          // 'data-outside-view:opacity-20',
        }"
      >
        <template #heading="{ value }">
          <div class="flex-1 flex gap-x-1 items-end ps-4">
            <span class="xl:text-2xl lg:text-lg md:text-xl text-muted/60">
              {{ value.match(/\d+/)?.[0] }},
            </span>
            <span class="xl:text-3xl lg:text-xl md:text-2xl capitalize">
              {{ value.match(/^\S+/)?.[0] }}
            </span>
            <UBadge color="primary" variant="subtle" class="place-self-start" size="sm" >
              {{
                new Intl.NumberFormat( locale, {
                  style: 'currency',
                  currency: currentCurrency ?? 'RUB',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                }).format(calendarData.totalSum)
              }}
            </UBadge>
          </div>
          <UFieldGroup>
            <UButton
              icon="i-lucide-chevron-left"
              color="neutral"
              variant="subtle"
              size="sm"
              class="h-max ring-transparent border border-accented"
              @click="calendar = calendar.subtract({ months: 1 })"
            />
            <UButton
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="subtle"
              size="sm"
              class="h-max rounded-e-none ring-transparent border border-accented border-e-0"
              @click="calendar = calendar.add({ months: 1 })"
            />
          </UFieldGroup>
        </template>
        <template #day="{ day }">
          {{ day.day }}
          <UFieldGroup orientation="vertical" class="flex-1 justify-center">
            <UBadge
              v-if="calendarData.totals.monthly[`${day.month - 1}-${day.day}`]"
              variant="subtle"
              color="success"
              size="sm"
            >
              {{
                new Intl.NumberFormat( locale, {
                    style: 'currency',
                    currency: currentCurrency ?? 'RUB',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }).format(calendarData.totals.monthly[`${day.month - 1}-${day.day}`])
              }}
            </UBadge>
            <UBadge
              v-if="calendarData.totals.yearly[`${day.month - 1}-${day.day}`]"
              variant="subtle"
              color="warning"
              size="sm"
            >
              {{
                new Intl.NumberFormat( locale, {
                  style: 'currency',
                  currency: currentCurrency ?? 'RUB',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                }).format(calendarData.totals.yearly[`${day.month - 1}-${day.day}`])
              }}
            </UBadge>
          </UFieldGroup>
        </template>
      </UCalendar>
    </UPageCard>
    <UPageCard
      variant="subtle"
      :ui="{
        root: 'ring-muted/70 shadow-sm lg:h-full lg:col-span-2 md:col-span-1 md:h-[70vh] h-[50vh]',
        container: 'md:p-4',
        wrapper: 'w-full',
        body: 'flex flex-col gap-y-8 w-full',
        title: 'flex gap-x-2 items-start',
        description: 'flex-1 w-full'
      }"
    >
      <template #title>
        <h2 class="text-2xl font-semibold">{{ $t('dashboard.chart.title') }}</h2>
        <UBadge size="sm" color="primary" variant="subtle">
          {{
            new Intl.NumberFormat( locale, {
              style: 'currency',
              currency: currentCurrency ?? 'RUB',
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            }).format(yearlyTotal)
          }}
        </UBadge>
      </template>
      <template #description>
        <ClientOnly>
          <div
            class="w-full h-full select-none"
            @touchstart="isMobile ? onTouchStart($event) : null"
            @touchmove="isMobile ? onTouchMove($event) : null"
            @touchend="isMobile ? onTouchEnd($event) : null"
            @touchcancel="isMobile ? onTouchEnd($event) : null"
          >
            <VChart
              ref="chartRef"
              class="w-full h-full"
              :option="chartSettings"
              :init-options="{ renderer: 'svg' }"
              autoresize
            >
              <template #tooltip="params">
                <div
                  class="flex flex-col items-center rounded-md ring ring-muted/70 bg-elevated/70 backdrop-blur-xs divide-y divide-muted/70 shadow-sm overflow-hidden"
                >
                  <span class="px-3 py-1 font-sans font-normal text-muted text-xs uppercase">{{ params[0].name }}</span>
                  <span class="px-3 pt-0.5 pb-1 font-sans font-medium text-primary text-base">{{
                    new Intl.NumberFormat(locale, {
                      style: 'currency',
                      currency: profile?.preferred_currency ?? 'RUB',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    }).format(params[0].value)
                  }}</span>
                </div>
              </template>
            </VChart>
          </div>
        </ClientOnly>
      </template>
    </UPageCard>
  </UPageGrid>
</template>

<style scoped>

</style>