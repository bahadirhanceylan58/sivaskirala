'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import FavoriteButton from "@/components/FavoriteButton";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, limit, where } from "firebase/firestore";
import {
  ShieldCheckIcon,
  PhoneIcon,
  CheckBadgeIcon,
  CursorArrowRaysIcon,
  CalendarDaysIcon,
  TruckIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  description?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("status", "==", "active"),
          orderBy("created_at", "desc"),
          limit(8)
        );

        const querySnapshot = await getDocs(q);
        const latestProducts: Product[] = [];
        querySnapshot.forEach((doc) => {
          latestProducts.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(latestProducts);
      } catch (error) {
        console.error("Error fetching homepage products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* ===== TRUST BADGES ===== */}
        <section className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: ShieldCheckIcon, text: 'Güvenli Ödeme', color: 'text-green-600 bg-green-50' },
                { icon: PhoneIcon, text: '7/24 Destek', color: 'text-purple-600 bg-purple-50' },
                { icon: CheckBadgeIcon, text: '%100 Güvence', color: 'text-orange-600 bg-orange-50' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-3 justify-center py-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badge.color}`}>
                    <badge.icon className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-gray-700 text-sm">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== POPULAR CATEGORIES ===== */}
        <section className="py-10 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Popüler Kategoriler</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'organizasyon', display: 'Organizasyon & Düğün', icon: '🎉', color: 'bg-purple-50 hover:bg-purple-100', border: 'border-purple-200' },
              { name: 'ses-goruntu', display: 'Ses & Görüntü', icon: '🔊', color: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-200' },
              { name: 'abiye-giyim', display: 'Abiye & Giyim', icon: '👗', color: 'bg-pink-50 hover:bg-pink-100', border: 'border-pink-200' },
              { name: 'kamera', display: 'Fotoğraf & Kamera', icon: '📸', color: 'bg-indigo-50 hover:bg-indigo-100', border: 'border-indigo-200' },
              { name: 'kamp', display: 'Kamp & Outdoor', icon: '⛺', color: 'bg-green-50 hover:bg-green-100', border: 'border-green-200' },
              { name: 'elektronik', display: 'Elektronik', icon: '💻', color: 'bg-gray-50 hover:bg-gray-100', border: 'border-gray-200' },
            ].map((cat) => (
              <Link href={`/kategori/${cat.name}`} key={cat.name}
                className={`flex flex-col items-center p-5 rounded-2xl border ${cat.border} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group ${cat.color}`}>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <span className="font-semibold text-gray-700 text-sm text-center">{cat.display}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== FEATURED PRODUCTS ===== */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Öne Çıkan İlanlar</h2>
                <p className="text-gray-500 text-sm mt-1">En yeni ve popüler kiralık ürünler</p>
              </div>
              <Link href="/arama" className="text-primary font-medium hover:underline flex items-center gap-1">
                Tümünü Gör →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-dashed border-green-200">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Henüz ilan bulunmuyor</h3>
                  <p className="text-gray-500 mb-6">İlk ilanı sen ver, kazanmaya başla!</p>
                  <Link href="/ilan-ver"
                    className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-all hover:scale-105 shadow-lg shadow-green-200">
                    + İlan Ver
                  </Link>
                </div>
              ) : (
                products.map((item) => (
                  <div key={item.id} className="relative group">
                    {/* Favorite button */}
                    <div className="absolute top-3 right-3 z-20">
                      <FavoriteButton
                        productId={item.id}
                        productData={{ title: item.title, price: item.price, image: item.image, category: item.category }}
                        className="bg-white shadow-sm hover:bg-gray-50 border border-gray-100"
                      />
                    </div>

                    <Link href={`/ilan/${item.id}`} className="block h-full">
                      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                        {/* Image area — white bg, object-contain like kiralabunu */}
                        <div className="h-48 bg-white flex items-center justify-center p-4 relative overflow-hidden border-b border-gray-100">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }}
                            />
                          ) : (
                            <div className="text-gray-300 text-4xl">📦</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-4 flex flex-col flex-1">
                          {/* Category — green like brand name */}
                          <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wide">{item.category}</p>

                          {/* Title */}
                          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors flex-1">
                            {item.title}
                          </h3>

                          {/* Price row */}
                          <div className="border-t border-gray-100 pt-3 flex items-end justify-between">
                            <div>
                              <p className="text-xs text-gray-400">Günlük</p>
                              <p className="text-xl font-black text-gray-900">
                                {item.price.toLocaleString('tr-TR')} <span className="text-base">₺</span>
                              </p>
                            </div>
                            <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                              Kirala
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>

          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-primary font-bold text-sm tracking-wider uppercase bg-green-50 px-4 py-1.5 rounded-full">Nasıl Çalışır?</span>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-6 mb-4">3 Adımda Kiralama</h2>
              <p className="text-gray-500 text-lg">Satın almadan, sadece ihtiyacın kadar kullan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: '1',
                  icon: CursorArrowRaysIcon,
                  title: 'Ürün Seç',
                  desc: 'Kategorileri keşfet, ihtiyacına uygun ürünü bul.',
                  color: 'bg-blue-500',
                },
                {
                  step: '2',
                  icon: CalendarDaysIcon,
                  title: 'Tarih Belirle',
                  desc: 'Kiralama başlangıç ve bitiş tarihlerini seç.',
                  color: 'bg-primary',
                },
                {
                  step: '3',
                  icon: TruckIcon,
                  title: 'Teslim Al',
                  desc: 'Ürün kapına gelsin veya teslim noktasından al.',
                  color: 'bg-orange-500',
                },
              ].map((item, i) => (
                <div key={i} className="relative text-center group">
                  {/* Connector line */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gray-200 z-0" />
                  )}
                  <div className={`w-24 h-24 ${item.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                    <item.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Adım {item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURE HIGHLIGHTS ===== */}
        <section className="py-20 bg-white border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Sivas Kirala ile Keşfet</h2>
              <p className="text-lg text-gray-600">İhtiyacın olan her şey tek bir platformda. Satın alma, kirala ve özgürleş.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                { title: "Ses Sistemleri", desc: "Düğün, nişan ve partiler için profesyonel ses.", icon: "🔊", color: "bg-blue-100 text-blue-600", link: "/kategori/ses-goruntu" },
                { title: "Projeksiyon", desc: "Sinema keyfini eve veya bahçeye taşıyın.", icon: "📽️", color: "bg-indigo-100 text-indigo-600", link: "/kategori/elektronik" },
                { title: "Abiye & Giyim", desc: "Her davette farklı bir şıklık.", icon: "👗", color: "bg-pink-100 text-pink-600", link: "/kategori/abiye-giyim" },
                { title: "Kamp Ekipmanları", desc: "Doğayla iç içe konforlu tatil.", icon: "⛺", color: "bg-green-100 text-green-600", link: "/kategori/kamp" },
              ].map((feature, idx) => (
                <Link href={feature.link} key={idx} className="flex flex-col items-center text-center group">
                  <div className={`w-32 h-32 rounded-3xl ${feature.color} flex items-center justify-center text-5xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transform scale-0 group-hover:scale-150 transition-all duration-500 rounded-3xl" />
                    <span className="relative z-10">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed px-2">{feature.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-primary font-bold text-sm tracking-wider uppercase bg-green-50 px-4 py-1.5 rounded-full">Kullanıcı Yorumları</span>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-6">Müşterilerimiz Ne Diyor?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { name: 'Ahmet Y.', role: 'Düğün Organizatörü', text: 'Ses sistemi kiralama işimizi çok kolaylaştırdı. Ekipmanlar tertemiz ve zamanında teslim edildi.', rating: 5 },
                { name: 'Elif K.', role: 'Üniversite Öğrencisi', text: 'Abiye kiraladım, harika bir deneyimdi! Hem bütçeme uygun hem de şık bir gece geçirdim.', rating: 5 },
                { name: 'Murat D.', role: 'Kamp Tutkunu', text: 'Kamp çadırını satın almak yerine kiraladım. Kaliteli ekipman, uygun fiyat. Kesinlikle tavsiye ederim!', rating: 4 },
              ].map((review, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative">
                  {/* Quote mark */}
                  <div className="text-6xl text-green-100 font-serif absolute top-4 right-6 leading-none">"</div>

                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <StarIcon key={j} className={`h-4 w-4 ${j < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6 relative z-10">"{review.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{review.name}</p>
                      <p className="text-gray-500 text-xs">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA BANNER ===== */}
        <section className="py-20 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-48 h-48 bg-white rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Sende Bir Eşya Kirala, Hem Kazan Hem Paylaş!
            </h2>
            <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
              Kullanmadığın eşyalarını kiraya ver, pasif gelir elde et. Hemen ücretsiz ilan ver!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/ilan-ver"
                className="bg-white text-green-700 font-bold px-10 py-4 rounded-full text-lg hover:bg-green-50 transition-all hover:scale-105 shadow-xl">
                Ücretsiz İlan Ver
              </Link>
              <Link href="/arama"
                className="border-2 border-white/50 text-white font-bold px-10 py-4 rounded-full text-lg hover:bg-white/10 transition-all">
                Ürünleri Keşfet
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
