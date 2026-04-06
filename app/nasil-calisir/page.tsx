import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const STEPS = [
    {
        step: '01',
        icon: '🔍',
        title: 'İlanı Bul',
        desc: 'Arama veya kategoriler üzerinden ihtiyacınıza uygun ürünü bulun. Konum, fiyat ve kategoriye göre filtreleyin.',
    },
    {
        step: '02',
        icon: '📅',
        title: 'Tarih Seç',
        desc: 'Kiralamak istediğiniz başlangıç ve bitiş tarihlerini seçin. Sistem otomatik olarak müsait tarihleri gösterir.',
    },
    {
        step: '03',
        icon: '✅',
        title: 'Talebi Gönder',
        desc: 'Kiralama talebinizi gönderin. Satıcı 24 saat içinde onay verir ve sizinle iletişime geçer.',
    },
    {
        step: '04',
        icon: '🤝',
        title: 'Teslim Al & Kullan',
        desc: 'Satıcıyla elden veya kargo ile ürünü teslim alın. Kullandıktan sonra belirlenen tarihte iade edin.',
    },
];

const FOR_RENTERS = [
    'Ücretsiz kayıt olun',
    'İstediğiniz ürünü arayın',
    'Tarih seçip talep gönderin',
    'Satıcı onayı sonrası teslim alın',
    'Kullanıp zamanında iade edin',
    'Deneyiminizi değerlendirin',
];

const FOR_OWNERS = [
    'Hesap oluşturun ve doğrulanın',
    'Ürününüzü fotoğraflayın',
    'İlan oluşturun, fiyat belirleyin',
    'Gelen talepleri onaylayın',
    'Ürünü teslim edin, ödemeyi alın',
    'Güvenli ve düzenli gelir elde edin',
];

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">

                {/* Hero */}
                <div className="bg-gradient-to-br from-primary to-green-700 text-white py-20 px-4">
                    <div className="container mx-auto max-w-3xl text-center">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Nasıl Çalışır?</h1>
                        <p className="text-green-100 text-lg">
                            Sivas Kirala ile kiralama yapmak çok kolay. 4 adımda ihtiyacınıza kavuşun.
                        </p>
                    </div>
                </div>

                {/* Steps */}
                <div className="container mx-auto max-w-5xl px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                        {STEPS.map((s, i) => (
                            <div key={i} className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                                <div className="text-4xl mb-4">{s.icon}</div>
                                <span className="text-5xl font-black text-gray-100 absolute top-4 right-4 leading-none select-none">{s.step}</span>
                                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                                {i < STEPS.length - 1 && (
                                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-gray-300 text-2xl z-10">→</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Two columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="text-2xl">🛒</span> Kiracı İçin
                            </h2>
                            <ol className="space-y-3">
                                {FOR_RENTERS.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                                        <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="text-2xl">💼</span> Kiraya Veren İçin
                            </h2>
                            <ol className="space-y-3">
                                {FOR_OWNERS.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                                        <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-gradient-to-r from-primary to-green-600 rounded-2xl p-10 text-center text-white">
                        <h2 className="text-2xl font-black mb-2">Hemen Başla</h2>
                        <p className="text-green-100 mb-6">Binlerce ürün seni bekliyor. Ücretsiz kayıt ol, hemen kirala.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/arama" className="bg-white text-primary font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors">
                                Ürün Ara
                            </Link>
                            <Link href="/ilan-ver" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
                                İlan Ver
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
