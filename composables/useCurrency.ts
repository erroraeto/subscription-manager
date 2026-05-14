import { useProfile } from "~/composables/useProfile";

export const useCurrency = () => {
    const { profile, changeCurrency } = useProfile();
    const currentCurrency = useState<string>('user-currency', () => 'RUB');

    const setCurrency = (newCurrency: string) => {
        currentCurrency.value = newCurrency;
        changeCurrency({ currency: newCurrency }).catch(console.error);
    }

    const syncCurrency = () => {
        if (profile.value?.preferred_currency) {
            currentCurrency.value = profile.value.preferred_currency
        }
    }

    onMounted(() => {
        syncCurrency()
    })

    return { setCurrency, currentCurrency: readonly(currentCurrency) };
}