import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Sivas Kirala <bildirim@sivaskirala.vercel.app>';

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function POST(req: NextRequest) {
    try {
        if (!RESEND_API_KEY) {
            console.warn('[Email] RESEND_API_KEY bulunamadı, e-posta gönderilmedi.');
            return NextResponse.json({ ok: false, reason: 'no_api_key' }, { status: 200 });
        }

        const body: EmailPayload = await req.json();
        const { to, subject, html } = body;

        if (!to || !subject || !html) {
            return NextResponse.json({ error: 'Eksik alan' }, { status: 400 });
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('[Email] Resend hatası:', err);
            return NextResponse.json({ error: err }, { status: 500 });
        }

        const data = await res.json();
        return NextResponse.json({ ok: true, id: data.id });
    } catch (error: any) {
        console.error('[Email] Sunucu hatası:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
