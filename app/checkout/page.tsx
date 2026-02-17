'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MockService } from "@/lib/mock-service";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function CheckoutPage() {
    const [step, setStep] = useState<'processing' | 'success'>('processing');

    useEffect(() => {
        const processCheckout = async () => {
            try {
                const { auth, db } = await import('@/lib/firebase');
                const { collection, addDoc } = await import('firebase/firestore');

                // 1. Get User
                const currentUser = auth.currentUser;

                if (!currentUser) {
                    alert('Ödeme yapabilmek için giriş yapmalısınız.');
                    window.location.href = '/giris-yap';
                    return;
                }

                // 2. Get Cart
                const cart = JSON.parse(localStorage.getItem('cart') || '[]');

                if (cart.length === 0) {
                    window.location.href = '/cart';
                    return;
                }

                // 3. Create Bookings in Firestore
                const bookingsRef = collection(db, "bookings");

                for (const item of cart) {
                    await addDoc(bookingsRef, {
                        product_id: item.id,
                        product_title: item.title, // Denormalize for easier display
                        product_image: item.image,
                        renter_id: currentUser.uid,
                        start_date: item.startDate,
                        end_date: item.end_date || item.endDate, // Handle both casing if needed
                        total_price: item.price * item.duration,
                        status: 'approved', // Auto-approve for now since payment is mocked
                        created_at: new Date().toISOString()
                    });
                }

                // 4. Success
                setTimeout(() => {
                    localStorage.removeItem('cart');
                    setStep('success');
                }, 2000);

            } catch (error: any) {
                console.error('Checkout error:', error);
                alert('Ödeme sırasında bir hata oluştu: ' + error.message);
                window.location.href = '/cart';
            }
        };

        processCheckout();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full text-center">
                    {step === 'processing' ? (
                        <div className="py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
                            <h2 className="text-xl font-bold text-gray-800">Ödeme İşleniyor...</h2>
                            <p className="text-gray-500 mt-2">Lütfen bekleyiniz, bankanızla iletişim kuruluyor.</p>
                        </div>
                    ) : (
                        <div className="py-8 animate-fade-in">
                            <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h2>
                            <p className="text-gray-600 mb-8">Siparişiniz alındı. Kiralama detayları e-posta adresinize gönderildi.</p>

                            <div className="space-y-3">
                                <Link href="/" className="block w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
                                    Alışverişe Devam Et
                                </Link>
                                <Link href="/hesabim" className="block w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                                    Siparişlerimi Gör
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
