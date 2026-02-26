'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StarIcon, HeartIcon, ShareIcon, PhoneIcon, ChatBubbleLeftIcon, ShieldCheckIcon, MapPinIcon, CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import ReviewList from "@/components/ReviewList";
import ReviewModal from "@/components/ReviewModal";

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    image: string;
    images?: string[];
    features?: string[];
    ownerId: string;
    lat?: number;
    lng?: number;
    status?: string;
}

interface Seller {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    memberSince?: string;
    listingCount?: number;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [seller, setSeller] = useState<Seller | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Gallery state
    const [activeImage, setActiveImage] = useState(0);

    // Booking state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [days, setDays] = useState(1);

    // Review state
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    // Load current user
    useEffect(() => {
        const initAuth = async () => {
            const { auth } = await import('@/lib/firebase');
            const { onAuthStateChanged } = await import('firebase/auth');
            return onAuthStateChanged(auth, (user) => setCurrentUser(user));
        };
        let unsub: any;
        initAuth().then(u => unsub = u);
        return () => unsub?.();
    }, []);

    // Load product
    useEffect(() => {
        async function fetchProduct() {
            try {
                const { db } = await import('@/lib/firebase');
                const { doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');

                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const pData = docSnap.data();
                    const prod = { id: docSnap.id, ...pData } as Product;
                    setProduct(prod);
                    setTotalPrice(pData.price);

                    // Fetch seller info
                    if (pData.ownerId) {
                        try {
                            const sellerDoc = await getDoc(doc(db, 'users', pData.ownerId));
                            // Count seller listings
                            const q = query(collection(db, 'products'), where('ownerId', '==', pData.ownerId));
                            const listingsSnap = await getDocs(q);

                            if (sellerDoc.exists()) {
                                const sd = sellerDoc.data();
                                setSeller({
                                    name: sd.full_name || 'Satıcı',
                                    email: sd.email || '',
                                    phone: sd.phone || '',
                                    avatar: sd.avatar || '',
                                    memberSince: sd.created_at ? new Date(sd.created_at).getFullYear().toString() : '2024',
                                    listingCount: listingsSnap.size
                                });
                            } else {
                                setSeller({ name: 'Satıcı', email: pData.owner_email || '', listingCount: listingsSnap.size });
                            }
                        } catch (e) { console.error('Seller error', e); }
                    }
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [id]);

    // Check favorite on load
    useEffect(() => {
        if (!currentUser || !id) return;
        const checkFav = async () => {
            const { db } = await import('@/lib/firebase');
            const { doc, getDoc } = await import('firebase/firestore');
            const favRef = doc(db, "favorites", `${currentUser.uid}_${id}`);
            const favSnap = await getDoc(favRef);
            setIsFavorite(favSnap.exists());
        };
        checkFav();
    }, [currentUser, id]);

    // Recalculate total
    useEffect(() => {
        if (product && startDate && endDate) {
            const d = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
            setDays(d);
            setTotalPrice(product.price * d);
        } else if (product) {
            setDays(1);
            setTotalPrice(product.price);
        }
    }, [startDate, endDate, product]);

    const toggleFavorite = async () => {
        if (!currentUser) { alert('Favorilere eklemek için giriş yapın.'); return; }
        setFavLoading(true);
        try {
            const { db } = await import('@/lib/firebase');
            const { doc, setDoc, deleteDoc } = await import('firebase/firestore');
            const favId = `${currentUser.uid}_${id}`;
            const favRef = doc(db, "favorites", favId);
            if (isFavorite) {
                await deleteDoc(favRef);
                setIsFavorite(false);
            } else {
                await setDoc(favRef, {
                    userId: currentUser.uid,
                    productId: id,
                    product: { title: product?.title, price: product?.price, image: product?.image, category: product?.category },
                    created_at: new Date().toISOString()
                });
                setIsFavorite(true);
            }
        } catch (e) { console.error(e); }
        finally { setFavLoading(false); }
    };

    const handleAddToCart = () => {
        if (!startDate || !endDate) { alert('Lütfen kiralama tarih aralığını seçiniz.'); return; }
        const cart = JSON.parse(localStorage.getItem('sivas_cart') || '[]');
        cart.push({
            cartId: `${product!.id}_${Date.now()}`,
            id: product!.id,
            title: product!.title,
            price: product!.price,
            image: product!.image,
            category: product!.category,
            ownerId: product!.ownerId,
            duration: days,
            startDate,
            endDate
        });
        localStorage.setItem('sivas_cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/cart';
    };

    const allImages = product ? [product.image, ...(product.images?.slice(1) || [])].filter(Boolean) : [];

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 font-medium">Yükleniyor...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-grow flex flex-col items-center justify-center gap-4">
                    <div className="text-6xl">🔍</div>
                    <h1 className="text-2xl font-bold text-gray-800">Ürün Bulunamadı</h1>
                    <Link href="/" className="text-primary font-bold hover:underline">Anasayfaya Dön</Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-6 max-w-7xl">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
                    <span>/</span>
                    <Link href={`/kategori/${product.category?.toLowerCase()}`} className="hover:text-primary transition-colors">{product.category}</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-medium truncate max-w-xs">{product.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Main Image */}
                            <div className="relative bg-gray-100 h-[420px] group">
                                <img
                                    src={allImages[activeImage] || '/placeholder-product.png'}
                                    alt={product.title}
                                    className="w-full h-full object-cover transition-all duration-500"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }}
                                />
                                {/* Prev/Next arrows for multiple images */}
                                {allImages.length > 1 && (
                                    <>
                                        <button onClick={() => setActiveImage(i => (i - 1 + allImages.length) % allImages.length)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                                            <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
                                        </button>
                                        <button onClick={() => setActiveImage(i => (i + 1) % allImages.length)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                                            <ChevronRightIcon className="h-5 w-5 text-gray-700" />
                                        </button>
                                    </>
                                )}
                                {/* Favorite + Share */}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={toggleFavorite}
                                        disabled={favLoading}
                                        className={`p-2.5 rounded-full shadow-md transition-all ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur text-gray-500 hover:text-red-500'}`}
                                    >
                                        {isFavorite ? <HeartIcon className="h-5 w-5" /> : <HeartOutlineIcon className="h-5 w-5" />}
                                    </button>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('Link kopyalandı!'))}
                                        className="p-2.5 rounded-full bg-white/90 backdrop-blur shadow-md text-gray-500 hover:text-primary transition-colors"
                                    >
                                        <ShareIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                {/* Status badge */}
                                {product.status === 'pending' && (
                                    <div className="absolute top-4 left-4 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                                        Onay Bekliyor
                                    </div>
                                )}
                            </div>
                            {/* Thumbnails */}
                            {allImages.length > 1 && (
                                <div className="flex gap-3 p-4 bg-gray-50 overflow-x-auto no-scrollbar">
                                    {allImages.map((img, idx) => (
                                        <button key={idx} onClick={() => setActiveImage(idx)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                            <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <span className="bg-green-50 text-primary text-sm font-bold px-3 py-1 rounded-full">{product.category}</span>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <StarIcon key={s} className={`h-4 w-4 ${s <= 3 ? 'text-yellow-400' : 'text-gray-200'}`} />
                                    ))}
                                    <span className="text-sm text-gray-500 ml-1">Yeni İlan</span>
                                </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-base">{product.description}</p>

                            {product.features && product.features.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4">Ürün Özellikleri</h3>
                                    <ul className="grid grid-cols-2 gap-3">
                                        {product.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                                <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Reviews */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Yorumlar</h2>
                                {currentUser && (
                                    <button
                                        onClick={() => setIsReviewModalOpen(true)}
                                        className="bg-primary text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors"
                                    >
                                        + Yorum Yap
                                    </button>
                                )}
                            </div>
                            <ReviewList productId={product.id} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN — Booking + Seller */}
                    <div className="space-y-4">
                        {/* Booking Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            {/* Price Header */}
                            <div className="flex items-end justify-between mb-6 pb-6 border-b border-gray-100">
                                <div>
                                    <span className="text-4xl font-black text-primary">{product.price.toLocaleString('tr-TR')}</span>
                                    <span className="text-gray-400 text-sm ml-1">₺ / gün</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400">Depozito</span>
                                    <p className="font-bold text-gray-700">{(product.price * 5).toLocaleString('tr-TR')} ₺</p>
                                </div>
                            </div>

                            {/* Date Picker */}
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <CalendarDaysIcon className="h-4 w-4 text-primary" />
                                    Kiralama Tarihleri
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Başlangıç</label>
                                        <input type="date"
                                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Bitiş</label>
                                        <input type="date"
                                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                            min={startDate || new Date().toISOString().split('T')[0]}
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-5">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{product.price.toLocaleString('tr-TR')} ₺ × {days} gün</span>
                                    <span>{totalPrice.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Depozito (iade edilir)</span>
                                    <span>{(product.price * 5).toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                                    <span>Toplam Tutar</span>
                                    <span className="text-primary text-lg">{totalPrice.toLocaleString('tr-TR')} ₺</span>
                                </div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-primary text-white py-4 rounded-xl font-black text-base hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-200 mb-3"
                            >
                                🛒  Kiralamayı Başlat
                            </button>

                            {/* Share */}
                            <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
                                <span className="text-xs text-gray-400">Paylaş:</span>
                                <button onClick={() => window.open(`https://wa.me/?text=Bu ürüne baksana: ${window.location.href}`, '_blank')}
                                    className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform">
                                    Wp
                                </button>
                                <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=Bu ürüne baksana&url=${window.location.href}`, '_blank')}
                                    className="w-8 h-8 rounded-full bg-sky-400 text-white flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform">
                                    Tw
                                </button>
                                <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
                                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform">
                                    Fb
                                </button>
                            </div>
                        </div>

                        {/* Seller Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide text-gray-500">Satıcı</h3>
                            <div className="flex items-center gap-4 mb-5">
                                {/* Avatar */}
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-green-700 flex items-center justify-center text-white text-xl font-black flex-shrink-0 shadow-md shadow-green-100">
                                    {seller?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-lg truncate">{seller?.name || 'Satıcı'}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                        <ShieldCheckIcon className="h-3.5 w-3.5 text-green-500" />
                                        <span>Onaylı Hesap</span>
                                        {seller?.memberSince && <span>· {seller.memberSince}'den beri üye</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="text-xl font-black text-gray-900">{seller?.listingCount ?? 1}</p>
                                    <p className="text-xs text-gray-500">İlan</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="text-xl font-black text-green-500">✓</p>
                                    <p className="text-xs text-gray-500">Hızlı Yanıt</p>
                                </div>
                            </div>

                            {/* Contact Buttons */}
                            <div className="space-y-3">
                                {seller?.phone && (
                                    <a href={`tel:${seller.phone}`}
                                        className="flex items-center justify-center gap-2 w-full border-2 border-primary text-primary py-3 rounded-xl font-bold hover:bg-green-50 transition-colors">
                                        <PhoneIcon className="h-4 w-4" />
                                        Ara
                                    </a>
                                )}
                                <button
                                    onClick={() => window.open(`https://wa.me/?text=Merhaba, "${product.title}" ilanınız hakkında bilgi almak istiyorum.`, '_blank')}
                                    className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-sm shadow-green-100">
                                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.027.507 3.934 1.397 5.61L.047 23.955l6.545-1.328A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 01-5.126-1.446l-.368-.218-3.813.774.8-3.72-.242-.38A9.77 9.77 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z" /></svg>
                                    WhatsApp ile Yaz
                                </button>
                                <button
                                    onClick={() => alert('Mesaj sistemi yakında!')}
                                    className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm">
                                    <ChatBubbleLeftIcon className="h-4 w-4" />
                                    Mesaj Gönder
                                </button>
                            </div>
                        </div>

                        {/* Safety Badge */}
                        <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
                            <div className="flex items-start gap-3">
                                <ShieldCheckIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-green-800 text-sm">Güvenli Kiralama</p>
                                    <p className="text-xs text-green-700 mt-1 leading-relaxed">
                                        Tüm işlemler Sivas Kirala güvencesi altındadır. Sorun yaşarsanız destek ekibimizle iletişime geçin.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Review Modal */}
            {currentUser && isReviewModalOpen && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    productId={product.id}
                    productTitle={product.title}
                    userId={currentUser.uid}
                    userName={currentUser.displayName || 'Kullanıcı'}
                    onReviewSubmitted={() => setIsReviewModalOpen(false)}
                />
            )}

            <Footer />
        </div>
    );
}
