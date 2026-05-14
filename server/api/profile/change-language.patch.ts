import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) throw createError({status: 401, message: 'Unauthorized'});
    const {language} = await readBody(event)

    const { data, error } = await (supabase
        .from('profiles')as any)
        .update({ preferred_language: language.trim() } as any)
        .eq('id', user.id)
        .select()
    if (error) throw createError({status: 500, message: 'Failed to update language'});

    return data;
})