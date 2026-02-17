'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { auth } = await import('@/lib/firebase');
            const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
            const { getFirestore, doc, setDoc } = await import('firebase/firestore');

            // 1. Create User in Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Auth Profile (Display Name)
            await updateProfile(user, {
                displayName: fullName
            });

            // 3. Create User Document in Firestore
            const db = getFirestore();
            await setDoc(doc(db, "users", user.uid), {
                email: email,
                full_name: fullName,
                role: 'user',
                created_at: new Date().toISOString()
            });

            alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
            window.location.href = '/giris-yap';

        } catch (err: any) {
            console.error('Register error:', err);
            // Firebase error codes
            let message = err.message;
            if (err.code === 'auth/email-already-in-use') {
                message = 'Bu e-posta adresi zaten kullanımda.';
            } else if (err.code === 'auth/weak-password') {
                message = 'Şifre çok zayıf (en az 6 karakter).';
            } else if (err.code === 'auth/invalid-email') {
                message = 'Geçersiz e-posta adresi.';
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
                        <h1 className="text-2xl font-bold text-gray-900">Aramıza Katılın</h1>
                        <p className="text-gray-500 text-sm mt-2">Sivas'ın en büyük kiralama ailesi</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="Adınız Soyadınız"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

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
                            {loading ? 'Hesap Oluşturuluyor...' : 'Ücretsiz Kayıt Ol'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Zaten hesabınız var mı?{' '}
                        <Link href="/giris-yap" className="text-primary font-bold hover:underline">
                            Giriş Yap
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
