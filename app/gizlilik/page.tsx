import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LAST_UPDATED = '06 Nisan 2026';

const SECTIONS = [
    {
        title: '1. Toplanan Bilgiler',
        content: `Sivas Kirala olarak aşağıdaki bilgileri toplayabiliriz:

• **Hesap bilgileri:** Ad, soyad, e-posta adresi, telefon numarası.
• **Profil bilgileri:** Profil fotoğrafı, biyografi, konum tercihi.
• **İlan bilgileri:** Ürün açıklamaları, fotoğraflar, fiyat ve konum bilgileri.
• **İşlem bilgileri:** Kiralama talepleri, onay/red geçmişi, yorumlar.
• **Teknik bilgiler:** IP adresi, tarayıcı türü, cihaz bilgisi, çerezler.`,
    },
    {
        title: '2. Bilgilerin Kullanımı',
        content: `Toplanan bilgiler aşağıdaki amaçlarla kullanılmaktadır:

• Platform hizmetlerinin sağlanması ve iyileştirilmesi
• Kullanıcılar arası iletişimin kolaylaştırılması
• Doğrulama ve güvenlik süreçlerinin yürütülmesi
• Bildirim ve e-posta gönderilmesi (izniniz dahilinde)
• Yasal yükümlülüklerin yerine getirilmesi
• Anonim istatistiksel analizler`,
    },
    {
        title: '3. Bilgilerin Paylaşımı',
        content: `Kişisel bilgileriniz aşağıdaki durumlar dışında üçüncü şahıslarla paylaşılmaz:

• **Kiralama işlemleri:** Kiracı ve kiraya veren arasında gerekli iletişim bilgileri paylaşılır.
• **Yasal zorunluluk:** Mahkeme kararı veya yasal düzenlemeler gereği.
• **Hizmet sağlayıcılar:** Firebase (veritabanı), Vercel (barındırma) gibi altyapı ortakları — bu firmalar kendi gizlilik politikalarına tabidir.

Bilgileriniz hiçbir koşulda reklam amaçlı üçüncü taraflara satılmaz.`,
    },
    {
        title: '4. Çerezler (Cookies)',
        content: `Platformumuz oturum yönetimi ve deneyim iyileştirme amacıyla çerez kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı özellikler çalışmayabilir.`,
    },
    {
        title: '5. Veri Güvenliği',
        content: `Verileriniz Google Firebase altyapısında şifreli olarak saklanmaktadır. Yetkisiz erişime karşı endüstri standardı güvenlik önlemleri uygulanmaktadır. Bununla birlikte, internet üzerinden hiçbir veri iletiminin %100 güvenli olmadığını hatırlatırız.`,
    },
    {
        title: '6. Haklarınız',
        content: `KVKK (6698 sayılı Kişisel Verilerin Korunması Kanunu) kapsamında aşağıdaki haklara sahipsiniz:

• Kişisel verilerinizin işlenip işlenmediğini öğrenme
• İşleniyorsa bilgi talep etme
• Verilerin silinmesini veya yok edilmesini talep etme
• Eksik veya yanlış verilerin düzeltilmesini isteme
• Veri işlemeye itiraz etme

Bu haklarınızı kullanmak için info@sivaskirala.com adresine yazabilirsiniz.`,
    },
    {
        title: '7. Değişiklikler',
        content: `Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda kayıtlı e-posta adresinize bildirim göndeririz. Güncel politikayı bu sayfa üzerinden takip edebilirsiniz.`,
    },
];

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">

                <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20 px-4">
                    <div className="container mx-auto max-w-3xl text-center">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Gizlilik Politikası</h1>
                        <p className="text-gray-400">Son güncelleme: {LAST_UPDATED}</p>
                    </div>
                </div>

                <div className="container mx-auto max-w-3xl px-4 py-16">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-10">
                        <p className="text-gray-600 leading-relaxed border-l-4 border-primary pl-4">
                            Sivas Kirala olarak gizliliğinize saygı duyuyoruz. Bu politika, kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklamaktadır.
                        </p>

                        {SECTIONS.map((section, i) => (
                            <div key={i}>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                    {section.content.split('\n').map((line, j) => {
                                        if (line.startsWith('• **')) {
                                            const match = line.match(/^• \*\*(.+?)\*\*(.*)$/);
                                            if (match) return (
                                                <p key={j} className="mb-1.5">
                                                    • <strong className="text-gray-800">{match[1]}</strong>{match[2]}
                                                </p>
                                            );
                                        }
                                        if (line.startsWith('• ')) return <p key={j} className="mb-1.5">{line}</p>;
                                        return line ? <p key={j} className="mb-3">{line}</p> : <br key={j} />;
                                    })}
                                </div>
                            </div>
                        ))}

                        <div className="border-t border-gray-100 pt-6 text-sm text-gray-500">
                            Sorularınız için: <a href="mailto:info@sivaskirala.com" className="text-primary hover:underline">info@sivaskirala.com</a>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
