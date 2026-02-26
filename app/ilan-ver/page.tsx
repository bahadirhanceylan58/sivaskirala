'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/Map/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">Harita yükleniyor...</div>
});

export default function AddItemPage() {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const router = useRouter();

    // Default location: Sivas Center
    const [location, setLocation] = useState<{ lat: number, lng: number }>({ lat: 39.7505, lng: 37.0150 });

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const initAuth = async () => {
            try {
                const { auth } = await import('@/lib/firebase');
                const { onAuthStateChanged } = await import('firebase/auth');
                unsubscribe = onAuthStateChanged(auth, (user) => {
                    if (!user) {
                        router.push('/giris-yap');
                    } else {
                        setCurrentUser(user);
                    }
                });
            } catch (err) {
                console.error('Auth başlatma hatası:', err);
                router.push('/giris-yap');
            }
        };

        initAuth();
        return () => { if (unsubscribe) unsubscribe(); };
    }, [router]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImageFiles([...imageFiles, ...files]);
            setImagePreviews([...imagePreviews, ...newPreviews]);
        }
    };

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Elektronik');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Guard: user must be logged in
        if (!currentUser) {
            alert('İlan vermek için önce giriş yapmalısınız!');
            router.push('/giris-yap');
            return;
        }

        setLoading(true);

        try {
            // Refresh auth token to ensure it hasn't expired
            const { getAuth } = await import('firebase/auth');
            const auth = getAuth();
            const freshUser = auth.currentUser;
            if (!freshUser) {
                alert('Oturum süresi dolmuş, lütfen tekrar giriş yapın.');
                router.push('/giris-yap');
                return;
            }
            await freshUser.getIdToken(true); // force refresh

            const { db } = await import('@/lib/firebase');
            const { collection, addDoc } = await import('firebase/firestore');

            // 1. Upload ALL Images
            const uploadedUrls: string[] = [];
            if (imageFiles.length > 0) {
                try {
                    const { storage } = await import('@/lib/firebase');
                    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

                    for (const file of imageFiles) {
                        try {
                            const storageRef = ref(storage, `products/${freshUser.uid}/${Date.now()}_${file.name}`);
                            const timeoutPromise = new Promise<never>((_, reject) =>
                                setTimeout(() => reject(new Error('Yükleme zaman aşımına uğradı')), 15000)
                            );
                            const snapshot = await Promise.race([uploadBytes(storageRef, file), timeoutPromise]);
                            const url = await getDownloadURL(snapshot.ref);
                            uploadedUrls.push(url);
                        } catch (fileErr: any) {
                            console.warn(`Fotoğraf atlandı (${file.name}):`, fileErr?.message);
                        }
                    }
                } catch (uploadError: any) {
                    console.warn('Storage başlatma hatası:', uploadError?.message);
                }
            }

            const mainImage = uploadedUrls.length > 0 ? uploadedUrls[0] : '/placeholder-product.png';
            const allImages = uploadedUrls.length > 0 ? uploadedUrls : ['/placeholder-product.png'];

            // 2. Save to Firestore
            await addDoc(collection(db, 'products'), {
                title,
                description,
                price: parseFloat(price) || 0,
                category,
                image: mainImage,
                images: allImages,
                owner_email: freshUser.email || '',
                ownerId: freshUser.uid,
                status: 'pending',
                location: 'Sivas Merkez',
                lat: location.lat,
                lng: location.lng,
                created_at: new Date().toISOString()
            });

            alert('İlanınız başarıyla gönderildi ve onay için beklemeye alındı!');
            router.push('/hesabim');

        } catch (error: any) {
            console.error('İlan gönderme hatası:', error?.code, error?.message);
            alert('Hata (' + (error?.code || 'bilinmeyen') + '): ' + (error?.message || 'Lütfen tekrar deneyiniz.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni İlan Ekle</h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Fotoğrafları</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imagePreviews.map((img, idx) => (
                                    <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
                                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                                    <span className="text-xs text-gray-500 mt-2">Fotoğraf Ekle</span>
                                    <input type="file" multiple className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">İlan Başlığı</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Örn: Sony Kamera Seti"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                <select
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    <option>Elektronik</option>
                                    <option>Organizasyon & Düğün</option>
                                    <option>Abiye & Giyim</option>
                                    <option>Kamp & Outdoor</option>
                                    <option>Diğer</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                            <textarea
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Ürününüzü detaylıca anlatın..."
                                required
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Günlük Fiyat (₺)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="0.00"
                                    required
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Depozito (₺)</label>
                                <input type="number" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" placeholder="0.00" />
                            </div>
                        </div>

                        {/* Map Location Picker */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Konum Seçimi</label>
                            <div className="h-64 rounded-xl overflow-hidden border border-gray-300" style={{ isolation: 'isolate', position: 'relative', zIndex: 0 }}>
                                <LocationPicker onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {location.lat ? `Seçilen Konum: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Lütfen harita üzerinden ürünün teslim edileceği konumu seçin.'}
                            </p>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button type="submit" disabled={loading} className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-secondary transition-transform hover:scale-105 shadow-md shadow-green-100">
                                {loading ? 'Yükleniyor...' : 'İlanı Yayınla'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
