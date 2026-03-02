'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FavoriteButton from '@/components/FavoriteButton';
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

const CATEGORIES = [
    { value: '', label: 'Tümü', icon: '🔍' },
    { value: 'elektronik', label: 'Elektronik', icon: '💻' },
    { value: 'organizasyon', label: 'Organizasyon & Düğün', icon: '🎉' },
    { value: 'ses-goruntu', label: 'Ses & Görüntü', icon: '🔊' },
    { value: 'abiye-giyim', label: 'Abiye & Giyim', icon: '👗' },
    { value: 'kamera', label: 'Fotoğraf & Kamera', icon: '📸' },
    { value: 'kamp', label: 'Kamp & Outdoor', icon: '⛺' },
    { value: 'diger', label: 'Diğer', icon: '📦' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'En Yeni' },
    { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
    { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
    { value: 'name_asc', label: 'İsim: A-Z' },
];

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryParam = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') || '';

    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchText, setSearchText] = useState(queryParam);
    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'split' | 'list'>('split');

    // Fetch all active products once
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { db } = await import('@/lib/firebase');
                const { collection, getDocs, query, where } = await import('firebase/firestore');
                const q = query(collection(db, 'products'), where('status', '==', 'active'));
                const snap = await getDocs(q);
                const items: any[] = snap.docs.map(doc => {
                    const data = doc.data();
                    if (!data.lat) {
                        data.lat = 39.7505 + (Math.random() - 0.5) * 0.05;
                        data.lng = 37.0150 + (Math.random() - 0.5) * 0.05;
                    }
                    return { id: doc.id, ...data };
                });
                setAllProducts(items);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Client-side filter + sort
    const filtered = useCallback(() => {
        let items = [...allProducts];

        if (searchText.trim()) {
            const q = searchText.toLowerCase();
            items = items.filter(p =>
                p.title?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q)
            );
        }

        if (selectedCategory) {
            items = items.filter(p =>
                p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
                p.category?.toLowerCase().includes(selectedCategory.toLowerCase())
            );
        }

        if (minPrice) items = items.filter(p => p.price >= Number(minPrice));
        if (maxPrice) items = items.filter(p => p.price <= Number(maxPrice));

        // Sort
        if (sortBy === 'price_asc') items.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price_desc') items.sort((a, b) => b.price - a.price);
        else if (sortBy === 'name_asc') items.sort((a, b) => a.title?.localeCompare(b.title));
        else items.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

        return items;
    }, [allProducts, searchText, selectedCategory, minPrice, maxPrice, sortBy]);

    const products = filtered();
    const hasActiveFilters = searchText || selectedCategory || minPrice || maxPrice;

    const clearFilters = () => {
        setSearchText('');
        setSelectedCategory('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('newest');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {/* Search Bar + Controls */}
            <div className="bg-white border-b border-gray-200 sticky top-[88px] z-30 shadow-sm">
                <div className="container mx-auto px-4 py-3">
                    {/* Search + actions row */}
                    <div className="flex items-center gap-3">
                        {/* Search input */}
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                placeholder="Ürün, kategori veya marka ara..."
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-green-100 transition-all"
                            />
                            {searchText && (
                                <button onClick={() => setSearchText('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="hidden sm:block border border-gray-200 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:border-primary bg-white text-gray-700 cursor-pointer"
                        >
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>

                        {/* Toggle filters (mobile) */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters || hasActiveFilters ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-700 hover:border-primary'}`}
                        >
                            <AdjustmentsHorizontalIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Filtrele</span>
                            {hasActiveFilters && <span className="w-2 h-2 bg-white rounded-full" />}
                        </button>

                        {/* View toggle */}
                        <div className="hidden lg:flex border border-gray-200 rounded-xl overflow-hidden">
                            {(['split', 'list'] as const).map(mode => (
                                <button key={mode} onClick={() => setViewMode(mode)}
                                    className={`px-3 py-2.5 text-sm font-medium transition-colors ${viewMode === mode ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    {mode === 'split' ? '🗺️' : '☰'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filters panel */}
                    {showFilters && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                            {/* Category pills */}
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedCategory === cat.value ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'}`}>
                                        <span>{cat.icon}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Price + Sort row */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 font-medium">Fiyat (₺/gün):</span>
                                    <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                                        className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary" />
                                    <span className="text-gray-400">—</span>
                                    <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                                        className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary" />
                                </div>

                                {/* Sort on mobile */}
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                    className="sm:hidden border border-gray-200 rounded-lg text-xs px-2 py-1.5 focus:outline-none bg-white text-gray-700">
                                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>

                                {hasActiveFilters && (
                                    <button onClick={clearFilters} className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1">
                                        <XMarkIcon className="h-3.5 w-3.5" /> Filtreleri Temizle
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results count bar */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-4 py-2">
                    <p className="text-sm text-gray-500">
                        {loading ? 'Yükleniyor...' : (
                            <>
                                <span className="font-bold text-gray-800">{products.length}</span> ilan bulundu
                                {searchText && <> · "<span className="font-medium">{searchText}</span>" araması için</>}
                                {selectedCategory && <> · <span className="font-medium">{CATEGORIES.find(c => c.value === selectedCategory)?.label}</span> kategorisinde</>}
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-grow flex flex-col lg:flex-row" style={{ height: viewMode === 'split' ? 'calc(100vh - 200px)' : 'auto' }}>

                {/* Map — only in split mode on lg */}
                {viewMode === 'split' && (
                    <div className="hidden lg:block lg:w-[45%] h-full border-r border-gray-200 sticky top-[200px]">
                        <MapCluster products={products} />
                    </div>
                )}

                {/* Mobile map strip */}
                <div className="lg:hidden h-48 bg-gray-100 border-b border-gray-200">
                    <MapCluster products={products} />
                </div>

                {/* Product list */}
                <div className={`flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 ${viewMode === 'list' ? 'max-w-6xl mx-auto w-full' : ''}`}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-500 text-sm">İlanlar yükleniyor...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Sonuç bulunamadı</h3>
                            <p className="text-gray-500 text-sm mb-4">Farklı anahtar kelimeler veya filtreler deneyin.</p>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-primary font-bold hover:underline text-sm">
                                    Filtreleri Temizle
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'}`}>
                            {products.map(product => (
                                <div key={product.id} className="relative group">
                                    <div className="absolute top-2 right-2 z-20">
                                        <FavoriteButton
                                            productId={product.id}
                                            productData={{ title: product.title, price: product.price, image: product.image, category: product.category }}
                                            className="bg-white shadow-sm hover:bg-gray-50 border border-gray-100"
                                        />
                                    </div>
                                    <Link href={`/ilan/${product.id}`}
                                        className="block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 h-full">
                                        <div className="h-44 bg-white flex items-center justify-center p-3 border-b border-gray-100 overflow-hidden relative">
                                            {product.image ? (
                                                <img src={product.image} alt={product.title}
                                                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }} />
                                            ) : (
                                                <div className="text-gray-300 text-4xl">📦</div>
                                            )}
                                            <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur text-xs text-gray-600 font-medium px-2 py-0.5 rounded-full border border-gray-100">
                                                {product.category}
                                            </span>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                                                {product.title}
                                            </h3>
                                            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                                                <div>
                                                    <p className="text-xs text-gray-400">Günlük</p>
                                                    <p className="text-lg font-black text-gray-900">
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
            </div>

            <Footer />
        </div>
    );
}
