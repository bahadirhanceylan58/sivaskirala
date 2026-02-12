
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-12 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* About */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Sivas Kirala</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Sivas'ın yerel kiralama platformu. İhtiyacınız olan her şeyi güvenle kiralayın veya kiraya verin.
                        </p>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Kategoriler</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/kategori/elektronik" className="hover:text-white transition-colors">Elektronik</Link></li>
                            <li><Link href="/kategori/giyim" className="hover:text-white transition-colors">Giyim</Link></li>
                            <li><Link href="/kategori/spor" className="hover:text-white transition-colors">Spor & Outdoor</Link></li>
                            <li><Link href="/kategori/bebek" className="hover:text-white transition-colors">Anne & Bebek</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Destek</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/nasil-calisir" className="hover:text-white transition-colors">Nasıl Çalışır?</Link></li>
                            <li><Link href="/sss" className="hover:text-white transition-colors">Sıkça Sorulan Sorular</Link></li>
                            <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
                        </ul>
                    </div>

                    {/* Social / Contact */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">İletişim</h3>
                        <p className="text-gray-400 text-sm mb-2">info@sivaskirala.com</p>
                        <p className="text-gray-400 text-sm">+90 555 555 55 55</p>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Sivas Kirala. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
