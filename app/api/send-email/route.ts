import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Sivas Kirala <bildirim@sivaskirala.com>';
const ALLOWED_ORIGIN = 'https://sivaskirala.vercel.app';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function POST(req: NextRequest) {
    try {
        // Origin kontrolü — sadece kendi domain'imizden gelen isteklere izin ver
        if (process.env.NODE_ENV === 'production') {
            const origin = req.headers.get('origin');
            if (origin !== ALLOWED_ORIGIN) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        if (!RESEND_API_KEY) {
            console.warn('[Email] RESEND_API_KEY bulunamadı, e-posta gönderilmedi.');
            return NextResponse.json({ ok: false, reason: 'no_api_key' }, { status: 200 });
        }

        const body: EmailPayload = await req.json();
        const { to, subject, html } = body;

        if (!to || !subject || !html) {
            return NextResponse.json({ error: 'Eksik alan' }, { status: 400 });
        }

        // E-posta format validasyonu
        if (!EMAIL_REGEX.test(to)) {
            return NextResponse.json({ error: 'Geçersiz e-posta adresi' }, { status: 400 });
        }

        // Subject ve HTML boyut sınırı
        if (subject.length > 200 || html.length > 100_000) {
            return NextResponse.json({ error: 'İçerik çok büyük' }, { status: 400 });
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
    } catch (error) {
        const msg = getErrorMessage(error);
        console.error('[Email] Sunucu hatası:', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
