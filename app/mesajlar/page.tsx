'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface Conversation {
    id: string;
    buyerId: string;
    sellerId: string;
    productId: string;
    productTitle: string;
    productImage: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadBuyer: number;
    unreadSeller: number;
    otherUserName?: string;
}

export default function MesajlarPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const { auth } = await import('@/lib/firebase');
            const { onAuthStateChanged } = await import('firebase/auth');
            const unsub = onAuthStateChanged(auth, (user) => {
                if (!user) {
                    router.push('/giris-yap');
                } else {
                    setCurrentUser(user);
                }
            });
            return unsub;
        };
        let unsub: any;
        init().then(u => unsub = u);
        return () => unsub?.();
    }, [router]);

    useEffect(() => {
        if (!currentUser) return;

        const fetchConversations = async () => {
            const { db } = await import('@/lib/firebase');
            const { collection, query, where, onSnapshot, orderBy, doc, getDoc } = await import('firebase/firestore');

            // Buyer veya seller olduğu konuşmaları al — iki ayrı query
            const buyerQ = query(
                collection(db, 'conversations'),
                where('buyerId', '==', currentUser.uid),
                orderBy('lastMessageAt', 'desc')
            );
            const sellerQ = query(
                collection(db, 'conversations'),
                where('sellerId', '==', currentUser.uid),
                orderBy('lastMessageAt', 'desc')
            );

            const convMap = new Map<string, Conversation>();

            const processSnapshot = async (snapshot: any) => {
                for (const docSnap of snapshot.docs) {
                    const data = docSnap.data();
                    const isBuyer = data.buyerId === currentUser.uid;
                    const otherId = isBuyer ? data.sellerId : data.buyerId;

                    let otherName = 'Kullanıcı';
                    try {
                        const userDoc = await getDoc(doc(db, 'users', otherId));
                        if (userDoc.exists()) {
                            otherName = userDoc.data().full_name || otherName;
                        }
                    } catch (_) { }

                    convMap.set(docSnap.id, {
                        id: docSnap.id,
                        ...data,
                        otherUserName: otherName,
                        lastMessageAt: data.lastMessageAt?.toDate?.()?.toISOString() || '',
                    } as Conversation);
                }
                const sorted = Array.from(convMap.values()).sort(
                    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
                );
                setConversations(sorted);
                setLoading(false);
            };

            const unsubBuyer = onSnapshot(buyerQ, processSnapshot);
            const unsubSeller = onSnapshot(sellerQ, processSnapshot);
            return () => { unsubBuyer(); unsubSeller(); };
        };

        let cleanup: any;
        fetchConversations().then(c => cleanup = c);
        return () => cleanup?.();
    }, [currentUser]);

    const getUnread = (conv: Conversation) => {
        return currentUser?.uid === conv.buyerId ? conv.unreadBuyer : conv.unreadSeller;
    };

    const formatTime = (iso: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
        if (diffDays === 0) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return 'Dün';
        return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <ChatBubbleLeftRightIcon className="h-7 w-7 text-primary" />
                    Mesajlarım
                </h1>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="text-5xl mb-4">💬</div>
                        <h2 className="text-lg font-bold text-gray-700 mb-2">Henüz mesajınız yok</h2>
                        <p className="text-gray-500 text-sm mb-6">Bir ilan sayfasında satıcıya mesaj gönderin.</p>
                        <Link href="/arama" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors">
                            İlanları Keşfet
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
                        {conversations.map((conv) => {
                            const unread = getUnread(conv);
                            return (
                                <Link key={conv.id} href={`/mesajlar/${conv.id}`}
                                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                    {/* Ürün Görseli */}
                                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                                        {conv.productImage ? (
                                            <img src={conv.productImage} alt={conv.productTitle}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                        )}
                                    </div>

                                    {/* Bilgi */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className={`font-bold text-gray-900 truncate ${unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {conv.otherUserName}
                                            </p>
                                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                                        </div>
                                        <p className="text-xs text-primary font-medium truncate mb-1">{conv.productTitle}</p>
                                        <p className={`text-sm truncate ${unread > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                            {conv.lastMessage || 'Konuşma başladı'}
                                        </p>
                                    </div>

                                    {/* Okunmamış Badge */}
                                    {unread > 0 && (
                                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-[10px] font-bold">{unread}</span>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
