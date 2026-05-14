import {serverSupabaseClient, serverSupabaseUser} from "#supabase/server";

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event);
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw createError({status: 401, message: 'Unauthorized'})
    const { username } = await readBody(event);

    const { data, error } = await (supabase
        .from('profiles') as any)
        .update({ username: username.trim() } as any)
        .eq('id', user.id)
        .select()
    if (error) throw createError({ status: 500, message: 'Failed to update profile' });

    return data
})