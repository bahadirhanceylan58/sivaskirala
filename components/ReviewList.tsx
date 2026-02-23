'use client';

import { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    created_at: any;
}

interface ReviewListProps {
    productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { db } = await import('@/lib/firebase');
                const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');

                const q = query(
                    collection(db, "reviews"),
                    where("productId", "==", productId),
                    orderBy("created_at", "desc")
                );

                const querySnapshot = await getDocs(q);
                const reviewsData: Review[] = [];
                querySnapshot.forEach((doc) => {
                    reviewsData.push({ id: doc.id, ...doc.data() } as Review);
                });

                setReviews(reviewsData);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    if (loading) return <div className="py-4 text-center text-gray-500">Yorumlar yükleniyor...</div>;

    if (reviews.length === 0) {
        return (
            <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
            </div>
        );
    }

    // Calculate average rating
    const averageRating = (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1);

    return (
        <div className="mt-8">
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                    <StarIcon className="w-8 h-8 text-yellow-500" />
                    <span className="text-3xl font-bold ml-2 text-gray-900">{averageRating}</span>
                </div>
                <span className="text-gray-500">({reviews.length} Değerlendirme)</span>
            </div>

            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 text-xs">
                                    {review.userName.charAt(0)}
                                </div>
                                <span className="font-bold text-gray-900">{review.userName}</span>
                            </div>
                            <span className="text-xs text-gray-400">
                                {review.created_at?.toDate ? new Date(review.created_at.toDate()).toLocaleDateString('tr-TR') : ''}
                            </span>
                        </div>
                        <div className="flex mb-2">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
