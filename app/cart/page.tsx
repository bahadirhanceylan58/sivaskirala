
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function CartPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-8 text-gray-800">Alışveriş Sepetim</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-grow bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        {[1, 2].map((item) => (
                            <div key={item} className="flex flex-col sm:flex-row items-center gap-4 py-6 border-b border-gray-100 last:border-0">
                                <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>

                                <div className="flex-grow text-center sm:text-left">
                                    <h3 className="font-bold text-gray-800 mb-1">Kiralık Ürün {item}</h3>
                                    <p className="text-sm text-gray-500 mb-2">Kiralama Süresi: 3 Gün</p>
                                    <span className="text-primary font-bold">2.400 ₺</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button className="px-3 py-1 hover:bg-gray-100">-</button>
                                        <span className="px-3 py-1 font-medium">1</span>
                                        <button className="px-3 py-1 hover:bg-gray-100">+</button>
                                    </div>
                                    <button className="text-red-500 hover:text-red-700 p-2">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h3 className="font-bold text-lg mb-4">Sipariş Özeti</h3>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Ara Toplam</span>
                                    <span>4.800 ₺</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Hizmet Bedeli</span>
                                    <span>250 ₺</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                    <span>Toplam</span>
                                    <span>5.050 ₺</span>
                                </div>
                            </div>

                            <button className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-colors">
                                Ödemeye Geç
                            </button>
                            <div className="mt-4 text-center">
                                <Link href="/" className="text-sm text-gray-500 hover:underline">Alışverişe Devam Et</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
