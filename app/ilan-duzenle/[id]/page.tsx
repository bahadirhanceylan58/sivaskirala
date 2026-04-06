'use client';

import { useEffect, useState, use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '38', '40', '42', '44', '46', '48'];

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    type ImageItem = { url: string; file?: File };

    const [images, setImages] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        const fetchProduct = async () => {
            const { auth, db } = await import('@/lib/firebase');
            const { onAuthStateChanged } = await import('firebase/auth');
            const { doc, getDoc } = await import('firebase/firestore');

            onAuthStateChanged(auth, async (user) => {
                if (!user) { window.location.href = '/giris-yap'; return; }

                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) { toast.error('İlan bulunamadı.'); window.location.href = '/hesabim'; return; }

                const data = docSnap.data();
                if (data.ownerId !== user.uid) { toast.error('Bu ilanı düzenleme yetkiniz yok.'); window.location.href = '/hesabim'; return; }

                setTitle(data.title || '');
                setDescription(data.description || '');
                setPrice(String(data.price || ''));
                setDeposit(String(data.deposit || ''));
                setCategory(data.category || 'elektronik');
                setCondition(data.condition || 'good');
                setDeliveryMethod(data.deliveryMethod || 'in-person');
                setMinRental(String(data.minRental || '1'));
                setFeatures(data.features || []);
                setSizes(data.sizes || []);
                setColors(data.colors || []);

                const existing: ImageItem[] = [];
                if (data.image) existing.push({ url: data.image });
                if (data.images && Array.isArray(data.images)) {
                    data.images.forEach((url: string) => {
                        if (!existing.some(i => i.url === url)) existing.push({ url });
                    });
                }
                setImages(existing);
                setLoading(false);
            });
        };
        fetchProduct();
    }, [id]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newItems = Array.from(e.target.files).map(file => ({
                url: URL.createObjectURL(file),
                file,
            }));
            setImages(prev => [...prev, ...newItems]);
        }
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
        setSubmitting(true);

        try {
            const { db, storage } = await import('@/lib/firebase');
            const { doc, updateDoc } = await import('firebase/firestore');
            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
            const { auth } = await import('@/lib/firebase');

            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const finalUrls: string[] = [];
            for (const img of images) {
                if (img.file) {
                    const storageRef = ref(storage, `products/${currentUser.uid}/${Date.now()}_${img.file.name}`);
                    const snapshot = await uploadBytes(storageRef, img.file);
                    finalUrls.push(await getDownloadURL(snapshot.ref));
                } else {
                    finalUrls.push(img.url);
                }
            }

            await updateDoc(doc(db, 'products', id), {
                title,
                description,
                price: parseFloat(price),
                deposit: parseFloat(deposit) || 0,
                category,
                condition,
                deliveryMethod,
                minRental: parseInt(minRental),
                image: finalUrls[0] || '',
                images: finalUrls,
                features,
                sizes: isClothing ? sizes : [],
                colors: isClothing ? colors : [],
            });

            toast.success('İlan başarıyla güncellendi!');
            window.location.href = '/hesabim';
        } catch (error) {
            console.error(error);
            toast.error('Hata: ' + getErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            const { db } = await import('@/lib/firebase');
            const { doc, deleteDoc } = await import('firebase/firestore');
            await deleteDoc(doc(db, 'products', id));
            toast.success('İlan silindi.');
            window.location.href = '/hesabim';
        } catch (error) {
            toast.error('Silme hatası: ' + getErrorMessage(error));
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center text-gray-500">Yükleniyor...</div>
            <Footer />
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">İlanı Düzenle</h1>
                        <button type="button" onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm font-medium hover:underline">
                            <TrashIcon className="h-4 w-4" /> İlanı Sil
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Fotoğraflar */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Fotoğrafları</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                                        <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                            ×
                                        </button>
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
                                    placeholder="Örn: Sony Kamera Seti" required value={title} onChange={e => setTitle(e.target.value)} />
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
                                        <button key={opt.value} type="button" onClick={() => setCondition(opt.value)}
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
                                        <button key={opt.value} type="button" onClick={() => setDeliveryMethod(opt.value)}
                                            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${deliveryMethod === opt.value
                                                ? 'bg-primary text-white border-primary'
                                                : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Abiye & Giyim — Beden + Renk */}
                        {isClothing && (
                            <div className="p-5 bg-purple-50 border border-purple-100 rounded-xl space-y-5">
                                <h3 className="font-semibold text-purple-900 text-sm">👗 Giyim Detayları</h3>

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
                                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder={isClothing ? 'Örn: İpek kumaş, Sırt dekolteli' : 'Örn: 4K Video, Bluetooth'}
                                    value={newFeature} onChange={e => setNewFeature(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                                <button type="button" onClick={addFeature}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                                    Ekle
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {features.map((f, i) => (
                                    <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        {f}
                                        <button type="button" onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                                            className="hover:text-blue-900 border-l border-blue-200 pl-2">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                            <button type="button" onClick={() => window.location.href = '/hesabim'}
                                className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                                İptal
                            </button>
                            <button type="submit" disabled={submitting}
                                className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition-transform hover:scale-105 shadow-md shadow-green-100 disabled:opacity-60">
                                {submitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-sm w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">İlanı Sil?</h3>
                        <p className="text-gray-500 mb-6">Bu ilanı silmek istediğinize emin misiniz? Geri alınamaz.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium">
                                Vazgeç
                            </button>
                            <button onClick={handleDelete}
                                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium">
                                Evet, Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
