import { serverSupabaseClient } from "#supabase/server";
import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw createError({status: 401, message: 'Unauthorized'})

    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (error) throw createError({status: 500, message: error.message})

    return { success: true }
})