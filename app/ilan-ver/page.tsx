'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function AddItemPage() {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { auth } = await import('@/lib/firebase');
            const { onAuthStateChanged } = await import('firebase/auth');
            onAuthStateChanged(auth, (user) => {
                if (!user) {
                    alert('İlan vermek için önce giriş yapmalısınız!');
                    router.push('/giris-yap');
                } else {
                    setCurrentUser(user);
                }
            });
        };
        checkAuth();
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
        setLoading(true);

        try {
            if (!currentUser) return;

            const { db, storage } = await import('@/lib/firebase');
            const { collection, addDoc } = await import('firebase/firestore');
            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

            // 1. Upload Images
            let imageUrl = 'https://via.placeholder.com/400'; // Default placeholder
            if (imageFiles.length > 0) {
                const file = imageFiles[0]; // For now just take the first one as main image
                const storageRef = ref(storage, `products/${currentUser.uid}/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            // 2. Save to Firestore
            await addDoc(collection(db, "products"), {
                title,
                description,
                price: parseFloat(price),
                category,
                image: imageUrl,
                images: [imageUrl], // Future proofing for multiple images
                owner_id: currentUser.uid,
                owner_email: currentUser.email,
                status: 'pending', // Requires admin approval
                location: 'Sivas Merkez',
                created_at: new Date().toISOString()
            });

            alert('İlanınız başarıyla gönderildi ve onay için beklemeye alındı!');
            router.push('/hesabim');

        } catch (error: any) {
            console.error(error);
            alert('Bir hata oluştu: ' + (error.message || JSON.stringify(error)));
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
