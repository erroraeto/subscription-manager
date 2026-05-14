import { useProfile } from "~/composables/useProfile";

export const useLanguage = () => {
    const { locale, setLocale } = useI18n({ useScope: 'global' })
    const { profile, changeLanguage } = useProfile();

    const setLanguage = async (newLang: string) => {
        await setLocale(newLang as any);
        await changeLanguage({ language: newLang }).catch(console.error);
    }

    const syncLang = async () => {
        if (profile.value?.preferred_language) {
            await setLocale(profile.value.preferred_language as any);
        }
    }

    onMounted(() => {
        syncLang()
    })

    return {
        locale: locale,
        setLanguage
    };
}