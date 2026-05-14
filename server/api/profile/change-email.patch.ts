import {serverSupabaseClient, serverSupabaseUser} from "#supabase/server";
import {createClient} from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event);
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw createError({status: 401, message: 'Unauthorized'})

    const { email, password } = await readBody(event);

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password,
    })
    if ( signInError ) throw createError({status: 403, message: 'Invalid password'})

    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email: email,
        email_confirm: true,
    })
    if (updateError) throw createError({status: 500, message: updateError.message})

    return { success: true }
})