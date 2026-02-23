'use client';

import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface FavoriteButtonProps {
    productId: string;
    productData: {
        title: string;
        price: number;
        image: string;
        category: string;
    };
    className?: string; // Allow custom styling positioning
}

export default function FavoriteButton({ productId, productData, className = "" }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // Check auth status and favorite status
        const checkStatus = async () => {
            const { auth, db } = await import('@/lib/firebase');
            const { onAuthStateChanged } = await import('firebase/auth');
            const { doc, getDoc, getFirestore } = await import('firebase/firestore');

            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    // Check if already favorited
                    const favRef = doc(db, "favorites", `${user.uid}_${productId}`);
                    const favSnap = await getDoc(favRef);
                    if (favSnap.exists()) {
                        setIsFavorite(true);
                    }
                } else {
                    setUserId(null);
                    setIsFavorite(false);
                }
            });
        };
        checkStatus();
    }, [productId]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent linking if inside a Link component
        e.stopPropagation();

        if (!userId) {
            alert('Favorilere eklemek için giriş yapmalısınız.');
            return;
        }

        setLoading(true);
        try {
            const { db } = await import('@/lib/firebase');
            const { doc, setDoc, deleteDoc } = await import('firebase/firestore');

            const favId = `${userId}_${productId}`;
            const favRef = doc(db, "favorites", favId);

            if (isFavorite) {
                // Remove
                await deleteDoc(favRef);
                setIsFavorite(false);
            } else {
                // Add
                await setDoc(favRef, {
                    userId,
                    productId,
                    product: productData,
                    created_at: new Date().toISOString()
                });
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`p-2 rounded-full transition-colors hover:bg-gray-100 ${className} ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
            title={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        >
            {isFavorite ? (
                <HeartIconSolid className="w-6 h-6" />
            ) : (
                <HeartIcon className="w-6 h-6" />
            )}
        </button>
    );
}
