import {cachedEventHandler} from "#imports";

export default cachedEventHandler(async (event) => {
    const url = 'https://api.frankfurter.dev/v2/rates?base=USD&quotes=RUB,EUR';
    try {
        const data: any = await $fetch(url)
        const rates: Record<string, number> = {};
        data.forEach((r: any) => {
            rates[r.quote] = r.rate;
        })
        return rates
    } catch (error: any) {
        if (error) throw createError({status: error.statusCode, message: error.message})
    }
}, {
    maxAge: 60 * 60 * 24,
    swr: true,
})