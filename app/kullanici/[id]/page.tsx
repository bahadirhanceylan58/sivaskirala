'use client';

import { useEffect, useState, use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
    StarIcon,
    MapPinIcon,
    ChatBubbleLeftRightIcon,
    ShieldCheckIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/solid';
import FavoriteButton from '@/components/FavoriteButton';

interface SellerProfile {
    id: string;
    full_name: string;
    email: string;
    photoURL?: string;
    role?: string;
    created_at?: string;
    bio?: string;
    phone?: string;
}

export default function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [seller, setSeller] = useState<SellerProfile | null>(null);
    const [listings, setListings] = useState<{ id: string; title: string; price: number; image?: string; category: string }[]>([]);
    const [avgRating, setAvgRating] = useState<number>(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const { auth, db } = await import('@/lib/firebase');
                const { onAuthStateChanged } = await import('firebase/auth');
                const { doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');

                // Get current user
                onAuthStateChanged(auth, user => setCurrentUserId(user?.uid ?? null));

                // Fetch seller profile
                const userDoc = await getDoc(doc(db, 'users', id));
                if (!userDoc.exists()) { setLoading(false); return; }
                setSeller({ id: userDoc.id, ...userDoc.data() } as SellerProfile);

                // Fetch seller's active listings
                const listingsSnap = await getDocs(
                    query(collection(db, 'products'), where('ownerId', '==', id), where('status', '==', 'active'))
                );
                const products = listingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setListings(products);

                // Fetch reviews for seller's products
                const productIds = products.map(p => p.id);
                if (productIds.length > 0) {
                    // Firestore 'in' limit is 30 — safe for normal usage
                    const chunks = [];
                    for (let i = 0; i < productIds.length; i += 30) chunks.push(productIds.slice(i, i + 30));
                    let allRatings: number[] = [];
                    for (const chunk of chunks) {
                        const { getDocs: gd, query: q, collection: col, where: w } = await import('firebase/firestore');
                        const revSnap = await gd(q(col(db, 'reviews'), w('productId', 'in', chunk)));
                        revSnap.docs.forEach(d => { const data = d.data(); if (data.rating) allRatings.push(data.rating); });
                    }
                    setReviewCount(allRatings.length);
                    setAvgRating(allRatings.length ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const memberSince = seller?.created_at
        ? new Date(seller.created_at).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
        : '';

    if (loading) return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </main>
            <Footer />
        </div>
    );

    if (!seller) return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow flex items-center justify-center text-center p-8">
                <div>
                    <p className="text-5xl mb-4">🔍</p>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Kullanıcı bulunamadı</h2>
                    <Link href="/" className="text-primary font-bold hover:underline">Ana Sayfaya Dön</Link>
                </div>
            </main>
            <Footer />
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">

                {/* Profile Hero Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-green-700 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-green-200 flex-shrink-0">
                            {seller.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                <h1 className="text-2xl font-black text-gray-900">{seller.full_name}</h1>
                                {seller.role === 'admin' && (
                                    <span className="flex items-center gap-1 bg-green-50 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                                        <ShieldCheckIcon className="h-3.5 w-3.5" /> Doğrulandı
                                    </span>
                                )}
                            </div>

                            {/* Stats row */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500">
                                {avgRating > 0 && (
                                    <span className="flex items-center gap-1">
                                        <StarIcon className="h-4 w-4 text-yellow-400" />
                                        <strong className="text-gray-800">{avgRating.toFixed(1)}</strong>
                                        <span>({reviewCount} yorum)</span>
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                                    Sivas
                                </span>
                                {memberSince && (
                                    <span className="flex items-center gap-1">
                                        <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                                        {memberSince}&apos;den beri üye
                                    </span>
                                )}
                                <span className="flex items-center gap-1 font-medium text-gray-700">
                                    📦 {listings.length} aktif ilan
                                </span>
                            </div>

                            {seller.bio && (
                                <p className="text-gray-600 text-sm mt-3 max-w-xl">{seller.bio}</p>
                            )}
                        </div>

                        {/* Actions */}
                        {currentUserId && currentUserId !== id && (
                            <div className="flex-shrink-0">
                                <Link href={`/mesajlar?newTo=${id}`}
                                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-md shadow-green-100">
                                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                    Mesaj Gönder
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Listings */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                        📦 Aktif İlanlar
                        <span className="bg-gray-100 text-gray-600 text-sm font-semibold px-2.5 py-0.5 rounded-full">{listings.length}</span>
                    </h2>

                    {listings.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-4xl mb-3">📭</p>
                            <p className="text-gray-500 text-sm">Bu satıcının aktif ilanı yok.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {listings.map(product => (
                                <div key={product.id} className="relative group">
                                    <div className="absolute top-2 right-2 z-20">
                                        <FavoriteButton
                                            productId={product.id}
                                            productData={{ title: product.title, price: product.price, image: product.image, category: product.category }}
                                            className="bg-white shadow-sm hover:bg-gray-50 border border-gray-100"
                                        />
                                    </div>
                                    <Link href={`/ilan/${product.id}`}
                                        className="block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                                        <div className="h-48 bg-gray-50 border-b border-gray-100 overflow-hidden flex items-center justify-center p-3">
                                            {product.image
                                                ? <img src={product.image} alt={product.title}
                                                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }} />
                                                : <span className="text-4xl">📦</span>
                                            }
                                        </div>
                                        <div className="p-4">
                                            <span className="text-xs text-gray-400 font-medium">{product.category}</span>
                                            <h3 className="font-bold text-gray-900 line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">
                                                {product.title}
                                            </h3>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-400">Günlük</p>
                                                    <p className="text-xl font-black text-gray-900">
                                                        {product.price?.toLocaleString('tr-TR')} <span className="text-sm">₺</span>
                                                    </p>
                                                </div>
                                                <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                                                    Kirala
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
