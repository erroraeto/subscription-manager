import {serverSupabaseClient} from "#supabase/server";

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)

    const { data: {user}, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw createError({ status: 401, message: 'Unauthorized' })

    if (event.method === 'GET') {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        if (error) throw createError({ status: 500, message: 'Failed to load subscriptions' })
        return data
    }

    if (event.method === 'POST') {
        const body = await readBody(event)
        if (!body) throw createError({ statusCode: 400, message: 'Missing required fields' })
        const requiredFields = ['service', 'price', 'currency', 'period', 'next_billing_date']
        for (const field of requiredFields) {
            if (!body[field]) {
                throw createError({ statusCode: 400, message: `Поле ${field} обязательно` })
            }
        }

        const { data, error } = await supabase
            .from('subscriptions')
            .insert({
                service: body.service.trim(),
                price: Number(body.price),
                currency: body.currency.trim(),
                period: body.period.trim(),
                next_billing_date: body.next_billing_date,
                user_id: user.id,
            } as any)
            .select()
            .single()
        if (error) throw createError({ status: 500, message: 'Failed to create subscription' })
        return data
    }

    if (event.method === 'DELETE') {
        const body = await readBody(event)
        const { data, error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', body.id)
            .eq('user_id', user.id)
        if (error) throw createError({ status: 500, message: 'Failed to delete subscription' })
        return { success: true }
    }
})