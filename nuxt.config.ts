export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    devServer: {
        host: '0.0.0.0'
    },
    modules: [
      '@nuxtjs/supabase',
      '@nuxt/ui',
      '@nuxtjs/i18n',
      'nuxt-echarts',
      '@pinia/nuxt',
    ],
    css: ['~/assets/css/main.css'],
    ui: {
    },
    icon: {
        customCollections: [
            {
                prefix: 'custom',
                dir: './assets/icons',
                normalizeIconName: false,
            },
        ],
        clientBundle: {
            scan: true,
            includeCustomCollections: true,
        },
    },
    supabase: {
        redirect: false,
        cookieOptions: {
            sameSite: 'lax',   // или 'none' (тогда нужно secure: true)
            secure: false,     // только для разработки по HTTP
        }
    },
    i18n: {
        defaultLocale: 'ru',
        locales: [
            { code: 'en', name: 'English', file: 'en.json' },
            { code: 'ru', name: 'Russian', file: 'ru.json' }
        ],
    },
    echarts: {
        renderer: ['svg', 'canvas'],
        charts: ['BarChart', 'LineChart'],
        components: ['DatasetComponent', 'GridComponent', 'TooltipComponent'],
        features: ['LabelLayout', 'UniversalTransition']
    },
})