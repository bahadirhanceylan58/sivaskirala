'use client';

import { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { TrashIcon } from '@heroicons/react/24/outline';

interface Review {
    id: string;
    product_id: string;
    product_title?: string;
    user_id: string;
    user_name?: string;
    user_email?: string;
    rating: number;
    comment: string;
    created_at: string;
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { db } = await import('@/lib/firebase');
            const { collectionGroup, getDocs, orderBy, query } = await import('firebase/firestore');

            // reviews are a subcollection under products
            const q = query(collectionGroup(db, 'reviews'), orderBy('created_at', 'desc'));
            const snap = await getDocs(q);
            const data: Review[] = [];
            snap.forEach(d => data.push({ id: d.id, ...d.data() } as Review));
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleDelete = async (review: Review) => {
        if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
        try {
            const { db } = await import('@/lib/firebase');
            const { doc, deleteDoc } = await import('firebase/firestore');
            // Reviews stored at products/{productId}/reviews/{reviewId}
            await deleteDoc(doc(db, 'products', review.product_id, 'reviews', review.id));
            fetchReviews();
        } catch (error: any) {
            alert('Hata: ' + error.message);
        }
    };

    const filtered = reviews.filter(r =>
        search === '' ||
        r.comment?.toLowerCase().includes(search.toLowerCase()) ||
        r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.product_title?.toLowerCase().includes(search.toLowerCase())
    );

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : '—';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Yorum Moderasyonu</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Toplam {reviews.length} yorum • Ortalama puan:{' '}
                        <span className="text-yellow-400 font-semibold">★ {avgRating}</span>
                    </p>
                </div>
                <input
                    type="text"
                    placeholder="Yorum, kullanıcı veya ilan ara..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 w-full sm:w-72"
                />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Yükleniyor...</div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {filtered.map((review) => (
                            <div key={review.id} className="px-6 py-5 hover:bg-gray-800/30 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm flex-shrink-0">
                                            {(review.user_name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                                                <span className="text-white font-medium text-sm">{review.user_name || '—'}</span>
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <StarIcon
                                                            key={i}
                                                            className={`h-4 w-4 ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-700'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-gray-500 text-xs">
                                                    {review.created_at ? new Date(review.created_at).toLocaleDateString('tr-TR') : '—'}
                                                </span>
                                            </div>
                                            {review.product_title && (
                                                <p className="text-gray-500 text-xs mb-2">
                                                    İlan: <span className="text-gray-400">{review.product_title}</span>
                                                </p>
                                            )}
                                            <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(review)}
                                        className="flex-shrink-0 p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Yorumu sil"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="px-6 py-16 text-center text-gray-500">
                                {search ? 'Eşleşen yorum bulunamadı.' : 'Henüz yorum yok.'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
