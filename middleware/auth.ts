export default defineEventHandler( async (to) => {
    if (to.path === '/auth' || to.path === '/redirect') return
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return navigateTo('/auth')
    if (!session.user.email_confirmed_at && to.path !== '/auth?isWaiting=true') return navigateTo('/auth?isWaiting=true')
})