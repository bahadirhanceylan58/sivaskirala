import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-md">
                <div className="text-8xl mb-6">🔍</div>
                <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Sayfa Bulunamadı</h2>
                <p className="text-gray-500 mb-8">
                    Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/"
                        className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-100">
                        Anasayfaya Dön
                    </Link>
                    <Link href="/arama"
                        className="border border-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl hover:border-primary hover:text-primary transition-colors">
                        İlanları Keşfet
                    </Link>
                </div>
            </div>
        </div>
    );
}
