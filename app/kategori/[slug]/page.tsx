'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { MockService, Product } from "@/lib/mock-service";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

    useEffect(() => {
        setLoading(true);
        MockService.getProducts().then((allProducts) => {
            // Simple keyword matching for demo purposes
            // In a real app, this would be a DB query
            const filtered = allProducts.filter(p =>
                p.category.toLowerCase().includes(slug.toLowerCase()) ||
                slug.toLowerCase().includes(p.category.toLowerCase().split(' ')[0])
            );
            setProducts(filtered);
            setLoading(false);
        });
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
                        <h1 className="text-2xl font-bold mb-6 text-gray-800">{categoryName} Kategorisi</h1>

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
