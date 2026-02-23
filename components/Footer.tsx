import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            {/* Main content */}
            <div className="container mx-auto px-4 pt-16 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* About */}
                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-extrabold mb-4 gradient-text bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                            Sivas Kirala
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Sivas'ın yerel kiralama platformu. İhtiyacınız olan her şeyi güvenle kiralayın veya kiraya verin.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-3">
                            {[
                                {
                                    label: 'Instagram', href: '#', icon: (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                    )
                                },
                                {
                                    label: 'Twitter', href: '#', icon: (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                    )
                                },
                                {
                                    label: 'Facebook', href: '#', icon: (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    )
                                },
                            ].map((social, i) => (
                                <a key={i} href={social.href} aria-label={social.label}
                                    className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Kategoriler</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link href="/kategori/elektronik" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Elektronik</Link></li>
                            <li><Link href="/kategori/abiye-giyim" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Abiye & Giyim</Link></li>
                            <li><Link href="/kategori/kamp" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Kamp & Outdoor</Link></li>
                            <li><Link href="/kategori/ses-goruntu" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Ses & Görüntü</Link></li>
                            <li><Link href="/kategori/organizasyon" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Organizasyon & Düğün</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Destek</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link href="/nasil-calisir" className="hover:text-white transition-colors">Nasıl Çalışır?</Link></li>
                            <li><Link href="/sss" className="hover:text-white transition-colors">Sıkça Sorulan Sorular</Link></li>
                            <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
                            <li><Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
                            <li><Link href="/kullanim-sartlari" className="hover:text-white transition-colors">Kullanım Şartları</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">İletişim</h3>
                        <div className="space-y-3 text-sm text-gray-400">
                            <p className="flex items-center gap-2">
                                <span className="text-lg">📧</span>
                                info@sivaskirala.com
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="text-lg">📱</span>
                                +90 555 555 55 55
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="text-lg">📍</span>
                                Sivas, Türkiye
                            </p>
                        </div>

                        {/* App Store badge placeholder */}
                        <div className="mt-6 p-3 bg-gray-800 rounded-xl text-center">
                            <span className="text-xs text-gray-500">📱 Mobil Uygulama</span>
                            <p className="text-xs text-gray-400 mt-1">Yakında...</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-800">
                <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm text-center md:text-left">
                        © {new Date().getFullYear()} Sivas Kirala. Tüm hakları saklıdır.
                    </p>
                    <div className="flex items-center gap-6 text-xs text-gray-500">
                        <Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik</Link>
                        <Link href="/kullanim-sartlari" className="hover:text-white transition-colors">Şartlar</Link>
                        <Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
