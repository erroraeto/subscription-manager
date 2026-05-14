import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler( async (event) => {
    if (event.path?.startsWith("/api/protected")) {
        const supabase = await serverSupabaseClient(event)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw createError({
            status: 401,
            message: 'Access Denied'
        })

        event.context.uset = user
    }
})