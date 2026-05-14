import { useProfile } from "~/composables/useProfile";

export const useTheme = () => {
    const colorMode = useColorMode()
    const { profile, changeTheme } = useProfile();

    const setTheme = (newTheme: string) => {
        colorMode.preference = newTheme;
        changeTheme({ theme: newTheme }).catch(console.error);
    }

    const syncTheme = () => {
        if (profile.value?.preferred_theme) {
            colorMode.preference = profile.value.preferred_theme
        }
    }

    onMounted(() => {
        syncTheme()
    })

    return {setTheme, currentTheme: computed(() => colorMode.preference) };
}