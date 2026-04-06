'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState, use } from "react";
// import { MockService, Product } from "@/lib/mock-service";

interface Product {
    id: string;
    title: string;
    price: number;
    image: string;
    category: string;
    description?: string;
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Slug → olası kategori değerleri (yeni slug + eski display name)
    const CATEGORY_MAP: Record<string, string[]> = {
        'elektronik':   ['elektronik', 'Elektronik'],
        'organizasyon': ['organizasyon', 'Organizasyon & Düğün', 'Organizasyon'],
        'ses-goruntu':  ['ses-goruntu', 'Ses & Görüntü', 'ses'],
        'abiye-giyim':  ['abiye-giyim', 'Abiye & Giyim', 'giyim'],
        'kamera':       ['kamera', 'Fotoğraf & Kamera'],
        'kamp':         ['kamp', 'Kamp & Outdoor'],
        'diger':        ['diger', 'Diğer'],
    };

    const CATEGORY_DISPLAY: Record<string, string> = {
        'elektronik': 'Elektronik',
        'organizasyon': 'Organizasyon & Düğün',
        'ses-goruntu': 'Ses & Görüntü',
        'abiye-giyim': 'Abiye & Giyim',
        'kamera': 'Fotoğraf & Kamera',
        'kamp': 'Kamp & Outdoor',
        'diger': 'Diğer',
    };

    const categoryDisplayName = CATEGORY_DISPLAY[slug] || (slug.charAt(0).toUpperCase() + slug.slice(1));

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            setLoading(true);
            try {
                const { db } = await import('@/lib/firebase');
                const { collection, getDocs, query, where } = await import('firebase/firestore');

                const searchValues = CATEGORY_MAP[slug] || [slug];

                // Firestore `in` operatörü max 30 değer destekler
                const q = query(
                    collection(db, "products"),
                    where("status", "==", "active"),
                    where("category", "in", searchValues)
                );
                const querySnapshot = await getDocs(q);

                const items: Product[] = [];
                querySnapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() } as Product);
                });

                setProducts(items);
            } catch (error) {
                console.error("Error fetching category products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryProducts();
    }, [slug]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-lg mb-4">Filtreler</h3>

                            <div className="mb-6">
                                <h4 className="font-medium mb-2 text-sm text-gray-700">Fiyat Aralığı</h4>
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Min" className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-primary" />
                                    <input type="number" placeholder="Max" className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-primary" />
                                </div>
                            </div>

                            <button className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                                Filtrele
                            </button>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-grow">
                        <h1 className="text-2xl font-bold mb-6 text-gray-800">{categoryDisplayName} Kategorisi</h1>

                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                                <p className="text-gray-500 mb-4">Bu kategoride henüz ilan bulunmuyor.</p>
                                <Link href="/ilan-ver" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors">
                                    İlk İlanı Sen Ver
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((item) => (
                                    <Link href={`/ilan/${item.id}`} key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group block h-full">
                                        <div className="h-48 bg-gray-200 relative">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">Görsel Yok</div>
                                            )}
                                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                                                {item.price} ₺
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="mb-2">
                                                <h3 className="font-bold text-lg text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                                            </div>
                                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">Kiralık {item.category} ürünü.</p>

                                            <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3">
                                                <span>Sivas / Merkez</span>
                                                <span className="text-primary font-medium">İncele →</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
