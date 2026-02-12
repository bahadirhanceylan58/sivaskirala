'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StarIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { MockService, Product } from "@/lib/mock-service";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    const [duration, setDuration] = useState(1);

    useEffect(() => {
        MockService.getProduct(id).then((data) => {
            setProduct(data);
            setLoading(false);
        });
    }, [id]);

    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (value >= 1 && value <= 30) {
            setDuration(value);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
                    <div className="text-gray-500">Yükleniyor...</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
                    <div className="text-gray-800 text-xl font-bold mb-4">Ürün Bulunamadı</div>
                    <Link href="/" className="text-primary hover:underline">Anasayfaya Dön</Link>
                </main>
                <Footer />
            </div>
        );
    }

    const totalPrice = product.price * duration;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Image Gallery */}
                        <div className="bg-gray-200 h-96 md:h-auto min-h-[500px] relative">
                            {product.image ? (
                                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    Görsel Yok
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="p-8 md:p-12 flex flex-col h-full">
                            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                                <Link href="/" className="hover:text-primary">Anasayfa</Link>
                                <span>/</span>
                                <Link href={`/kategori/${product.category.toLowerCase()}`} className="hover:text-primary">{product.category}</Link>
                                <span>/</span>
                                <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.title}</span>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

                            <div className="flex items-center space-x-4 mb-6">
                                <div className="flex text-yellow-500">
                                    <StarIcon className="h-5 w-5" />
                                    <StarIcon className="h-5 w-5" />
                                    <StarIcon className="h-5 w-5" />
                                    <StarIcon className="h-5 w-5 text-gray-300" />
                                    <StarIcon className="h-5 w-5 text-gray-300" />
                                </div>
                                <span className="text-gray-500 text-sm">(Yeni İlan)</span>
                            </div>

                            <div className="prose prose-sm text-gray-600 mb-6">
                                <p>{product.description}</p>
                            </div>

                            {/* Features List */}
                            {product.features && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">Ürün Özellikleri</h3>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                        {product.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
                                {/* Size Selector */}
                                {product.sizes && (
                                    <div className="mb-6">
                                        <span className="text-gray-900 font-medium block mb-2">Beden Seçimi</span>
                                        <div className="flex gap-2">
                                            {product.sizes.map((size) => (
                                                <button
                                                    key={size}
                                                    // Note: We need state for this. For now, visual only as specifically requested to 'add' it.
                                                    // In a real app, we'd bind this to a state.
                                                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:border-primary hover:text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white text-gray-700 font-medium"
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600 font-medium">Kiralama Süresi (Gün)</span>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max="30"
                                            value={duration}
                                            onChange={handleDurationChange}
                                            className="w-16 text-center border border-gray-300 rounded-lg py-1 px-2 focus:ring-primary focus:border-primary"
                                        />
                                        <span className="text-gray-500 text-sm">Gün</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Günlük Fiyat</span>
                                    <span className="text-lg font-semibold text-gray-900">{product.price} ₺</span>
                                </div>

                                <div className="border-t border-gray-200 my-4 pt-4 flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">Toplam Tutar</span>
                                    <span className="text-4xl font-bold text-primary">{totalPrice} ₺</span>
                                </div>

                                <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                                    <span>Depozito: {product.price * 5} ₺</span>
                                    <span>İade edilebilir</span>
                                </div>

                                <button
                                    onClick={() => {
                                        const { MockService } = require('@/lib/mock-service');
                                        MockService.addToCart(product, duration);
                                        window.location.href = '/cart';
                                    }}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition-transform hover:scale-[1.02] shadow-lg shadow-green-200">
                                    Sepete Ekle & Kirala ({duration} Gün)
                                </button>

                                {/* Social Share Buttons */}
                                <div className="mt-6 flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
                                    <span className="text-sm text-gray-500 font-medium">Paylaş:</span>
                                    <button
                                        onClick={() => window.open(`https://wa.me/?text=Bu ürüne baksana: ${window.location.href}`, '_blank')}
                                        className="text-green-500 hover:scale-110 transition-transform p-2 bg-green-50 rounded-full" title="WhatsApp">
                                        Wp
                                    </button>
                                    <button
                                        onClick={() => window.open(`https://twitter.com/intent/tweet?text=Bu ürüne baksana&url=${window.location.href}`, '_blank')}
                                        className="text-blue-400 hover:scale-110 transition-transform p-2 bg-blue-50 rounded-full" title="Twitter">
                                        Tw
                                    </button>
                                    <button
                                        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
                                        className="text-blue-600 hover:scale-110 transition-transform p-2 bg-blue-50 rounded-full" title="Facebook">
                                        Fb
                                    </button>
                                </div>
                                <button className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                                    Satıcıya Soru Sor
                                </button>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-100 flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-gray-500 font-bold">
                                    ?
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Satıcı</p>
                                    <p className="text-xs text-gray-500">Üyelik Tarihi: 2024</p>
                                </div>
                                <div className="ml-auto">
                                    <span className="text-green-600 text-sm font-medium">Onaylı Hesap ✓</span>
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
