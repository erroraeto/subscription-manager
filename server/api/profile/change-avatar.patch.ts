import {serverSupabaseClient, serverSupabaseUser} from "#supabase/server";

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event);
    const { data: { user }, error: authError} = await supabase.auth.getUser()
    if (authError || !user) throw createError({status: 401, message: 'Unauthorized'})

    const body = await readMultipartFormData(event);
    if (!body) throw createError({ status: 400, message: 'No File uploaded' });
    const file = body.find(item => item.name === 'file');
    if (!file) throw createError({ status: 400, message: 'File not found' });
    const { filename, type, data } = file

    const fileExt = filename?.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, data, { contentType: type });
    if (uploadError) throw createError({ status: 500, message: 'Upload error' });

    const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .maybeSingle<any>();
    let oldPath: string | null = null;
    if (!profileErr && profile?.avatar_url) {
        const url = new URL(profile?.avatar_url);
        oldPath = url.pathname.split('/').slice(-2).join('/');
    }
    if (oldPath) {
        const { error } = await supabase.storage
            .from('avatars')
            .remove([oldPath.trim()]);
        if (error) throw createError({ status: 500, message: 'Delete old avatar error' });
    }

    const { data: { publicUrl } } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    if (!publicUrl) throw createError({ status: 400, message: 'Get path error' });

    const { data: newPath, error } = await (supabase
        .from('profiles') as any)
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
        .select()

    if (error) throw createError({ status: 500, message: 'Failed to update profile' });
    return newPath
})