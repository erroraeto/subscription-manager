export const useProfile = () => {
    const profile = useState<{ username: string | null; avatar_url: string | null; preferred_language: string | null; preferred_theme: string | null; preferred_currency: string | null; notification: boolean | null } | null>('profile', () => null)
    const isLoading = useState<boolean>('profile-loading', () => false)
    const error = useState<string | null>('profile-error', () => null)

    const fetchProfile = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const data = await $fetch<{ username: string | null; avatar_url: string | null; preferred_language: string | null; preferred_theme: string | null; preferred_currency: string | null; notification: boolean | null } | null>('/api/profile/')
            profile.value = data
        } catch (err: any) {
            error.value = err.data?.message || 'Error fetching profile';
            if (err.response?.status === 401) {
                navigateTo('/auth')
            }
        } finally {
            isLoading.value = false;
        }
    }

    const changeAvatar = async (data: any) => {
        const formData = new FormData();
        formData.append('file', data);
        isLoading.value = true;
        error.value = null;

        try {
            const response = await $fetch('/api/profile/change-avatar', {
                method: 'PATCH',
                body: formData,
            })
            return response
        } catch (err: any) {
            error.value = err.data?.message || 'Error change avatar';
            return false
        } finally {
            isLoading.value = false;
        }
    }

    const changeName = async (data: any) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await $fetch('/api/profile/change-name', {
                method: 'PATCH',
                body: data,
            })
            return response
        } catch (err: any) {
            error.value = err.data?.message || 'Error change name';
            return false
        } finally {
            isLoading.value = false;
        }
    }

    const changeNotification = async (data: any) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await $fetch('/api/profile/switch-notification', {
                method: 'PATCH',
                body: data,
            })
            return response
        } catch (err: any) {
            error.value = err.data?.message || 'Error switch notification';
            return false
        } finally {
            isLoading.value = false;
        }
    }

    const changeCurrency = async (data: any) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await $fetch('/api/profile/change-currency', {
                method: 'PATCH',
                body: data,
            })
            return response
        } catch (err: any) {
            error.value = err.data?.message || 'Error change currency';
            return false
        } finally {
            isLoading.value = false;
        }
    }

    const changeLanguage = async (data: any) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await $fetch('/api/profile/change-language', {
                method: 'PATCH',
                body: data,
            })
            return response
        } catch (err: any) {
            error.value = err.data?.message || 'Error change language';
            return false
        } finally {
            isLoading.value = false;
        }
    }

    const changeTheme = async (data: any) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await $fetch('/api/profile/change-theme', {
                method: 'PATCH',
                body: data,
            })
            return response
        } catch (err: any) {
            error.value = err.data?.message || 'Error change theme';
            return false
        } finally {
            isLoading.value = false;
        }
    }

    const changeEmail = async (data: any) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await $fetch('/api/profile/change-email', {
                method: 'PATCH',
                body: data,
            })
            return response
        } catch (err: any) {
            error.value = err.data?.message || 'Error change email';
            return false
        } finally {
            isLoading.value = false;
        }
    }

    const changePassword = async (data: any) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await $fetch('/api/profile/change-password', {
                method: 'PATCH',
                body: data,
            })
            return response
        } catch (err: any) {
            error.value = err.data?.message || 'Error change password';
            return false
        } finally {
            isLoading.value = false;
        }
    }

    const deleteProfile = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await $fetch('/api/profile/delete-user', {
                method: 'POST'
            })
            return navigateTo('/auth')
        } catch (err: any) {
            error.value = err.data?.message || 'Error change password';
            return false
        } finally {
            isLoading.value = false;
        }
    }

    const user = useSupabaseUser();

    onMounted(() => {
        if (user.value) {
            fetchProfile()
        }
    })

    return {
        profile,
        isLoading,
        error,
        fetchProfile,
        changeAvatar,
        changeName,
        changeNotification,
        changeCurrency,
        changeLanguage,
        changeTheme,
        changeEmail,
        changePassword,
        deleteProfile
    }
}