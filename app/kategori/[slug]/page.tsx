
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

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
                                    <input type="number" placeholder="Min" className="w-full border rounded px-2 py-1 text-sm" />
                                    <input type="number" placeholder="Max" className="w-full border rounded px-2 py-1 text-sm" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-medium mb-2 text-sm text-gray-700">Durum</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2 text-sm text-gray-600">
                                        <input type="checkbox" className="text-primary focus:ring-primary" />
                                        <span>Sıfır</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm text-gray-600">
                                        <input type="checkbox" className="text-primary focus:ring-primary" />
                                        <span>İkinci El</span>
                                    </label>
                                </div>
                            </div>

                            <button className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                                Filtrele
                            </button>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-grow">
                        <h1 className="text-2xl font-bold mb-6 text-gray-800">{categoryName} Kategorisi</h1>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <div key={item} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                                    <div className="h-48 bg-gray-200 relative group-hover:opacity-90 transition-opacity">
                                        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">Yeni</span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">Ürün Başlığı {item}</h3>
                                            <span className="font-bold text-primary whitespace-nowrap">800 ₺</span>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">Bu ürün hakkında kısa bir açıklama. Özellikleri ve detayları burada yer alır.</p>

                                        <div className="flex justify-between items-center text-sm text-gray-400 border-t pt-3">
                                            <span>İstanbul / Kadıköy</span>
                                            <span>2 gün önce</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Daha Fazla Göster</button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
