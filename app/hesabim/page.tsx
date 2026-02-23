'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
// Remove MockService
// import { User, Product, MockService } from '@/lib/mock-service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReviewModal from '@/components/ReviewModal';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [myProducts, setMyProducts] = useState<any[]>([]);
    const [myRentals, setMyRentals] = useState<any[]>([]);
    const [myFavorites, setMyFavorites] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'listings' | 'rentals' | 'favorites'>('listings');

    // Review State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedReviewProduct, setSelectedReviewProduct] = useState<any>(null);

    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { auth, db } = await import('@/lib/firebase');
            const { onAuthStateChanged, signOut } = await import('firebase/auth');
            const { doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');

            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (!currentUser) {
                    router.push('/giris-yap');
                    return;
                }

                // Get extended profile
                let userData = {
                    id: currentUser.uid,
                    email: currentUser.email,
                    fullName: currentUser.displayName || 'Kullanıcı',
                    role: 'user'
                };

                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        userData = { ...userData, ...data, fullName: data.full_name || userData.fullName };
                    }
                } catch (e) {
                    console.error("Error fetching user profile", e);
                }

                setUser(userData);

                // Fetch Listings (Products owned by user)
                try {
                    const q = query(collection(db, "products"), where("ownerId", "==", currentUser.uid));
                    const querySnapshot = await getDocs(q);
                    const listings: any[] = [];
                    querySnapshot.forEach((doc) => {
                        listings.push({ id: doc.id, ...doc.data() });
                    });
                    setMyProducts(listings);
                } catch (e) {
                    console.error("Error fetching listings", e);
                }

                // Fetch Rentals (Bookings made by user)
                try {
                    const qRentals = query(collection(db, "bookings"), where("renterId", "==", currentUser.uid));
                    const rentalsSnapshot = await getDocs(qRentals);
                    const rentals: any[] = [];
                    rentalsSnapshot.forEach((doc) => {
                        rentals.push({ id: doc.id, ...doc.data() });
                    });
                    setMyRentals(rentals);
                } catch (e) {
                    console.error("Error fetching rentals", e);
                }
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

    if (!user) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Hesabım</h1>
                    <Link href="/ilan-ver" className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md shadow-green-100">
                        + Yeni İlan Ver
                    </Link>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex items-center space-x-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-primary text-3xl font-bold">
                        {user.fullName ? user.fullName.charAt(0) : 'U'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{user.fullName}</h2>
                        <p className="text-gray-500">{user.email}</p>
                        <div className="mt-2 flex gap-2">
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                                {user.role === 'admin' ? 'Yönetici' : 'Üye'}
                            </span>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        {/* Admin Panel Button — sadece admin için */}
                        {(user.email === 'bahadirhanceylan@gmail.com' || user.role === 'admin') && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                                Yönetim Paneli
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition-colors px-4 py-2 hover:bg-red-50 rounded-lg"
                        >
                            <span>Çıkış Yap</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-6 border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`pb-4 px-2 font-bold text-lg transition-colors relative ${activeTab === 'listings' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        İlanlarım ({myProducts.length})
                        {activeTab === 'listings' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('rentals')}
                        className={`pb-4 px-2 font-bold text-lg transition-colors relative ${activeTab === 'rentals' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Kiraladıklarım ({myRentals.length})
                        {activeTab === 'rentals' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'listings' ? (
                    myProducts.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                            <div className="text-4xl mb-4">📦</div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Henüz ilan vermediniz</h3>
                            <p className="text-gray-500 mb-6">İlk ilanınızı oluşturarak kazanmaya başlayın.</p>
                            <Link href="/ilan-ver" className="text-primary font-bold hover:underline">Hemen İlan Ver</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myProducts.map((product) => (
                                <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 block h-full group relative">
                                    <Link href={`/ilan/${product.id}`} className="absolute inset-0 z-0"></Link>
                                    <div className="h-48 bg-gray-200 relative pointer-events-none">
                                        {product.image ? (
                                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">Görsel Yok</div>
                                        )}
                                        <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {product.status === 'active' ? 'Yayında' : product.status}
                                        </span>
                                    </div>
                                    <div className="p-4 relative z-10 pointer-events-none">
                                        <h3 className="font-bold text-lg mb-1 text-gray-900 group-hover:text-primary transition-colors">{product.title}</h3>
                                        <p className="text-primary font-bold">{product.price} ₺ <span className="text-gray-400 font-normal text-xs">/ Gün</span></p>
                                        <div className="mt-3 flex justify-between items-center pointer-events-auto">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{product.category}</span>
                                            <div className="flex gap-3">
                                                <Link href={`/ilan-duzenle/${product.id}`} className="text-xs text-blue-500 hover:text-blue-700 hover:underline">
                                                    Düzenle
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : activeTab === 'rentals' ? (
                    myRentals.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                            <div className="text-4xl mb-4">🛒</div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Henüz kiralama yapmadınız</h3>
                            <p className="text-gray-500 mb-6">İhtiyacınız olan ürünleri keşfetmeye başlayın.</p>
                            <Link href="/" className="text-primary font-bold hover:underline">Ürünleri Keşfet</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myRentals.map((rental: any) => (
                                <div key={rental.id} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                            {rental.productImage ? (
                                                <img src={rental.productImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl">📄</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{rental.productTitle}</h3>
                                            <p className="text-sm text-gray-500">
                                                {rental.startDate ? new Date(rental.startDate).toLocaleDateString('tr-TR') : ''} -
                                                {rental.endDate ? new Date(rental.endDate).toLocaleDateString('tr-TR') : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-lg">{rental.totalPrice} ₺</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${rental.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    rental.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-600'}`}>
                                                {rental.status === 'approved' ? 'Onaylandı' : rental.status === 'pending' ? 'Beklemede' : rental.status}
                                            </span>
                                            {rental.status === 'approved' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedReviewProduct(rental);
                                                        setIsReviewModalOpen(true);
                                                    }}
                                                    className="text-xs text-primary font-bold hover:underline"
                                                >
                                                    Yorum Yap
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : ( // Favorites Tab
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myFavorites.length === 0 ? (
                            <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                                <div className="text-4xl mb-4">❤️</div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Henüz favorilere eklediğiniz ürün yok</h3>
                                <p className="text-gray-500 mb-6">Beğendiğiniz ürünleri favorilerinize ekleyerek kolayca takip edin.</p>
                                <Link href="/" className="text-primary font-bold hover:underline">Ürünleri Keşfet</Link>
                            </div>
                        ) : (
                            myFavorites.map((fav: any) => (
                                <div key={fav.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow relative group">
                                    <button
                                        onClick={async () => {
                                            if (!confirm('Favorilerden kaldırılsın mı?')) return;
                                            const { db } = await import('@/lib/firebase');
                                            const { doc, deleteDoc } = await import('firebase/firestore');
                                            await deleteDoc(doc(db, "favorites", fav.id));
                                            setMyFavorites((prev: any[]) => prev.filter((f: any) => f.id !== fav.id));
                                        }}
                                        className="absolute top-2 right-2 bg-white/50 hover:bg-white text-red-500 p-1.5 rounded-full z-10 transition-colors"
                                        title="Favorilerden Kaldır"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                        </svg>
                                    </button>
                                    <Link href={`/ilan/${fav.productId}`} className="block">
                                        <div className="h-40 bg-gray-100 relative">
                                            {fav.product?.image ? (
                                                <img src={fav.product.image} alt={fav.product.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 text-sm">Görsel Yok</div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 truncate">{fav.product?.title || 'Ürün'}</h3>
                                            <p className="text-gray-500 text-sm">{fav.product?.price} ₺ / Gün</p>
                                        </div>
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main >

            {/* Review Modal */}
            {selectedReviewProduct && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    productId={selectedReviewProduct.productId || selectedReviewProduct.product_id} // Adjust based on booking data structure
                    productTitle={selectedReviewProduct.productTitle || selectedReviewProduct.product_title}
                    userId={user.id}
                    userName={user.fullName}
                    onReviewSubmitted={() => {
                        setIsReviewModalOpen(false);
                        // Optionally refresh rentals to show "Reviewed" status if tracked
                    }}
                />
            )}

            <Footer />
        </div >
    );
}
