'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Product } from '@/lib/mock-service';
import Link from 'next/link';

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [myProducts, setMyProducts] = useState<Product[]>([]);

    useEffect(() => {
        // Client-side only
        import('@/lib/mock-service').then(({ MockService }) => {
            const currentUser = MockService.getCurrentUser();
            if (!currentUser) {
                window.location.href = '/giris-yap';
                return;
            }
            setUser(currentUser);

            // Load products
            const allProducts = JSON.parse(localStorage.getItem('sivas_products') || '[]');
            const userProducts = allProducts.filter((p: Product) => p.ownerId === currentUser.id);
            setMyProducts(userProducts);
        });
    }, []);

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Hesabım</h1>
                    <Link href="/ilan-ver" className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors">
                        + Yeni İlan
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                            {user.fullName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{user.fullName}</h2>
                            <p className="text-gray-500">{user.email}</p>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-4">İlanlarım</h2>
                {myProducts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <p className="text-gray-500 mb-4">Henüz hiç ilan vermediniz.</p>
                        <Link href="/ilan-ver" className="text-primary font-bold hover:underline">İlk ilanınızı verin</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {myProducts.map((product) => (
                            <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="h-48 bg-gray-200 relative">
                                    {/* Image Placeholder or Real if blob */}
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        {product.image ? 'Fotoğraf Var' : 'Fotoğraf Yok'}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-1">{product.title}</h3>
                                    <p className="text-primary font-bold">{product.price} ₺ / Gün</p>
                                    <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {product.category}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
