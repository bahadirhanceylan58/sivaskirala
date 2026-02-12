'use client';

import { useEffect, useState, use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    // Store images as objects to track files for upload
    type ImageItem = {
        url: string;
        file?: File;
    };

    const [images, setImages] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Elektronik');

    const [features, setFeatures] = useState<string[]>([]);
    const [newFeature, setNewFeature] = useState('');
    const [sizes, setSizes] = useState<string[]>([]);
    const [newSize, setNewSize] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = '/giris-yap';
                return;
            }

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                alert('İlan bulunamadı.');
                window.location.href = '/hesabim';
                return;
            }

            if (data.owner_id !== session.user.id) {
                alert('Bu ilanı düzenleme yetkiniz yok.');
                window.location.href = '/hesabim';
                return;
            }

            setTitle(data.title);
            setDescription(data.description);
            setPrice(data.price_per_day.toString());
            setCategory(data.category);

            // Map existing string URLs to ImageItem objects
            const existingImages = (data.images || []).map((url: string) => ({ url }));
            setImages(existingImages);

            setFeatures(data.features || []);
            setSizes(data.sizes || []);
            setLoading(false);
        };

        fetchProduct();
    }, [id]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newImageItems = Array.from(e.target.files).map(file => ({
                url: URL.createObjectURL(file), // Preview URL
                file: file
            }));
            setImages([...images, ...newImageItems]);
        }
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFeatures([...features, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    const addSize = () => {
        if (newSize.trim()) {
            setSizes([...sizes, newSize.trim()]);
            setNewSize('');
        }
    };

    const removeSize = (index: number) => {
        setSizes(sizes.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setUploading(true);

        try {
            // 1. Upload new images to Supabase Storage
            const finalImageUrls: string[] = [];

            for (const img of images) {
                if (img.file) {
                    // It's a new file, upload it
                    const fileExt = img.file.name.split('.').pop();
                    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
                    const filePath = `${id}/${fileName}`; // Organize by product ID

                    const { error: uploadError } = await supabase.storage
                        .from('product-images')
                        .upload(filePath, img.file);

                    if (uploadError) {
                        console.error('Upload Error:', uploadError);
                        // If bucket doesn't exist, we might get an error here.
                        // Alert user but maybe continue with other images? 
                        // Or fail hard? Failing hard is safer to prevent broken data.
                        throw new Error(`Resim yüklenemedi (${img.file.name}). 'product-images' depolama alanının (bucket) oluşturulduğundan emin olun. Hata: ${uploadError.message}`);
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(filePath);

                    finalImageUrls.push(publicUrl);
                } else {
                    // It's an existing URL, keep it
                    finalImageUrls.push(img.url);
                }
            }

            // 2. Update Product in DB
            const { error: dbError } = await supabase
                .from('products')
                .update({
                    title,
                    description,
                    category,
                    price_per_day: parseFloat(price),
                    images: finalImageUrls,
                    features: features,
                    sizes: sizes
                })
                .eq('id', id);

            if (dbError) throw dbError;

            alert('İlan başarıyla güncellendi!');
            window.location.href = '/hesabim';
        } catch (error: any) {
            console.error(error);
            alert('Hata: ' + error.message);
        } finally {
            setSubmitting(false);
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert('İlan başarıyla silindi.');
            window.location.href = '/hesabim';
        } catch (error: any) {
            console.error(error);
            alert('Silme sırasında hata oluştu: ' + error.message);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">İlanı Düzenle</h1>
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline"
                        >
                            İlanı Sil
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Fotoğrafları</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                                        <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            X
                                        </button>
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
                        </div>

                        {/* Features */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Özellikleri</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Örn: 4K Video Kaydı"
                                    value={newFeature}
                                    onChange={e => setNewFeature(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                />
                                <button type="button" onClick={addFeature} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">Ekle</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {features.map((feature, idx) => (
                                    <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        {feature}
                                        <button type="button" onClick={() => removeFeature(idx)} className="hover:text-blue-900 border-l border-blue-200 pl-2">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Sizes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Beden / Seçenekler (Opsiyonel)</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Örn: 38, 40, L, XL"
                                    value={newSize}
                                    onChange={e => setNewSize(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())}
                                />
                                <button type="button" onClick={addSize} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">Ekle</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size, idx) => (
                                    <span key={idx} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        {size}
                                        <button type="button" onClick={() => removeSize(idx)} className="hover:text-purple-900 border-l border-purple-200 pl-2">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => window.location.href = '/hesabim'}
                                className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                İptal
                            </button>
                            <button type="submit" disabled={submitting} className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-secondary transition-transform hover:scale-105 shadow-md shadow-green-100">
                                {submitting ? (uploading ? 'Resimler Yükleniyor...' : 'Güncelleniyor...') : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-sm w-full p-6 animate-scale-in">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">İlanı Sil?</h3>
                        <p className="text-gray-500 mb-6">Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium"
                            >
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
