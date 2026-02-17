'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { auth } = await import('@/lib/firebase');
            const { signInWithEmailAndPassword } = await import('firebase/auth');

            // Attempt Firebase Login
            await signInWithEmailAndPassword(auth, email, password);

            window.location.href = '/'; // Redirect to home

        } catch (err: any) {
            console.error('Login error:', err);
            // Firebase error codes
            let message = err.message;
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                message = 'E-posta veya şifre hatalı.';
            } else if (err.code === 'auth/too-many-requests') {
                message = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow flex items-center justify-center py-12 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Tekrar Hoşgeldiniz</h1>
                        <p className="text-gray-500 text-sm mt-2">Hesabınıza giriş yapın</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">E-posta Adresi</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="ornek@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-secondary transition-all shadow-lg shadow-green-100 disabled:opacity-50"
                        >
                            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Hesabınız yok mu?{' '}
                        <Link href="/kayit-ol" className="text-primary font-bold hover:underline">
                            Hemen Kayıt Olun
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
