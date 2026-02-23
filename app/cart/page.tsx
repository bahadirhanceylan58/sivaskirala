'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
// import { MockService, Product } from "@/lib/mock-service";
import { TrashIcon } from "@heroicons/react/24/outline";

interface Product {
    id: string;
    title: string;
    price: number;
    image: string;
    category: string;
    description?: string;
}

interface CartItem extends Product {
    duration: number;
    cartId: string;
}

export default function CartPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCart = () => {
            if (typeof window !== 'undefined') {
                const cartData = JSON.parse(localStorage.getItem('sivas_cart') || '[]');
                setCart(cartData);
                setLoading(false); // Set loading to false after cart is loaded
            }
        };

        loadCart();

        // Listen for storage events
        window.addEventListener('storage', loadCart);
        return () => window.removeEventListener('storage', loadCart);
    }, []);

    const removeFromCart = (cartId: string) => {
        if (typeof window !== 'undefined') {
            const currentCart = JSON.parse(localStorage.getItem('sivas_cart') || '[]');
            const newCart = currentCart.filter((item: any) => item.cartId !== cartId);
            localStorage.setItem('sivas_cart', JSON.stringify(newCart));
            window.dispatchEvent(new Event('storage'));
            setCart(newCart);
        }
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.duration), 0);
    };

    if (loading) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Sepetim ({cart.length} Ürün)</h1>

                {cart.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Sepetiniz Boş</h2>
                        <p className="text-gray-500 mb-6">Henüz kiralayacak bir ürün eklemediniz.</p>
                        <Link href="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-transform hover:scale-105">
                            Ürünleri Keşfet
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items */}
                        <div className="flex-grow space-y-4">
                            {cart.map((item) => (
                                <div key={item.cartId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Görsel Yok</div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                                            <button
                                                onClick={() => removeFromCart(item.cartId)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                                        <div className="flex flex-wrap gap-4 text-sm mt-2">
                                            <div className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                                                <span className="text-gray-500">Günlük:</span> <span className="font-bold text-gray-800">{item.price} ₺</span>
                                            </div>
                                            <div className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                                                <span className="text-gray-500">Süre:</span> <span className="font-bold text-primary">{item.duration} Gün</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-end items-end min-w-[100px]">
                                        <span className="text-xs text-gray-500">Toplam</span>
                                        <span className="text-xl font-bold text-primary">{item.price * item.duration} ₺</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="lg:w-96 flex-shrink-0">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Sipariş Özeti</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Ara Toplam</span>
                                        <span>{calculateTotal()} ₺</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Hizmet Bedeli</span>
                                        <span>0 ₺</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-bold text-gray-900">
                                        <span>Toplam</span>
                                        <span className="text-primary">{calculateTotal()} ₺</span>
                                    </div>
                                </div>

                                <Link href="/checkout" className="block w-full bg-primary text-white text-center py-4 rounded-xl font-bold hover:bg-green-700 transition-transform hover:scale-[1.02] shadow-lg shadow-green-200">
                                    Ödemeye Geç
                                </Link>

                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                                    <span>🔒 Güvenli Ödeme</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
