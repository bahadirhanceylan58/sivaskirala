'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MockService, Product } from "@/lib/mock-service";
import Hero from "@/components/Hero";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    MockService.getProducts().then((data) => {
      // Show latest 4 products
      setProducts(data.slice(-4).reverse());
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Popular Categories */}
        <section className="py-8 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Popüler Kategoriler</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Organizasyon', icon: '🎉', color: 'bg-purple-50 hover:bg-purple-100', border: 'border-purple-100' },
              { name: 'Ses', display: 'Ses & Görüntü', icon: '🔊', color: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-100' },
              { name: 'Giyim', display: 'Abiye & Giyim', icon: '👗', color: 'bg-pink-50 hover:bg-pink-100', border: 'border-pink-100' },
              { name: 'Kamera', icon: '📸', color: 'bg-indigo-50 hover:bg-indigo-100', border: 'border-indigo-100' },
              { name: 'Kamp', icon: '⛺', color: 'bg-green-50 hover:bg-green-100', border: 'border-green-100' },
              { name: 'Elektronik', icon: '💻', color: 'bg-gray-50 hover:bg-gray-100', border: 'border-gray-100' },
            ].map((cat) => (
              <Link href={`/kategori/${cat.name.toLowerCase()}`} key={cat.name} className={`flex flex-col items-center p-4 rounded-xl border ${cat.border} transition-all duration-300 hover:shadow-md group ${cat.color}`}>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl mb-3 shadow-sm group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <span className="font-semibold text-gray-700 text-sm whitespace-nowrap">{cat.display || cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Öne Çıkan İlanlar</h2>
              <Link href="/ilanlar" className="text-primary font-medium hover:underline">Tümünü Gör</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p>Henüz ilan bulunmuyor. İlk ilanı sen ver!</p>
                  <Link href="/ilan-ver" className="text-primary font-bold mt-2 inline-block hover:underline">İlan Ver</Link>
                </div>
              ) : (
                products.map((item) => (
                  <Link href={`/ilan/${item.id}`} key={item.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1 group bg-white block h-full">
                    <div className="h-48 bg-gray-200 relative">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">Görsel Yok</div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-bold text-gray-800 shadow-sm">
                        {item.price} ₺ / Gün
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors text-gray-900 truncate">{item.title}</h3>
                      <p className="text-gray-500 text-sm mb-3">{item.category}</p>
                      <button className="w-full border border-primary text-primary font-medium py-2 rounded-lg hover:bg-primary hover:text-white transition-colors">
                        İncele
                      </button>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Features / Highlights Section */}
        <section className="py-20 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Sivas Kirala ile Keşfet</h2>
              <p className="text-lg text-gray-600">İhtiyacın olan her şey tek bir platformda. Satın alma, kirala ve özgürleş.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                {
                  title: "Ses Sistemleri",
                  desc: "Düğün, nişan ve partileriniz için profesyonel ses sistemleri.",
                  icon: "🔊",
                  color: "bg-blue-100 text-blue-600",
                  link: "/kategori/ses"
                },
                {
                  title: "Projeksiyon",
                  desc: "Sinema keyfini eve veya bahçeye taşıyın. Dev ekran deneyimi.",
                  icon: "📽️",
                  color: "bg-indigo-100 text-indigo-600",
                  link: "/kategori/elektronik"
                },
                {
                  title: "Abiye & Giyim",
                  desc: "Her davette farklı bir şıklık. Dolabınızı değil, anılarınızı doldurun.",
                  icon: "👗",
                  color: "bg-pink-100 text-pink-600",
                  link: "/kategori/giyim"
                },
                {
                  title: "Kamp Ekipmanları",
                  desc: "Doğayla iç içe konforlu bir tatil için en iyi çadır ve malzemeler.",
                  icon: "⛺",
                  color: "bg-green-100 text-green-600",
                  link: "/kategori/kamp"
                }
              ].map((feature, idx) => (
                <Link href={feature.link} key={idx} className="flex flex-col items-center text-center group">
                  <div className={`w-36 h-36 rounded-full ${feature.color} flex items-center justify-center text-6xl mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white opacity-20 transform scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full"></div>
                    <span className="relative z-10">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed px-2">
                    {feature.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
