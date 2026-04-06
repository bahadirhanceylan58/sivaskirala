'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/Map/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">Harita yükleniyor...</div>
});

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '38', '40', '42', '44', '46', '48'];

export default function AddItemPage() {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ uid: string; email: string | null } | null>(null);
    const router = useRouter();

    const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 39.7505, lng: 37.0150 });

    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [deposit, setDeposit] = useState('');
    const [category, setCategory] = useState('elektronik');
    const [condition, setCondition] = useState('good');
    const [deliveryMethod, setDeliveryMethod] = useState('in-person');
    const [minRental, setMinRental] = useState('1');

    // Dynamic fields
    const [features, setFeatures] = useState<string[]>([]);
    const [newFeature, setNewFeature] = useState('');
    const [sizes, setSizes] = useState<string[]>([]);
    const [colors, setColors] = useState<string[]>([]);
    const [newColor, setNewColor] = useState('');

    const isClothing = category === 'abiye-giyim';

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;
        const initAuth = async () => {
            try {
                const { auth } = await import('@/lib/firebase');
                const { onAuthStateChanged } = await import('firebase/auth');
                unsubscribe = onAuthStateChanged(auth, (user) => {
                    if (!user) router.push('/giris-yap');
                    else setCurrentUser(user);
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
            setImageFiles(prev => [...prev, ...files]);
            setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
        }
    };

    const removeImage = (idx: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== idx));
        setImagePreviews(prev => {
            URL.revokeObjectURL(prev[idx]);
            return prev.filter((_, i) => i !== idx);
        });
    };

    const addFeature = () => {
        if (newFeature.trim()) { setFeatures(prev => [...prev, newFeature.trim()]); setNewFeature(''); }
    };

    const toggleSize = (size: string) => {
        setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
    };

    const addColor = () => {
        if (newColor.trim() && !colors.includes(newColor.trim())) {
            setColors(prev => [...prev, newColor.trim()]);
            setNewColor('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) { toast.error('Giriş yapmanız gerekiyor.'); router.push('/giris-yap'); return; }
        setLoading(true);

        try {
            const { getAuth } = await import('firebase/auth');
            const auth = getAuth();
            const freshUser = auth.currentUser;
            if (!freshUser) { toast.error('Oturum süresi dolmuş, lütfen tekrar giriş yapın.'); router.push('/giris-yap'); return; }
            await freshUser.getIdToken(true);

            const { db } = await import('@/lib/firebase');
            const { collection, addDoc } = await import('firebase/firestore');

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
                            uploadedUrls.push(await getDownloadURL(snapshot.ref));
                        } catch (fileErr) {
                            console.warn(`Fotoğraf atlandı (${file.name}):`, getErrorMessage(fileErr));
                        }
                    }
                } catch (uploadError) {
                    console.warn('Storage başlatma hatası:', getErrorMessage(uploadError));
                }
            }

            const mainImage = uploadedUrls[0] || '/placeholder-product.png';

            await addDoc(collection(db, 'products'), {
                title,
                description,
                price: parseFloat(price) || 0,
                deposit: parseFloat(deposit) || 0,
                category,
                condition,
                deliveryMethod,
                minRental: parseInt(minRental),
                features,
                sizes: isClothing ? sizes : [],
                colors: isClothing ? colors : [],
                image: mainImage,
                images: uploadedUrls.length > 0 ? uploadedUrls : [mainImage],
                owner_email: freshUser.email || '',
                ownerId: freshUser.uid,
                status: 'pending',
                location: 'Sivas Merkez',
                lat: location.lat,
                lng: location.lng,
                created_at: new Date().toISOString(),
            });

            toast.success('İlanınız gönderildi ve onay için beklemeye alındı!');
            router.push('/hesabim');
        } catch (error) {
            console.error('İlan gönderme hatası:', error);
            toast.error('Hata: ' + getErrorMessage(error));
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

                        {/* Fotoğraflar */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Fotoğrafları</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imagePreviews.map((img, idx) => (
                                    <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                            <XMarkIcon className="h-3.5 w-3.5" />
                                        </button>
                                        {idx === 0 && (
                                            <span className="absolute bottom-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Ana</span>
                                        )}
                                    </div>
                                ))}
                                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
                                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                                    <span className="text-xs text-gray-500 mt-2">Fotoğraf Ekle</span>
                                    <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        {/* Başlık + Kategori */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">İlan Başlığı</label>
                                <input type="text"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Örn: Kırmızı Abiye Elbise"
                                    required value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                    value={category} onChange={e => setCategory(e.target.value)}>
                                    <option value="organizasyon">Organizasyon & Düğün</option>
                                    <option value="ses-goruntu">Ses & Görüntü</option>
                                    <option value="abiye-giyim">Abiye & Giyim</option>
                                    <option value="kamera">Fotoğraf & Kamera</option>
                                    <option value="kamp">Kamp & Outdoor</option>
                                    <option value="elektronik">Elektronik</option>
                                    <option value="diger">Diğer</option>
                                </select>
                            </div>
                        </div>

                        {/* Açıklama */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                            <textarea rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Ürününüzü detaylıca anlatın..."
                                required value={description} onChange={e => setDescription(e.target.value)} />
                        </div>

                        {/* Fiyat + Depozito + Min Kiralama */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Günlük Fiyat (₺)</label>
                                <input type="number" min="0" step="0.01"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="0.00" required value={price} onChange={e => setPrice(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Depozito (₺)</label>
                                <input type="number" min="0" step="0.01"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="0.00" value={deposit} onChange={e => setDeposit(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Min. Kiralama</label>
                                <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                    value={minRental} onChange={e => setMinRental(e.target.value)}>
                                    <option value="1">1 Gün</option>
                                    <option value="2">2 Gün</option>
                                    <option value="3">3 Gün</option>
                                    <option value="7">Haftalık</option>
                                </select>
                            </div>
                        </div>

                        {/* Ürün Durumu + Teslimat */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Durumu</label>
                                <div className="flex gap-2">
                                    {[
                                        { value: 'new', label: 'Sıfır Gibi' },
                                        { value: 'good', label: 'İyi' },
                                        { value: 'fair', label: 'Orta' },
                                    ].map(opt => (
                                        <button key={opt.value} type="button"
                                            onClick={() => setCondition(opt.value)}
                                            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${condition === opt.value
                                                ? 'bg-primary text-white border-primary'
                                                : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Teslimat Yöntemi</label>
                                <div className="flex gap-2">
                                    {[
                                        { value: 'in-person', label: 'Elden' },
                                        { value: 'cargo', label: 'Kargo' },
                                        { value: 'both', label: 'Her İkisi' },
                                    ].map(opt => (
                                        <button key={opt.value} type="button"
                                            onClick={() => setDeliveryMethod(opt.value)}
                                            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${deliveryMethod === opt.value
                                                ? 'bg-primary text-white border-primary'
                                                : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Abiye & Giyim — Beden Seçimi */}
                        {isClothing && (
                            <div className="p-5 bg-purple-50 border border-purple-100 rounded-xl space-y-5">
                                <h3 className="font-semibold text-purple-900 text-sm">👗 Giyim Detayları</h3>

                                {/* Bedenler */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Bedenler</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CLOTHING_SIZES.map(size => (
                                            <button key={size} type="button" onClick={() => toggleSize(size)}
                                                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${sizes.includes(size)
                                                    ? 'bg-purple-600 text-white border-purple-600'
                                                    : 'border-gray-300 text-gray-600 hover:border-purple-400'}`}>
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                    {sizes.length > 0 && (
                                        <p className="text-xs text-purple-600 mt-2">Seçili: {sizes.join(', ')}</p>
                                    )}
                                </div>

                                {/* Renkler */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Renkler</label>
                                    <div className="flex gap-2 mb-2">
                                        <input type="text"
                                            className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                                            placeholder="Örn: Bordo, Lacivert"
                                            value={newColor} onChange={e => setNewColor(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())} />
                                        <button type="button" onClick={addColor}
                                            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200">
                                            Ekle
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {colors.map((c, i) => (
                                            <span key={i} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1.5">
                                                {c}
                                                <button type="button" onClick={() => setColors(colors.filter((_, j) => j !== i))}
                                                    className="hover:text-purple-900">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Ürün Özellikleri */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Özellikleri <span className="text-gray-400 font-normal">(opsiyonel)</span></label>
                            <div className="flex gap-2 mb-3">
                                <input type="text"
                                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    placeholder={isClothing ? 'Örn: İpek kumaş, Sırt dekolteli' : 'Örn: 4K Video, Bluetooth'}
                                    value={newFeature} onChange={e => setNewFeature(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                                <button type="button" onClick={addFeature}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                                    Ekle
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {features.map((f, i) => (
                                    <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1.5">
                                        {f}
                                        <button type="button" onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                                            className="hover:text-blue-900">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Konum */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Konum Seçimi</label>
                            <div className="h-64 rounded-xl overflow-hidden border border-gray-300" style={{ isolation: 'isolate', position: 'relative', zIndex: 0 }}>
                                <LocationPicker onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {location.lat
                                    ? `Seçilen Konum: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                                    : 'Harita üzerinden ürünün teslim edileceği konumu seçin.'}
                            </p>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button type="submit" disabled={loading}
                                className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition-transform hover:scale-105 shadow-md shadow-green-100 disabled:opacity-60">
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
