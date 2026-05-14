import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const translations = {
    ru: {
        subject: 'Предстоящий платёж сегодня',
        details: 'Сегодня ожидаются списания:',
        totalDue: 'Итого к оплате',
        viewLink: 'Все подписки',
        footer: `Вы получили это письмо, потому что у вас есть активные подписки на сервисе SubManager.<br>
            Чтобы отключить уведомления, измените настройки в личном кабинете.`,
    },
    en: {
        subject: "Today's payment reminder",
        details: "Today's expected payments:",
        totalDue: 'Total due',
        viewLink: 'All subscriptions',
        footer: `You have received this email because you have active subscriptions to the SubManager service.<br>
            To disable notifications, change the settings in your personal account.`,
    },
};

function getTranslation(lang: string, key: string, ...args: any[]) {
    const t = translations[lang] || translations.en;
    if (typeof t[key] === 'function') return t[key](...args);
    return t[key] || '';
}

serve(async (req: any) => {
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${Deno.env.get('MY_REMINDER_TOKEN')}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing environment variables');
        return new Response('Server misconfigured', { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const today = new Date().toISOString().split('T')[0];

    const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('id, service, price, currency, period, user_id, profiles(email, preferred_currency, preferred_language, notification)')
        .eq('next_billing_date', today);

    if (subsError || !subscriptions.length) {
        console.error('Error fetching subscriptions:', subsError);
        return new Response('Database error', { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
        console.log('No subscriptions due today')
        return new Response('No reminders sent', { status: 200 })
    }

    const resRates = await fetch('https://api.frankfurter.dev/v2/rates?base=USD&quotes=RUB,EUR') as any;
    if (!resRates.ok) {
        console.log('Rates load failed');
        return new Response('The course is not loaded', { status: resRates.status })
    }
    const ratesRaw = await resRates.json()
    const rates: Record<string, number> = {};
    ratesRaw.forEach((r: any) => {
        rates[r.quote] = r.rate;
    })

    const profiles = new Map();
    for (const sub of subscriptions) {
        if (!sub.profiles?.notification) continue
        const email = sub.profiles?.email;
        const currency = sub.profiles?.preferred_currency
        if (!email || !currency) continue;

        let converted = sub.price;
        if (sub.currency !== currency) {
            const fromRate = rates[sub.currency] ?? 1;
            const toRate = rates[currency] ?? 1;
            converted = sub.price * (toRate / fromRate);
        }
        if (profiles.has(email)) {
            profiles.get(email)[0] += converted;
            profiles.get(email)[1].push(sub);
        } else {
            profiles.set(email, [converted, [sub]])
        }
    }

    const result = await Promise.allSettled([...profiles].map(async ([email, [amount, subs]]) => {
        const subsHtml = subs.map((sub: any) => `
            <li style="margin:0 0 10px; padding: 5px 10px; font-family: monospace; font-size: 16px; list-style-type: none; background: #f7f9fc; border-radius:8px; border:2px solid #e8ecf3;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td align="left">${sub.service}</td>
                        <td align="right" style="font-weight: 600;color:#314158">= ${sub.price} ${sub.currency}</td>
                    </tr>
                </table>
            </li>
        `).join('');
        const t = (key: string, ...args: any[]) => getTranslation(subs[0].profiles.preferred_language, key, ...args);
        console.log('create message')
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'SubManager <onboarding@resend.dev>',
                to: email,
                subject: t('subject'),
                html: `
                    <body style="margin:0; padding:20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:600px; margin:0 auto; color:#6d829f;">
                            <tr>
                                <td align="center" style="padding:0 15px;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border:2px solid #e8ecf3; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                                        <tr>
                                            <td style="padding:30px 30px 10px; border-bottom:2px solid #e8ecf3;">
                                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                    <tr>
                                                        <td style="padding-bottom: 10px;">
                                                            <img alt="SubManager Logo" src="https://rpagljzjtofavbdgkkzt.supabase.co/storage/v1/object/sign/img/SubManager-Logo_gimp.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wODU2MDJmOC01NDgyLTQ5MTQtYmFkMC1jMDg4NDZlMThjODciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvU3ViTWFuYWdlci1Mb2dvX2dpbXAucG5nIiwiaWF0IjoxNzc4NjEzOTEwLCJleHAiOjMzNTU0MTM5MTB9.ltvbnzSNR5uYqpcQGFxjujcPu186bZSY-iHhwTl7uWw" style="display:block; width:80%; height:auto; outline:none; border:none; text-decoration:none;" width="160" />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td align="right" style="font-family: monospace; font-size:14px;">
                                                            ${today}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding:30px;  border-bottom:2px solid #e8ecf3;">
                                                <h2 style="font-family: Monospace; font-size: 20px; font-weight: 400; margin:0 0 10px;">${t('details')}</h2>
                                                <ul style="list-style-type: none;">
                                                    ${subsHtml}
                                                </ul>
                                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 30px; padding:5px 10px; background: #f7f9fc; border-radius:8px; border:2px solid #e8ecf3;">
                                                    <tr>
                                                        <td style="font-family: monospace; font-size:18px;">${t('totalDue')}</td>
                                                        <td align="right" style="color:#314158; font-family: monospace; font-size:18px; font-weight: 600;">= ${amount.toFixed(2)} ${subs[0].profiles.preferred_currency}</td>
                                                    </tr>
                                                </table>
                                                <table cellpadding="0" cellspacing="0" border="0" align="center">
                                                    <tr>
                                                        <td style="border-radius:12px;">
                                                            <a href='http://localhost:3000/tasks?today=${today}' style="display:inline-block; padding:6px 10px; font-size:15px; font-weight:600; color:#2b7fff; text-decoration:none; background:#e2edfc; border-radius:12px; border:#b4d2fe 1px solid;">${t('viewLink')}</a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding:10px 30px 18px 30px; background:#f8fafc; border-radius:0 0 12px 12px;">
                                                <p style="font-size:12px; color:#64748b; text-align:center;">${t('footer')}</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                `,
            }),
        })

        if (!res.ok) throw new Error(await res.text());
        return email;
    }))

    return new Response(
        JSON.stringify({
            message: 'Processed',
            result
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }
    );
});