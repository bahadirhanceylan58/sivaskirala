'use client';

import { useEffect, useState, type ComponentType } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReviewModal from '@/components/ReviewModal';
import {
    ShoppingBagIcon,
    HeartIcon,
    ChatBubbleLeftRightIcon,
    ClipboardDocumentListIcon,
    InboxIcon,
    ArrowRightOnRectangleIcon,
    ShieldCheckIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

type Tab = 'listings' | 'rentals' | 'favorites' | 'incoming' | 'messages';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [myProducts, setMyProducts] = useState<any[]>([]);
    const [myRentals, setMyRentals] = useState<any[]>([]);
    const [myFavorites, setMyFavorites] = useState<any[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [myConversations, setMyConversations] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>('listings');

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedReviewProduct, setSelectedReviewProduct] = useState<any>(null);

    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { auth, db } = await import('@/lib/firebase');
            const { onAuthStateChanged } = await import('firebase/auth');
            const { doc, getDoc, collection, query, where, getDocs, orderBy } = await import('firebase/firestore');

            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (!currentUser) { router.push('/giris-yap'); return; }

                let userData = { id: currentUser.uid, email: currentUser.email, fullName: currentUser.displayName || 'Kullanıcı', role: 'user' };
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        userData = { ...userData, ...data, fullName: data.full_name || userData.fullName };
                    }
                } catch (e) { console.error(e); }
                setUser(userData);

                // Listings
                try {
                    const q = query(collection(db, 'products'), where('ownerId', '==', currentUser.uid));
                    const snap = await getDocs(q);
                    setMyProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                } catch (e) { console.error(e); }

                // Rentals
                try {
                    const q = query(collection(db, 'bookings'), where('renterId', '==', currentUser.uid));
                    const snap = await getDocs(q);
                    setMyRentals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                } catch (e) { console.error(e); }

                // Incoming
                try {
                    const q = query(collection(db, 'bookings'), where('ownerId', '==', currentUser.uid));
                    const snap = await getDocs(q);
                    setIncomingRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                } catch (e) { console.error(e); }

                // Favorites
                try {
                    const q = query(collection(db, 'favorites'), where('userId', '==', currentUser.uid));
                    const snap = await getDocs(q);
                    setMyFavorites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                } catch (e) { console.error(e); }

                // Conversations
                try {
                    const [buyerSnap, sellerSnap] = await Promise.all([
                        getDocs(query(collection(db, 'conversations'), where('buyerId', '==', currentUser.uid))),
                        getDocs(query(collection(db, 'conversations'), where('sellerId', '==', currentUser.uid))),
                    ]);
                    const convMap = new Map<string, any>();
                    [...buyerSnap.docs, ...sellerSnap.docs].forEach(d => {
                        const data = d.data();
                        convMap.set(d.id, {
                            id: d.id, ...data,
                            isBuyer: data.buyerId === currentUser.uid,
                            lastMessageAt: data.lastMessageAt?.toDate?.()?.toISOString() || '',
                        });
                    });
                    const sorted = Array.from(convMap.values()).sort(
                        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
                    );
                    setMyConversations(sorted);
                } catch (e) { console.error(e); }
            });
            return () => unsubscribe();
        };
        checkUser();
    }, [router]);

    const handleLogout = async () => {
        const { auth } = await import('@/lib/firebase');
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        window.location.href = '/';
    };

    const pendingListings = myProducts.filter(p => p.status === 'pending').length;
    const unreadMessages = myConversations.reduce((s, c) => s + (c.isBuyer ? (c.unreadBuyer || 0) : (c.unreadSeller || 0)), 0);

    if (!user) return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </main>
            <Footer />
        </div>
    );

    const TABS: { id: Tab; label: string; icon: ComponentType<{ className?: string }>; count?: number; badge?: boolean }[] = [
        { id: 'listings', label: 'İlanlarım', icon: ClipboardDocumentListIcon, count: myProducts.length },
        { id: 'incoming', label: 'Gelen Talepler', icon: InboxIcon, count: incomingRequests.length, badge: incomingRequests.filter(r => r.status === 'pending').length > 0 },
        { id: 'rentals', label: 'Kiraladıklarım', icon: ShoppingBagIcon, count: myRentals.length },
        { id: 'favorites', label: 'Favorilerim', icon: HeartIcon, count: myFavorites.length },
        { id: 'messages', label: 'Mesajlarım', icon: ChatBubbleLeftRightIcon, count: myConversations.length, badge: unreadMessages > 0 },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Hesabım</h1>
                    <Link href="/ilan-ver" className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md shadow-green-100">
                        <PlusCircleIcon className="h-5 w-5" />
                        Yeni İlan Ver
                    </Link>
                </div>

                {/* Profile + Stats Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        {/* Avatar */}
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-green-700 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-green-200 flex-shrink-0">
                            {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="bg-green-50 text-primary px-3 py-0.5 rounded-full text-xs font-bold">
                                    {user.role === 'admin' ? '🛡️ Yönetici' : '✓ Üye'}
                                </span>
                                {pendingListings > 0 && (
                                    <span className="bg-orange-50 text-orange-600 px-3 py-0.5 rounded-full text-xs font-bold">
                                        ⏳ {pendingListings} ilan onay bekliyor
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {(user.email === 'bahadirhanceylan@gmail.com' || user.role === 'admin') && (
                                <Link href="/admin"
                                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm">
                                    <ShieldCheckIcon className="w-4 h-4" />
                                    Yönetim
                                </Link>
                            )}
                            <button onClick={handleLogout}
                                className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition-colors px-3 py-2 hover:bg-red-50 rounded-xl text-sm">
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                Çıkış
                            </button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
                        {[
                            { label: 'İlanım', value: myProducts.length, color: 'text-primary' },
                            { label: 'Kiralamam', value: myRentals.length, color: 'text-blue-500' },
                            { label: 'Favorim', value: myFavorites.length, color: 'text-red-400' },
                            { label: 'Mesajım', value: myConversations.length, color: 'text-purple-500' },
                        ].map(stat => (
                            <div key={stat.label} className="text-center">
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-gray-200 mb-6">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 pb-3 px-3 whitespace-nowrap font-semibold text-sm transition-colors relative flex-shrink-0 ${activeTab === tab.id ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {(tab.count ?? 0) > 0 && (
                                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${tab.badge ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                    {tab.id === 'messages' && unreadMessages > 0 ? unreadMessages : tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
                        </button>
                    ))}
                </div>

                {/* ===== TAB: İlanlarım ===== */}
                {activeTab === 'listings' && (
                    myProducts.length === 0 ? (
                        <EmptyState emoji="📦" title="Henüz ilan vermediniz" desc="İlk ilanınızı oluşturarak kazanmaya başlayın." link="/ilan-ver" linkText="Hemen İlan Ver" />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {myProducts.map(product => (
                                <div key={product.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group relative">
                                    <Link href={`/ilan/${product.id}`} className="absolute inset-0 z-0" />
                                    <div className="h-44 bg-gray-100 relative">
                                        {product.image
                                            ? <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                                        }
                                        <span className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-bold ${product.status === 'active' ? 'bg-green-100 text-green-700' : product.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-600'}`}>
                                            {product.status === 'active' ? '✅ Yayında' : product.status === 'pending' ? '⏳ Onay Bekliyor' : '⛔ Pasif'}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{product.title}</h3>
                                        <p className="text-primary font-bold text-sm mt-1">{product.price?.toLocaleString('tr-TR')} ₺ <span className="text-gray-400 font-normal">/ gün</span></p>
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{product.category}</span>
                                            <Link href={`/ilan-duzenle/${product.id}`}
                                                className="relative z-10 text-xs text-blue-500 font-bold hover:underline">
                                                Düzenle
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* ===== TAB: Gelen Talepler ===== */}
                {activeTab === 'incoming' && (
                    incomingRequests.length === 0 ? (
                        <EmptyState emoji="📬" title="Henüz gelen talep yok" desc="İlanlarınıza kiralama talebi geldiğinde burada görünecek." />
                    ) : (
                        <div className="space-y-4">
                            {incomingRequests.map(req => (
                                <div key={req.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {req.productImage
                                                ? <img src={req.productImage} alt="" className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                                <h3 className="font-bold text-gray-900">{req.productTitle}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'approved' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {req.status === 'approved' ? '✅ Onaylandı' : req.status === 'rejected' ? '❌ Reddedildi' : '⏳ Beklemede'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                                                <div><span className="text-gray-400 text-xs">Talep Eden</span><br /><strong>{req.renterFirstName} {req.renterLastName}</strong></div>
                                                <div><span className="text-gray-400 text-xs">Tarih</span><br /><strong>{req.startDate ? new Date(req.startDate).toLocaleDateString('tr-TR') : '-'} → {req.endDate ? new Date(req.endDate).toLocaleDateString('tr-TR') : '-'}</strong></div>
                                                <div><span className="text-gray-400 text-xs">Toplam</span><br /><strong className="text-primary">{req.totalPrice?.toLocaleString('tr-TR')} ₺</strong></div>
                                            </div>
                                            {req.status === 'pending' && (
                                                <div className="flex gap-2 flex-wrap">
                                                    <button onClick={async () => {
                                                        const { db } = await import('@/lib/firebase');
                                                        const { doc, updateDoc } = await import('firebase/firestore');
                                                        await updateDoc(doc(db, 'bookings', req.id), { status: 'approved' });
                                                        setIncomingRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
                                                        toast.success('Talep onaylandı!');
                                                    }} className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">
                                                        ✅ Onayla
                                                    </button>
                                                    <button onClick={async () => {
                                                        const { db } = await import('@/lib/firebase');
                                                        const { doc, updateDoc } = await import('firebase/firestore');
                                                        await updateDoc(doc(db, 'bookings', req.id), { status: 'rejected' });
                                                        setIncomingRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r));
                                                        toast.error('Talep reddedildi.');
                                                    }} className="border border-red-200 text-red-500 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors">
                                                        ❌ Reddet
                                                    </button>
                                                    {req.renterPhone && (
                                                        <a href={`tel:${req.renterPhone}`} className="border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                                            📞 Ara
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* ===== TAB: Kiraladıklarım ===== */}
                {activeTab === 'rentals' && (
                    myRentals.length === 0 ? (
                        <EmptyState emoji="🛒" title="Henüz kiralama yapmadınız" desc="İhtiyacınız olan ürünleri keşfetmeye başlayın." link="/arama" linkText="Ürünleri Keşfet" />
                    ) : (
                        <div className="space-y-4">
                            {myRentals.map(rental => (
                                <div key={rental.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {rental.productImage
                                                ? <img src={rental.productImage} alt="" className="w-full h-full object-cover" />
                                                : <span className="w-full h-full flex items-center justify-center text-2xl">📄</span>}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{rental.productTitle}</h3>
                                            <p className="text-sm text-gray-500">
                                                {rental.startDate ? new Date(rental.startDate).toLocaleDateString('tr-TR') : ''} →{' '}
                                                {rental.endDate ? new Date(rental.endDate).toLocaleDateString('tr-TR') : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-bold text-gray-900 text-lg">{rental.totalPrice?.toLocaleString('tr-TR')} ₺</p>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${rental.status === 'approved' ? 'bg-green-100 text-green-700' : rental.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {rental.status === 'approved' ? 'Onaylandı' : rental.status === 'pending' ? 'Beklemede' : rental.status}
                                            </span>
                                            {rental.status === 'approved' && (
                                                <button onClick={() => { setSelectedReviewProduct(rental); setIsReviewModalOpen(true); }}
                                                    className="text-xs text-primary font-bold hover:underline">
                                                    Yorum Yap
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* ===== TAB: Favorilerim ===== */}
                {activeTab === 'favorites' && (
                    myFavorites.length === 0 ? (
                        <EmptyState emoji="❤️" title="Henüz favori eklemediniz" desc="Beğendiğiniz ürünleri favorilerinize ekleyerek takip edin." link="/arama" linkText="Ürünleri Keşfet" />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {myFavorites.map(fav => (
                                <div key={fav.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group relative">
                                    <button onClick={async () => {
                                        const { db } = await import('@/lib/firebase');
                                        const { doc, deleteDoc } = await import('firebase/firestore');
                                        await deleteDoc(doc(db, 'favorites', fav.id));
                                        setMyFavorites(prev => prev.filter(f => f.id !== fav.id));
                                        toast.success('Favorilerden kaldırıldı.');
                                    }} className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-white transition-colors shadow-sm" title="Favorilerden kaldır">
                                        ✕
                                    </button>
                                    <Link href={`/ilan/${fav.productId}`} className="block">
                                        <div className="h-40 bg-gray-100">
                                            {fav.product?.image
                                                ? <img src={fav.product.image} alt={fav.product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                : <div className="flex items-center justify-center h-full text-4xl">📦</div>}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors truncate">{fav.product?.title || 'Ürün'}</h3>
                                            <p className="text-primary font-bold text-sm mt-1">{fav.product?.price?.toLocaleString('tr-TR')} ₺ <span className="text-gray-400 font-normal">/ gün</span></p>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* ===== TAB: Mesajlarım ===== */}
                {activeTab === 'messages' && (
                    myConversations.length === 0 ? (
                        <EmptyState emoji="💬" title="Henüz mesajınız yok" desc="Bir ilan sayfasında satıcıya mesaj gönderin." link="/arama" linkText="İlanları Keşfet" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
                            {myConversations.map(conv => {
                                const unread = conv.isBuyer ? (conv.unreadBuyer || 0) : (conv.unreadSeller || 0);
                                const formatTime = (iso: string) => {
                                    if (!iso) return '';
                                    const d = new Date(iso);
                                    const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
                                    if (diffDays === 0) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                                    if (diffDays === 1) return 'Dün';
                                    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
                                };
                                return (
                                    <Link key={conv.id} href={`/mesajlar/${conv.id}`}
                                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                                            {conv.productImage
                                                ? <img src={conv.productImage} alt={conv.productTitle} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }} />
                                                : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-gray-900 text-sm truncate">{conv.productTitle}</p>
                                                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                                            </div>
                                            <p className={`text-sm truncate mt-0.5 ${unread > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                                {conv.lastMessage || 'Konuşma başladı'}
                                            </p>
                                        </div>
                                        {unread > 0 && (
                                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-[10px] font-bold">{unread}</span>
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )
                )}
            </main>

            {selectedReviewProduct && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    productId={selectedReviewProduct.productId || selectedReviewProduct.product_id}
                    productTitle={selectedReviewProduct.productTitle || selectedReviewProduct.product_title}
                    userId={user.id}
                    userName={user.fullName}
                    onReviewSubmitted={() => setIsReviewModalOpen(false)}
                />
            )}

            <Footer />
        </div>
    );
}

function EmptyState({ emoji, title, desc, link, linkText }: { emoji: string; title: string; desc: string; link?: string; linkText?: string }) {
    return (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="text-5xl mb-4">{emoji}</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm mb-6">{desc}</p>
            {link && linkText && (
                <Link href={link} className="inline-block bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors">
                    {linkText}
                </Link>
            )}
        </div>
    );
}
