import {serverSupabaseClient, serverSupabaseUser} from "#supabase/server";

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event);
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw createError({status: 401, message: 'Unauthorized'})

    const { password, newPassword } = await readBody(event);

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password,
    })
    if ( signInError ) throw createError({status: 403, message: 'Invalid password'})

    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
    })
    if (updateError) throw createError({status: 500, message: updateError.message})

    return { success: true }
})