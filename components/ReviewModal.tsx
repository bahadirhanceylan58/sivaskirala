'use client';

import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productTitle: string;
    userId: string;
    userName: string;
    onReviewSubmitted: () => void;
}

export default function ReviewModal({ isOpen, onClose, productId, productTitle, userId, userName, onReviewSubmitted }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { db } = await import('@/lib/firebase');
            const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

            await addDoc(collection(db, "reviews"), {
                productId,
                userId,
                userName,
                rating,
                comment,
                created_at: serverTimestamp()
            });

            alert('Yorumunuz başarıyla gönderildi!');
            setComment('');
            setRating(5);
            onReviewSubmitted();
            onClose();
        } catch (error) {
            console.error("Error submitting review:", error);
            alert('Yorum gönderilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold text-gray-900 mb-1">Yorum Yap</h2>
                <p className="text-sm text-gray-500 mb-6">{productTitle}</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6 flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                {star <= rating ? (
                                    <StarIcon className="w-8 h-8 text-yellow-500" />
                                ) : (
                                    <StarOutline className="w-8 h-8 text-gray-300" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Deneyimin nasıldı?</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                            placeholder="Ürün ve kiralama süreci hakkında ne düşünüyorsun?"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                    </button>
                </form>
            </div>
        </div>
    );
}
