import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event);
    const {data: {user}, error: authError} = await supabase.auth.getUser()
    if (authError || !user) throw createError({status: 401, message: 'Unauthorized'})

    const {data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
    if (error) throw createError({status: 500, message: 'Database error'});
    return data ?? {username: null, avatar_url: null};
});