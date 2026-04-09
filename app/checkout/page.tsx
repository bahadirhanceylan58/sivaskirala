'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircleIcon, ShieldCheckIcon, CalendarDaysIcon, PhoneIcon, UserIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";
import { getErrorMessage } from '@/lib/utils';

interface CartItem {
    cartId: string;
    id: string;
    title: string;
    price: number;
    image: string;
    duration: number;
    startDate: string;
    endDate: string;
    ownerId?: string;
}

export default function CheckoutPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');

    // Form fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        const cartData = JSON.parse(localStorage.getItem('sivas_cart') || '[]');
        if (cartData.length === 0) {
            window.location.href = '/cart';
            return;
        }
        setCart(cartData);

        // Giriş kontrolü
        const checkAuth = async () => {
            const { auth } = await import('@/lib/firebase');
            const { onAuthStateChanged } = await import('firebase/auth');
            onAuthStateChanged(auth, (user) => {
                if (!user) {
                    window.location.href = '/giris-yap?redirect=/checkout';
                }
            });
        };
        checkAuth();
    }, []);

    const calculateTotal = () => cart.reduce((t, i) => t + i.price * i.duration, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
            toast.error('Lütfen tüm zorunlu alanları doldurunuz.');
            return;
        }

        setStep('submitting');

        try {
            const { auth, db } = await import('@/lib/firebase');
            const { collection, addDoc, getDocs, query, where, doc, getDoc } = await import('firebase/firestore');
            const currentUser = auth.currentUser;

            // Auth durumu kontrolü — currentUser null ise oturumu yenilet
            if (!currentUser) {
                toast.error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
                window.location.href = '/giris-yap?redirect=/checkout';
                return;
            }

            // Tarih validasyonu
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            for (const item of cart) {
                if (!item.startDate || !item.endDate) {
                    toast.error(`"${item.title}" için tarih seçilmemiş.`);
                    setStep('form');
                    return;
                }
                const newStart = new Date(item.startDate);
                const newEnd = new Date(item.endDate);
                if (newStart < today) {
                    toast.error(`"${item.title}" için geçmiş tarih seçilemez.`);
                    setStep('form');
                    return;
                }
                if (newStart >= newEnd) {
                    toast.error(`"${item.title}" için başlangıç tarihi bitiş tarihinden önce olmalıdır.`);
                    setStep('form');
                    return;
                }
            }

            // Tarih çakışması kontrolü
            for (const item of cart) {
                const existingSnap = await getDocs(
                    query(
                        collection(db, 'bookings'),
                        where('productId', '==', item.id),
                        where('status', 'in', ['pending', 'approved'])
                    )
                );
                const newStart = new Date(item.startDate).getTime();
                const newEnd = new Date(item.endDate).getTime();
                const conflict = existingSnap.docs.some(d => {
                    const b = d.data();
                    const bStart = new Date(b.startDate).getTime();
                    const bEnd = new Date(b.endDate).getTime();
                    return newStart <= bEnd && newEnd >= bStart;
                });
                if (conflict) {
                    toast.error(`"${item.title}" ürünü seçilen tarihler için dolu. Lütfen farklı tarih seçin.`);
                    setStep('form');
                    return;
                }
            }

            for (const item of cart) {
                await addDoc(collection(db, 'bookings'), {
                    productId: item.id,
                    productTitle: item.title,
                    productImage: item.image,
                    renterId: currentUser.uid,
                    renterEmail: currentUser.email || null,
                    renterFirstName: firstName.trim(),
                    renterLastName: lastName.trim(),
                    renterPhone: phone.trim(),
                    renterNote: note.trim(),
                    ownerId: item.ownerId || null,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    duration: item.duration,
                    totalPrice: item.price * item.duration,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                });

                // Notify owner
                if (item.ownerId) {
                    await addDoc(collection(db, 'notifications'), {
                        userId: item.ownerId,
                        message: `"${item.title}" ilanınız için ${firstName} ${lastName} kişisinden kiralama talebi geldi.`,
                        type: 'order',
                        read: false,
                        created_at: new Date().toISOString(),
                        link: '/hesabim'
                    });

                    // E-posta bildirimi — ilan sahibine
                    try {
                        const ownerSnap = await getDoc(doc(db, 'users', item.ownerId));
                        const ownerEmail = ownerSnap.exists() ? ownerSnap.data().email : null;
                        if (ownerEmail) {
                            const { emailTemplates } = await import('@/lib/email-templates');
                            const tpl = emailTemplates.bookingRequest(
                                `${firstName} ${lastName}`,
                                item.title,
                                new Date(item.startDate).toLocaleDateString('tr-TR'),
                                new Date(item.endDate).toLocaleDateString('tr-TR'),
                                item.price * item.duration
                            );
                            await fetch('/api/send-email', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ to: ownerEmail, ...tpl }),
                            });
                        }
                    } catch (emailErr) {
                        console.warn('Rezervasyon e-postası gönderilemedi:', emailErr);
                    }
                }
            }

            localStorage.removeItem('sivas_cart');
            window.dispatchEvent(new Event('storage'));
            setStep('success');

        } catch (error) {
            console.error('Rezervasyon hatası:', error);
            toast.error('Bir hata oluştu: ' + getErrorMessage(error));
            setStep('form');
        }
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-md w-full text-center animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircleIcon className="h-12 w-12 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3">Talebiniz Alındı!</h2>
                        <p className="text-gray-500 mb-2">
                            Kiralama talebiniz ilan sahibine iletildi. En kısa sürede sizinle iletişime geçecekler.
                        </p>
                        <p className="text-sm text-gray-400 mb-8">
                            📞 <strong>{phone}</strong> numaralı telefon üzerinden aranacaksınız.
                        </p>
                        <div className="space-y-3">
                            <Link href="/" className="block w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
                                Anasayfaya Dön
                            </Link>
                            <Link href="/hesabim" className="block w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                                Taleplerim
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-2xl font-black text-gray-900 mb-8">Rezervasyon Talebi</h1>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Contact Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-primary" />
                                İletişim Bilgileri
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Ad <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        placeholder="Adınız"
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-green-100 outline-none transition-all text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Soyad <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        placeholder="Soyadınız"
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-green-100 outline-none transition-all text-gray-900"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        <PhoneIcon className="h-4 w-4 inline mr-1 text-gray-400" />
                                        Telefon Numarası <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="0555 123 45 67"
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-green-100 outline-none transition-all text-gray-900"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">İlan sahibi bu numara üzerinden sizi arayacak.</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Not (İsteğe Bağlı)
                                    </label>
                                    <textarea
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        placeholder="Teslim yeri, özel istek veya soru..."
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-green-100 outline-none transition-all text-gray-900 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rental Items Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                                <CalendarDaysIcon className="h-5 w-5 text-primary" />
                                Kiralama Detayları
                            </h2>
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.cartId} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                            {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{item.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {item.startDate ? new Date(item.startDate).toLocaleDateString('tr-TR') : '-'}
                                                {' → '}
                                                {item.endDate ? new Date(item.endDate).toLocaleDateString('tr-TR') : '-'}
                                                {' · '}{item.duration} gün
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-black text-primary">{(item.price * item.duration).toLocaleString('tr-TR')} ₺</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={step === 'submitting'}
                            className="w-full bg-primary text-white py-4 rounded-xl font-black text-lg hover:bg-green-700 transition-all hover:scale-[1.01] shadow-lg shadow-green-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {step === 'submitting' ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Gönderiliyor...
                                </span>
                            ) : '✅  Rezervasyon Talebini Gönder'}
                        </button>
                    </form>

                    {/* ORDER SUMMARY */}
                    <div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="font-bold text-gray-900 mb-5">Sipariş Özeti</h2>
                            <div className="space-y-3 text-sm mb-5">
                                <div className="flex justify-between text-gray-600">
                                    <span>Ara Toplam</span>
                                    <span>{calculateTotal().toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Hizmet Bedeli</span>
                                    <span className="text-green-600 font-medium">Ücretsiz</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-gray-900 text-lg">
                                    <span>Toplam</span>
                                    <span className="text-primary">{calculateTotal().toLocaleString('tr-TR')} ₺</span>
                                </div>
                            </div>

                            {/* Trust items */}
                            <div className="bg-green-50 rounded-xl p-4 space-y-2 mt-4">
                                <div className="flex items-center gap-2 text-xs text-green-800">
                                    <ShieldCheckIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                                    <span>Sivas Kirala güvencesiyle korumalı</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-green-800">
                                    <PhoneIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                                    <span>İlan sahibi 24 saat içinde arayacak</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
