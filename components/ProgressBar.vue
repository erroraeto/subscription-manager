<script setup lang="ts">
// Succes
// 12ce66

// Warning
// e7a23d

// Error
// ff4949
defineProps<{
  current: number
}>()
const max = ref(722.2)
const current = ref(722.2)
const percentage = ref(0)
const color = ref("")
const status = ref('process')

watch(current, () => {
  const hue = 120 * (percentage.value / 100);
  const saturation = 80 + 10 * Math.sin(percentage.value * Math.PI / 200);
  const lightness = 50;
  color.value = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
})
// const progressColor = computed(() => {
//   const hue = 120 * (percentage.value / 100);
//   const saturation = 80 + 10 * Math.sin(percentage.value * Math.PI / 200);
//   const lightness = 50;
//   color.value = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
// })

const setProgress = (e: Event) => {
  const target = e.currentTarget as HTMLInputElement
  const value = Number(target.value)
  current.value = max.value - value
  percentage.value = Math.round((value / max.value) * 100 )
  if (percentage.value >= 100) {
    status.value = 'success'
  } else {
    status.value = 'process'
  }
}

const simulateSuccess = () => {
  status.value = 'success'
}
</script>

<template>
  <svg class="progress-bar" viewBox="0 0 250 250">
    <circle r="115" cx="125" cy="125" fill="transparent" stroke="#f6f7fa" stroke-width="10"/>
    <circle class="progress-bar__line" r="115" cx="125" cy="125" :stroke="color" stroke-width="10" stroke-linecap="round"
            :stroke-dasharray="max"
            :stroke-dashoffset="current"
            fill="transparent"
            transform="rotate(-90 ) translate(-250 0)"/>
    <g>
      <text v-if="status == 'process'" x="125" y="125" fill="#828385" font-size="29px" dominant-baseline="middle" text-anchor="middle">{{ percentage }}%</text>
      <path v-else-if="status == 'error'" stroke="#ff4949" stroke-width="4" stroke-linecap="round" d="M107 107l36 36m0-36-36 36"/>
      <path v-else-if="status == 'warning'" fill="#e7a23d" d="M125 107c9.9411 0 18 8.0589 18 18 0 9.9411-8.0589 18-18 18-9.9411 0-18-8.0589-18-18 0-9.9411 8.0589-18 18-18zm0 24c-.5523 0-1 .4477-1 1 0 .5523.4477 1 1 1 .5523 0 1-.4477 1-1 0-.5523-.4477-1-1-1zm0-14c-.5523 0-1 .4477-1 1l0 0 0 10c0 .5523.4477 1 1 1 .5523 0 1-.4477 1-1l0 0 0-10c0-.5523-.4477-1-1-1z"/>
      <path v-else-if="status == 'success'" stroke="#12ce66" stroke-width="4" stroke-linecap="round" fill="none" d="M107 130l13 13 23-36"/>
    </g>
  </svg>

  <div>
    <label for="stroke-dashoffset">Stroke dashoffset</label><br>
    <input type="range" min="0" :max="max" value="0" id="stroke-dashoffset"
      @input="setProgress"/>
  </div>
  <div class="status-controls">
    <button class="status-btn status-btn--error" @click="status = 'error'">
      Имитация ошибки
    </button>
    <button class="status-btn status-btn--warning" @click="status = 'warning'">
      Имитация предупреждения
    </button>
    <button class="status-btn status-btn--success" @click="simulateSuccess">
      Имитация успеха
    </button>
  </div>
</template>

<style scoped>
.progress-bar {
  height: 250px;
  width: 250px;
}
.progress-bar__line {
  transition: all .3s ease;
}
</style>