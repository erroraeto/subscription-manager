export const convertCurrency = (amount: number, from: string, to: string, rates: any): number => {
    if (from === to) return amount;
    const fromRate = rates[from] ?? 1;
    const toRate = rates[to] ?? 1;
    return amount * (toRate / fromRate);
}