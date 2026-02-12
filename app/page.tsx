
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
        <section className="relative bg-white text-gray-800 py-16 lg:py-24 overflow-hidden border-b border-gray-100">
          <div className="container mx-auto px-4 relative z-10 flex flex-col-reverse md:flex-row items-center gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight text-gray-900">
                İhtiyacın Olanı Kirala, <br />
                <span className="text-primary">Fazlanı Kazanca Çevir</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                Sivas'ın en büyük kiralama platformuna hoş geldin. Elektronikten kamp malzemelerine, aradığın her şeyi güvenle kirala.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/kesfet" className="bg-primary text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-all hover:-translate-y-1">
                  Hemen Kirala
                </Link>
                <Link href="/ilan-ver" className="bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 px-8 rounded-xl hover:border-primary hover:text-primary transition-all hover:-translate-y-1">
                  İlan Ver
                </Link>
              </div>
            </div>

            {/* Hero Image - Clean & Corporat */}
            <div className="md:w-1/2 relative w-full flex justify-center">
              <div className="relative w-full max-w-md aspect-square bg-gray-50 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-green-50 to-transparent opacity-50"></div>
                {/* Placeholder for Product Image */}
                <div className="text-center p-8 z-10">
                  <span className="text-8xl mb-4 block drop-shadow-sm">📸</span>
                  <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800">Güvenli Kiralama</h3>
                    <p className="text-sm text-gray-500">Binlerce Ürün</p>
                  </div>
                </div>
              </div>
              {/* Decorative Circle (Subtle Green, not Blue) */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-green-100 rounded-full -z-10 blur-xl"></div>
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-green-50 rounded-full -z-10 blur-xl"></div>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">Popüler Kategoriler</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Organizasyon', icon: '🎉', color: 'bg-purple-100' },
              { name: 'Ses & Görüntü', icon: '🔊', color: 'bg-blue-100' },
              { name: 'Abiye & Giyim', icon: '👗', color: 'bg-pink-100' },
              { name: 'Kamera', icon: '📸', color: 'bg-indigo-100' },
              { name: 'Kamp', icon: '⛺', color: 'bg-green-100' },
              { name: 'Elektronik', icon: '💻', color: 'bg-gray-100' },
            ].map((cat) => (
              <Link href={`/kategori/${cat.name.toLowerCase()}`} key={cat.name} className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                <div className={`w-16 h-16 rounded-full ${cat.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <span className="font-medium text-gray-700 group-hover:text-primary transition-colors text-center">{cat.name}</span>
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
