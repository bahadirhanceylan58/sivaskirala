'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBox from '@/components/ChatBox';
import Link from 'next/link';
import { PaperAirplaneIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';

interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: string;
}

interface Conversation {
    id: string;
    buyerId: string;
    sellerId: string;
    productId: string;
    productTitle: string;
    productImage: string;
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUserName, setOtherUserName] = useState('Kullanıcı');
    const [otherUserEmail, setOtherUserEmail] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auth
    useEffect(() => {
        const init = async () => {
            const { auth } = await import('@/lib/firebase');
            const { onAuthStateChanged } = await import('firebase/auth');
            return onAuthStateChanged(auth, (user) => {
                if (!user) router.push('/giris-yap');
                else setCurrentUser(user);
            });
        };
        let unsub: (() => void) | undefined;
        init().then(u => unsub = u);
        return () => unsub?.();
    }, [router]);

    // Load conversation
    useEffect(() => {
        if (!currentUser || !id) return;
        const load = async () => {
            const { db } = await import('@/lib/firebase');
            const { doc, getDoc } = await import('firebase/firestore');

            const convSnap = await getDoc(doc(db, 'conversations', id));
            if (!convSnap.exists()) { router.push('/mesajlar'); return; }

            const data = convSnap.data() as Conversation;
            // Erişim kontrolü
            if (data.buyerId !== currentUser.uid && data.sellerId !== currentUser.uid) {
                router.push('/mesajlar');
                return;
            }
            const { id: _omit, ...rest } = data as any;
            setConversation({ id: convSnap.id, ...rest } as Conversation);

            // Diğer kullanıcı adını al
            const otherId = data.buyerId === currentUser.uid ? data.sellerId : data.buyerId;
            try {
                const userDoc = await getDoc(doc(db, 'users', otherId));
                if (userDoc.exists()) {
                    setOtherUserName(userDoc.data().full_name || 'Kullanıcı');
                    setOtherUserEmail(userDoc.data().email || '');
                }
            } catch (_) { }

            // Okunmamış sıfırla
            const { updateDoc } = await import('firebase/firestore');
            const field = data.buyerId === currentUser.uid ? 'unreadBuyer' : 'unreadSeller';
            await updateDoc(doc(db, 'conversations', id), { [field]: 0 });
        };
        load();
    }, [currentUser, id, router]);

    // Listen messages in real-time
    useEffect(() => {
        if (!id) return;
        const listen = async () => {
            const { db } = await import('@/lib/firebase');
            const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');

            const q = query(collection(db, 'conversations', id, 'messages'), orderBy('createdAt', 'asc'));
            return onSnapshot(q, (snap) => {
                setMessages(snap.docs.map(d => ({
                    id: d.id,
                    ...d.data(),
                    createdAt: d.data().createdAt?.toDate?.()?.toISOString() || '',
                } as Message)));
            });
        };
        let unsub: (() => void) | undefined;
        listen().then(u => unsub = u);
        return () => unsub?.();
    }, [id]);

    // Auto scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !currentUser || !conversation) return;
        setSending(true);
        const text = newMessage.trim();
        setNewMessage('');
        try {
            const { db } = await import('@/lib/firebase');
            const { collection, addDoc, serverTimestamp, updateDoc, doc, increment } = await import('firebase/firestore');

            await addDoc(collection(db, 'conversations', id, 'messages'), {
                text,
                senderId: currentUser.uid,
                createdAt: serverTimestamp(),
            });

            const isBuyer = conversation.buyerId === currentUser.uid;
            await updateDoc(doc(db, 'conversations', id), {
                lastMessage: text,
                lastMessageAt: serverTimestamp(),
                [isBuyer ? 'unreadSeller' : 'unreadBuyer']: increment(1),
            });

            // E-posta bildirimi — karşı tarafa
            if (otherUserEmail) {
                try {
                    const senderName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Biri';
                    const { emailTemplates } = await import('@/lib/email-templates');
                    const tpl = emailTemplates.newMessage(senderName, conversation.productTitle, id);
                    await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ to: otherUserEmail, ...tpl }),
                    });
                } catch (emailErr) {
                    console.warn('Mesaj e-postası gönderilemedi:', emailErr);
                }
            }
        } catch (e) { console.error(e); }
        finally { setSending(false); }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-6 max-w-3xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                        <Link href="/mesajlar" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                        </Link>
                        {conversation?.productImage && (
                            <img src={conversation.productImage} alt={conversation.productTitle}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }} />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{otherUserName}</p>
                            {conversation?.productTitle && (
                                <Link href={`/ilan/${conversation.productId}`}
                                    className="text-xs text-primary hover:underline truncate block">
                                    {conversation.productTitle}
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    <ChatBox messages={messages} currentUserId={currentUser?.uid || ''} otherName={otherUserName} />
                    <div ref={bottomRef} />

                    {/* Input */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-end gap-3">
                            <textarea
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Mesajınızı yazın..."
                                rows={1}
                                className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-green-100 transition-all"
                                style={{ maxHeight: '120px' }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!newMessage.trim() || sending}
                                className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                            >
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">Enter ile gönder, Shift+Enter ile yeni satır</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
