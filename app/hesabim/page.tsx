'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Product, MockService } from '@/lib/mock-service';
import Link from 'next/link';

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [myProducts, setMyProducts] = useState<Product[]>([]);
    const [myRentals, setMyRentals] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'listings' | 'rentals'>('listings');

    useEffect(() => {
        // Client-side only
        const currentUser = MockService.getCurrentUser();
        if (!currentUser) {
            window.location.href = '/giris-yap';
            return;
        }
        setUser(currentUser);

        // Load data
        setMyProducts(MockService.getUserListings(currentUser.id));
        setMyRentals(MockService.getUserRentals(currentUser.id));
    }, []);

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Hesabım</h1>
                    <Link href="/ilan-ver" className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md shadow-green-100">
                        + Yeni İlan Ver
                    </Link>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex items-center space-x-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-primary text-3xl font-bold">
                        {user.fullName.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{user.fullName}</h2>
                        <p className="text-gray-500">{user.email}</p>
                        <div className="mt-2 flex gap-2">
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                                {user.role === 'admin' ? 'Yönetici' : 'Üye'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={async () => {
                            const { supabase } = await import('@/lib/supabase');
                            await supabase.auth.signOut();
                            window.location.href = '/';
                        }}
                        className="ml-auto flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition-colors px-4 py-2 hover:bg-red-50 rounded-lg"
                    >
                        <span>Çıkış Yap</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-6 border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`pb-4 px-2 font-bold text-lg transition-colors relative ${activeTab === 'listings' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        İlanlarım ({myProducts.length})
                        {activeTab === 'listings' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('rentals')}
                        className={`pb-4 px-2 font-bold text-lg transition-colors relative ${activeTab === 'rentals' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Kiraladıklarım ({myRentals.length})
                        {activeTab === 'rentals' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'listings' ? (
                    myProducts.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                            <div className="text-4xl mb-4">📦</div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Henüz ilan vermediniz</h3>
                            <p className="text-gray-500 mb-6">İlk ilanınızı oluşturarak kazanmaya başlayın.</p>
                            <Link href="/ilan-ver" className="text-primary font-bold hover:underline">Hemen İlan Ver</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myProducts.map((product) => (
                                <Link href={`/ilan/${product.id}`} key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 block h-full group">
                                    <div className="h-48 bg-gray-200 relative">
                                        {product.image ? (
                                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">Görsel Yok</div>
                                        )}
                                        <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-700">Aktif</span>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-1 text-gray-900 group-hover:text-primary transition-colors">{product.title}</h3>
                                        <p className="text-primary font-bold">{product.price} ₺ <span className="text-gray-400 font-normal text-xs">/ Gün</span></p>
                                        <div className="mt-3 flex justify-between items-center">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{product.category}</span>
                                            <span className="text-xs text-gray-400">Düzenle →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )
                ) : (
                    myRentals.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                            <div className="text-4xl mb-4">🛒</div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Henüz kiralama yapmadınız</h3>
                            <p className="text-gray-500 mb-6">İhtiyacınız olan ürünleri keşfetmeye başlayın.</p>
                            <Link href="/" className="text-primary font-bold hover:underline">Ürünleri Keşfet</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myRentals.map((rental) => (
                                <div key={rental.id} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">📄</div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{rental.title}</h3>
                                            <p className="text-sm text-gray-500">Tarih: {rental.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{rental.price} ₺</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${rental.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {rental.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>
            <Footer />
        </div>
    );
}
