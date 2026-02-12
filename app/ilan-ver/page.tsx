'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function AddItemPage() {
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Simulation: Just showing standard placeholders for now
        if (e.target.files && e.target.files.length > 0) {
            const newImages = Array.from(e.target.files).map(() => URL.createObjectURL(e.target.files![0]));
            setImages([...images, ...newImages]);
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
            const { supabase } = await import('@/lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                alert('İlan vermek için önce giriş yapmalısınız!');
                window.location.href = '/giris-yap';
                return;
            }

            const { MockService } = await import('@/lib/mock-service');

            await MockService.addProduct({
                title,
                category,
                price: parseFloat(price),
                image: images[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000', // Default image if none
                ownerId: session.user.id,
                description: description,
                location: 'Sivas Merkez', // Default location
            } as any); // Cast to any to avoid strict type checks for now, or match Product interface exactly

            alert('İlanınız başarıyla yayınlandı!');
            window.location.href = '/';

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
                                {images.map((img, idx) => (
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
