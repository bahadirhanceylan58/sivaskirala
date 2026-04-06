import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LAST_UPDATED = '06 Nisan 2026';

const SECTIONS = [
    {
        title: '1. Hizmet Tanımı',
        content: `Sivas Kirala, Sivas ilinde kullanıcıların birbirlerinden ürün kiralayabildiği bir çevrimiçi platformdur. Platform yalnızca kiracı ile kiraya veren arasında aracılık yapar; kiralama sözleşmesinin tarafı değildir.`,
    },
    {
        title: '2. Kullanım Koşulları',
        content: `Platforma kayıt olarak aşağıdaki koşulları kabul etmiş sayılırsınız:

• 18 yaşından büyük olduğunuzu veya yasal temsilci onayına sahip olduğunuzu beyan edersiniz.
• Doğru, güncel ve eksiksiz bilgi sağlamayı kabul edersiniz.
• Hesabınızı başkalarıyla paylaşmamayı ve güvenliğini korumayı taahhüt edersiniz.
• Platformu yalnızca yasal amaçlarla kullanacağınızı kabul edersiniz.`,
    },
    {
        title: '3. Yasaklı İçerik ve Davranışlar',
        content: `Aşağıdaki durumlarda hesabınız askıya alınabilir veya kalıcı olarak kapatılabilir:

• Sahte, yanıltıcı veya eksik ilan oluşturmak
• Başka kullanıcıları dolandırmak veya taciz etmek
• Yasadışı ürünler kiralamak veya kiraya vermek
• Platform altyapısına zarar vermek (saldırı, spam vb.)
• Başkasının kimliğine bürünmek`,
    },
    {
        title: '4. Kiraya Verenin Sorumlulukları',
        content: `• İlan verdiğiniz ürünün sahibi olduğunuzu veya kiralama yetkisine sahip olduğunuzu beyan edersiniz.
• Ürünün açıklanan durumda, eksiksiz ve kullanılabilir şekilde teslim edileceğini garanti edersiniz.
• Ürün kayıp veya hasar durumunda kiracıyla doğrudan iletişime geçmek ve çözüm üretmekle yükümlüsünüz.
• Onaylanan kiralama taleplerini makul bir sebep olmaksızın iptal etmemeniz beklenmektedir.`,
    },
    {
        title: '5. Kiracının Sorumlulukları',
        content: `• Ürünü yalnızca belirtilen amaç doğrultusunda kullanmayı kabul edersiniz.
• Ürünü zamanında ve aldığınız durumda iade etmeyi taahhüt edersiniz.
• Ürüne verilen zararın tazmininden sorumlusunuz.
• Depozito bedelinin hasar kapsamında kullanılabileceğini kabul edersiniz.`,
    },
    {
        title: '6. Ödemeler ve Depozito',
        content: `Sivas Kirala şu an ödeme aracılık hizmeti sunmamaktadır. Tüm ödemeler ve depozito iadesi kullanıcılar arasında doğrudan gerçekleşir. Platform, ödeme anlaşmazlıklarından sorumlu tutulamaz.`,
    },
    {
        title: '7. Sorumluluk Sınırlaması',
        content: `Sivas Kirala:
• Kullanıcılar arasındaki kiralamadan doğabilecek zararlardan
• Platform üzerindeki ilan içeriklerinin doğruluğundan
• Kullanıcı davranışlarından

doğrudan sorumlu tutulamaz. Platform iyi niyet ilkesiyle hareket eder ve anlaşmazlıklarda arabuluculuk yapmaya çalışır.`,
    },
    {
        title: '8. Fikri Mülkiyet',
        content: `Platforma yüklediğiniz fotoğraf ve içerikler için gerekli haklara sahip olduğunuzu beyan edersiniz. Sivas Kirala logosu, tasarımı ve marka adı telif hakkıyla korunmaktadır; izinsiz kullanılamaz.`,
    },
    {
        title: '9. Hesap Kapatma',
        content: `Hesabınızı istediğiniz zaman kapatabilirsiniz. Mevcut aktif kiralamaların tamamlanmasını beklemeniz önerilir. Platform, şartları ihlal eden hesapları önceden bildirimde bulunmaksızın askıya alma veya kapatma hakkını saklı tutar.`,
    },
    {
        title: '10. Değişiklikler',
        content: `Bu kullanım şartları zaman zaman güncellenebilir. Güncellemeler bu sayfada yayınlandığı andan itibaren geçerli olur. Platformu kullanmaya devam etmeniz değişiklikleri kabul ettiğiniz anlamına gelir.`,
    },
];

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">

                <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20 px-4">
                    <div className="container mx-auto max-w-3xl text-center">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Kullanım Şartları</h1>
                        <p className="text-gray-400">Son güncelleme: {LAST_UPDATED}</p>
                    </div>
                </div>

                <div className="container mx-auto max-w-3xl px-4 py-16">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-10">
                        <p className="text-gray-600 leading-relaxed border-l-4 border-primary pl-4">
                            Sivas Kirala platformunu kullanarak aşağıdaki şartları okuduğunuzu ve kabul ettiğinizi beyan etmiş olursunuz. Lütfen dikkatlice okuyunuz.
                        </p>

                        {SECTIONS.map((section, i) => (
                            <div key={i}>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                                <div className="text-gray-600 text-sm leading-relaxed">
                                    {section.content.split('\n').map((line, j) => {
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
