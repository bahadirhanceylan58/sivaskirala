'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const FAQS = [
    {
        category: 'Genel',
        items: [
            {
                q: 'Sivas Kirala nedir?',
                a: 'Sivas Kirala, Sivas ilinde yaşayan kullanıcıların birbirlerinden ürün kiralayabildiği yerel bir platformdur. Elektronik, giyim, kamp malzemeleri, organizasyon ekipmanları ve daha fazlasını günlük olarak kiralayabilirsiniz.',
            },
            {
                q: 'Kayıt ücretsiz mi?',
                a: 'Evet, Sivas Kirala\'ya kayıt olmak tamamen ücretsizdir. İlan vermek ve ürün kiralamak için hesap oluşturmanız yeterlidir.',
            },
            {
                q: 'Platform komisyon alıyor mu?',
                a: 'Şu an için platform herhangi bir komisyon almamaktadır. Kiracı ile kiraya veren arasındaki ödeme doğrudan gerçekleşir.',
            },
        ],
    },
    {
        category: 'Kiralama',
        items: [
            {
                q: 'Nasıl ürün kiralayabilirim?',
                a: 'Arama veya kategoriler üzerinden ürünü bulun, tarih aralığını seçin ve kiralama talebini gönderin. Satıcı onayladıktan sonra ürünü teslim alabilirsiniz.',
            },
            {
                q: 'Kiralama talebi ne kadar sürede onaylanır?',
                a: 'Satıcılar genellikle 24 saat içinde taleplere yanıt verir. Acil durumlar için ilan detay sayfasındaki "WhatsApp" butonu ile doğrudan iletişime geçebilirsiniz.',
            },
            {
                q: 'Ürünü nasıl teslim alırım?',
                a: 'Teslimat yöntemi ilan sayfasında belirtilir. "Elden Teslim", "Kargo" veya her ikisi şeklinde olabilir. Satıcıyla mesajlaşarak detayları netleştirebilirsiniz.',
            },
            {
                q: 'Depozito nedir, iade edilir mi?',
                a: 'Depozito, ürünün zarar görmemesi için alınan güvence bedelidir. Ürün hasarsız iade edildiğinde depozito tam olarak iade edilir.',
            },
        ],
    },
    {
        category: 'İlan Verme',
        items: [
            {
                q: 'Hangi ürünleri kiraya verebilirim?',
                a: 'Elektronik cihazlar, kamp malzemeleri, abiye ve giyim ürünleri, ses/görüntü ekipmanları, organizasyon malzemeleri ve daha fazlasını kiraya verebilirsiniz. Yasadışı veya tehlikeli ürünler yasaktır.',
            },
            {
                q: 'İlanım ne zaman yayınlanır?',
                a: 'İlanlar yayınlanmadan önce admin ekibimiz tarafından incelenir. İnceleme süreci genellikle 24 saat içinde tamamlanır.',
            },
            {
                q: 'Fiyatı ben mi belirliyorum?',
                a: 'Evet, günlük kiralama fiyatını ve depozito miktarını tamamen siz belirlersiniz.',
            },
        ],
    },
    {
        category: 'Güvenlik',
        items: [
            {
                q: 'Ürünüm zarar görürse ne olur?',
                a: 'Kiracı, ürünü aldığı durumuyla iade etmekle yükümlüdür. Olası zararlar depozito bedelinden karşılanır. Anlaşmazlık durumunda destek ekibimize ulaşabilirsiniz.',
            },
            {
                q: 'Güvenilir kullanıcıları nasıl anlayabilirim?',
                a: 'Profil sayfasında kullanıcının üyelik süresi, ilan sayısı ve aldığı yorumları görebilirsiniz. Onaylı hesap rozeti güvenilirliği artırır.',
            },
            {
                q: 'Kötü niyetli bir kullanıcıyı nasıl bildiririm?',
                a: 'İletişim sayfamız üzerinden destek ekibimize bildirin. Şüpheli hesaplar incelenerek gerekli işlem yapılır.',
            },
        ],
    },
];

export default function SSSPage() {
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const toggle = (key: string) => setOpenIndex(prev => prev === key ? null : key);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">

                {/* Hero */}
                <div className="bg-gradient-to-br from-primary to-green-700 text-white py-20 px-4">
                    <div className="container mx-auto max-w-3xl text-center">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Sıkça Sorulan Sorular</h1>
                        <p className="text-green-100 text-lg">Aklınızdaki soruların cevaplarını burada bulabilirsiniz.</p>
                    </div>
                </div>

                <div className="container mx-auto max-w-3xl px-4 py-16 space-y-10">
                    {FAQS.map((section) => (
                        <div key={section.category}>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 bg-primary rounded-full inline-block" />
                                {section.category}
                            </h2>
                            <div className="space-y-3">
                                {section.items.map((item, i) => {
                                    const key = `${section.category}-${i}`;
                                    const isOpen = openIndex === key;
                                    return (
                                        <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                            <button
                                                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                                                onClick={() => toggle(key)}
                                            >
                                                <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                                                <span className={`text-gray-400 text-lg flex-shrink-0 transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                                                    {item.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="bg-gray-100 rounded-2xl p-8 text-center">
                        <p className="text-gray-600 mb-4">Sorunuzun cevabını bulamadınız mı?</p>
                        <Link href="/iletisim" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-green-700 transition-colors inline-block">
                            Bize Ulaşın
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
