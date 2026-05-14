import { defineStore } from 'pinia'

export const useUserPreferences = defineStore('userPreferences', {
    state: () => ({
        language: 'ru' as string | null,
        theme: 'light',
        currency: 'RUB',
    }),
    actions: {
        setLanguage(newLanguage: string) {
            this.language = newLanguage
        },
        setTheme(newTheme: string) {
            this.theme = newTheme
        },
        setCurrency(newCurrency: string) {
            this.currency = newCurrency
        },
        loadFromServer( serverPrefs: { language?: string, theme?: string, currency?: string }) {
            if (serverPrefs.language) this.language = serverPrefs.language ?? this.language
            if (serverPrefs.theme) this.theme = serverPrefs.theme ?? this.theme
            if (serverPrefs.currency) this.currency = serverPrefs.currency ?? this.currency
        },
        saveToLocal() {
            localStorage.setItem('userPreferences', JSON.stringify({
                language: this.language,
                theme: this.theme,
                currency: this.currency,
            }))
        }
    }
})