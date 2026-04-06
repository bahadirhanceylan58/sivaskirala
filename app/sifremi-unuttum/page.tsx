'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { auth } = await import('@/lib/firebase');
            const { sendPasswordResetEmail } = await import('firebase/auth');
            await sendPasswordResetEmail(auth, email.trim());
            setSent(true);
        } catch (err) {
            const { code } = err as { code?: string };
            if (code === 'auth/user-not-found') {
                setError('Bu e-posta ile kayıtlı hesap bulunamadı.');
            } else if (code === 'auth/invalid-email') {
                setError('Geçersiz e-posta adresi.');
            } else {
                setError('Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow flex items-center justify-center py-12 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
                    {sent ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircleIcon className="h-9 w-9 text-green-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">E-posta Gönderildi</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderildi.
                                Gelen kutunuzu ve spam klasörünüzü kontrol edin.
                            </p>
                            <Link href="/giris-yap" className="block w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors text-center">
                                Giriş Sayfasına Dön
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <EnvelopeIcon className="h-7 w-7 text-primary" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Şifremi Unuttum</h1>
                                <p className="text-gray-500 text-sm mt-2">
                                    Kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">E-posta Adresi</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="ornek@mail.com"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-100 disabled:opacity-50"
                                >
                                    {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                                </button>
                            </form>

                            <div className="mt-6 text-center text-sm text-gray-500">
                                <Link href="/giris-yap" className="text-primary font-bold hover:underline">
                                    ← Giriş Sayfasına Dön
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
