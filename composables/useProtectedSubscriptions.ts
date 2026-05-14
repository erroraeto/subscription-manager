import router from "#app/plugins/router";
import type { Subscription } from '~/types'

export const useProtectedSubscriptions = () => {
    const subscriptions = ref<Subscription[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const baseUrl = '/api/protected/subscriptions'

    const fetchSubscriptions = async () => {
        isLoading.value = true
        error.value = null

        try {
            const data = await $fetch<Subscription[]>(baseUrl)
            subscriptions.value = data
        } catch (err: any) {
            error.value = err.data?.message || 'Error fetching subscriptions'
            if (err.status === 401) {
                navigateTo('/auth')
            }
        } finally {
            isLoading.value = false
        }
    }

    const addSubscription = async (data: Omit<Subscription, 'id'>) => {
        try {
            const response = await $fetch(baseUrl, {
                method: 'POST',
                body: data,
            })
            await fetchSubscriptions()
            return response
        } catch (err: any) {
            error.value = err.data?.message || 'Error adding Subscription'
            throw err
        }
    }

    const deleteSubscription = async (id: number) => {
        try {
            await $fetch(baseUrl, {
                method: 'DELETE',
                body: { id },
            })
            await fetchSubscriptions()
        } catch (err: any) {
            error.value = err.data?.message || 'Error deleting Subscription'
            throw err
        }
    }

    onMounted(() => {
        fetchSubscriptions()
    })

    return {
        subscriptions,
        isLoading,
        error,
        fetchSubscriptions,
        addSubscription,
        deleteSubscription
    }
}