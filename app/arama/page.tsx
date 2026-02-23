'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Dynamically import MapCluster to avoid SSR issues with Leaflet
const MapCluster = dynamic(() => import('@/components/Map/MapCluster'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">Harita yükleniyor...</div>
});

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <SearchContent />
        </Suspense>
    );
}

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') || '';

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        category: categoryParam
    });

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { db } = await import('@/lib/firebase');
                const { collection, getDocs } = await import('firebase/firestore');

                const querySnapshot = await getDocs(collection(db, "products"));
                let items: any[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Mock location data if missing
                    if (!data.lat) {
                        data.lat = 39.7505 + (Math.random() - 0.5) * 0.05;
                        data.lng = 37.0150 + (Math.random() - 0.5) * 0.05;
                    }
                    items.push({ id: doc.id, ...data });
                });

                // Client-side filtering
                if (query) {
                    const lowerQuery = query.toLowerCase();
                    items = items.filter(p =>
                        p.title.toLowerCase().includes(lowerQuery) ||
                        p.description.toLowerCase().includes(lowerQuery)
                    );
                }

                if (filters.category) {
                    items = items.filter(p => p.category === filters.category);
                }

                if (filters.minPrice) {
                    items = items.filter(p => p.price >= Number(filters.minPrice));
                }

                if (filters.maxPrice) {
                    items = items.filter(p => p.price <= Number(filters.maxPrice));
                }

                setProducts(items);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [query, filters]);

    const categories = [
        { id: 'elektronik', name: 'Elektronik' },
        { id: 'giyim', name: 'Giyim & Aksesuar' },
        { id: 'kamp', name: 'Kamp & Outdoor' },
        { id: 'organizasyon', name: 'Organizasyon' },
        { id: 'spor', name: 'Spor' },
        { id: 'diger', name: 'Diğer' }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <div className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-140px)]">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto z-10">
                    <h2 className="text-xl font-bold mb-6">Filtrele</h2>

                    <div className="space-y-6">
                        {/* Categories */}
                        <div>
                            <h3 className="font-bold text-gray-700 mb-3">Kategori</h3>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={filters.category === ''}
                                        onChange={() => setFilters({ ...filters, category: '' })}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm">Tümü</span>
                                </label>
                                {categories.map(cat => (
                                    <label key={cat.id} className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={filters.category === cat.id}
                                            onChange={() => setFilters({ ...filters, category: cat.id })}
                                            className="text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h3 className="font-bold text-gray-700 mb-3">Fiyat Aralığı (Günlük)</h3>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col relative">
                    {/* Map View */}
                    <div className="h-[50vh] lg:h-1/2 w-full bg-gray-100 border-b border-gray-200">
                        <MapCluster products={products} />
                    </div>

                    {/* Product List */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        <h2 className="font-bold text-gray-800 mb-4">{products.length} Sonuç Bulundu</h2>

                        {loading ? (
                            <div className="text-center py-10">Yükleniyor...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                Aradığınız kriterlere uygun ilan bulunamadı.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {products.map((product) => (
                                    <Link key={product.id} href={`/ilan/${product.id}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                                        <div className="h-40 bg-gray-100 relative">
                                            {product.image ? (
                                                <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">Görsel Yok</div>
                                            )}
                                            <span className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-900 shadow-sm">
                                                {product.city || 'Sivas Merkez'}
                                            </span>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 truncate mb-1">{product.title}</h3>
                                            <p className="text-primary font-bold">{product.price} ₺ <span className="text-xs text-gray-400 font-normal">/ Gün</span></p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
