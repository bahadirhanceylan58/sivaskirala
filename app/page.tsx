
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-primary text-white py-20 lg:py-28 overflow-hidden">
          {/* Enhanced Background with Green Gradient and Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#43a047] via-[#2e7d32] to-[#1b5e20] z-0"></div>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0 mix-blend-overlay"></div>

          <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-md">
                İhtiyacın Olanı Kirala, <br />
                <span className="text-green-100">Fazlanı Kazanca Çevir</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg mx-auto md:mx-0 font-light leading-relaxed">
                Sivas'ın en büyük kiralama platformuna hoş geldin. Teknolojiden giyime, kamptan hobiye aradığın her şey burada seni bekliyor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/kesfet" className="bg-white text-primary font-bold py-3.5 px-8 rounded-full shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all hover:-translate-y-1">
                  Hemen Kirala
                </Link>
                <Link href="/ilan-ver" className="bg-primary/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-3.5 px-8 rounded-full hover:bg-white/10 transition-all hover:-translate-y-1">
                  İlan Ver
                </Link>
              </div>
            </div>
            {/* Hero Image Component */}
            <div className="md:w-1/2 relative h-80 md:h-[500px] w-full mt-8 md:mt-0">
              {/* Floating Elements Design */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">📸</span>
                    <h3 className="text-xl font-bold mb-1">Sony A7 III</h3>
                    <p className="text-sm opacity-80">1.200 ₺ / Gün</p>
                  </div>
                </div>
                <div className="absolute -top-4 right-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl -rotate-6 hover:rotate-0 transition-transform duration-500 delay-100">
                  <div className="text-center">
                    <span className="text-5xl mb-2 block">👗</span>
                    <h3 className="text-lg font-bold">Abiye Elbise</h3>
                  </div>
                </div>
                <div className="absolute -bottom-8 left-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl rotate-6 hover:rotate-0 transition-transform duration-500 delay-200">
                  <div className="text-center">
                    <span className="text-5xl mb-2 block">⛺</span>
                    <h3 className="text-lg font-bold">Kamp Çadırı</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">Popüler Kategoriler</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Elektronik', icon: '💻', color: 'bg-blue-100' },
              { name: 'Giyim', icon: '👗', color: 'bg-pink-100' },
              { name: 'Kamp', icon: '⛺', color: 'bg-green-100' },
              { name: 'Bebek', icon: '👶', color: 'bg-yellow-100' },
              { name: 'Spor', icon: '⚽', color: 'bg-orange-100' },
              { name: 'Hobi', icon: '🎨', color: 'bg-purple-100' },
            ].map((cat) => (
              <Link href={`/kategori/${cat.name.toLowerCase()}`} key={cat.name} className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                <div className={`w-16 h-16 rounded-full ${cat.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <span className="font-medium text-gray-700 group-hover:text-primary transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products Placeholder */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Öne Çıkan İlanlar</h2>
              <Link href="/ilanlar" className="text-primary font-medium hover:underline">Tümünü Gör</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="h-48 bg-gray-200 relative">
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-700">
                      800 ₺ / Gün
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Kiralık Ürün {item}</h3>
                    <p className="text-gray-500 text-sm mb-3">İstanbul, Kadıköy</p>
                    <button className="w-full border border-primary text-primary font-medium py-2 rounded-lg hover:bg-primary hover:text-white transition-colors">
                      İncele
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
