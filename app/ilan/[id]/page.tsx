
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StarIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Image Gallery */}
                        <div className="bg-gray-200 h-96 md:h-auto min-h-[500px] relative">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                Görsel Alanı
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-8 md:p-12 flex flex-col h-full">
                            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                                <Link href="/" className="hover:text-primary">Anasayfa</Link>
                                <span>/</span>
                                <Link href="/kategori/elektronik" className="hover:text-primary">Elektronik</Link>
                                <span>/</span>
                                <span className="text-gray-800 font-medium">Kamera</span>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sony A7 III Kamera Seti</h1>

                            <div className="flex items-center space-x-4 mb-6">
                                <div className="flex text-yellow-500">
                                    <StarIcon className="h-5 w-5" />
                                    <StarIcon className="h-5 w-5" />
                                    <StarIcon className="h-5 w-5" />
                                    <StarIcon className="h-5 w-5" />
                                    <StarIcon className="h-5 w-5 text-gray-300" />
                                </div>
                                <span className="text-gray-500 text-sm">(12 Değerlendirme)</span>
                            </div>

                            <div className="prose prose-sm text-gray-600 mb-8">
                                <p>Profesyonel çekimleriniz için Sony A7 III seti. 24-70mm lens, 2 adet batarya ve taşıma çantası ile birlikte verilir. Temiz kullanılmış, sorunsuz.</p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Günlük Kiralama Bedeli</span>
                                    <span className="text-3xl font-bold text-primary">1.200 ₺</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                                    <span>Depozito: 5.000 ₺</span>
                                    <span>Min. Kiralama: 2 Gün</span>
                                </div>

                                <button className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg hover:bg-red-700 transition-transform hover:scale-[1.02] shadow-lg shadow-red-200">
                                    Hemen Kirala
                                </button>
                                <button className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                                    Satıcıya Soru Sor
                                </button>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-100 flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                                <div>
                                    <p className="font-bold text-gray-900">Ahmet Y.</p>
                                    <p className="text-xs text-gray-500">Üyelik Tarihi: 2023</p>
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
