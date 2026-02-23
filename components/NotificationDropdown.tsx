'use client';

import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline'; // Outline for default
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid'; // Solid for active/open

interface Notification {
    id: string;
    userId: string;
    message: string;
    type: 'order' | 'system' | 'info';
    read: boolean;
    created_at: any;
    link?: string;
}

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        let unsubscribe: any;

        const fetchNotifications = async () => {
            const { auth, db } = await import('@/lib/firebase');
            const { onAuthStateChanged } = await import('firebase/auth');
            const { collection, query, where, onSnapshot, orderBy } = await import('firebase/firestore');

            unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    const q = query(
                        collection(db, "notifications"),
                        where("userId", "==", user.uid),
                        orderBy("created_at", "desc")
                    );

                    // Real-time listener
                    const unsub = onSnapshot(q, (snapshot) => {
                        const notifs: Notification[] = [];
                        let unread = 0;
                        snapshot.forEach((doc) => {
                            const data = doc.data() as Omit<Notification, 'id'>;
                            notifs.push({ id: doc.id, ...data });
                            if (!data.read) unread++;
                        });
                        setNotifications(notifs);
                        setUnreadCount(unread);
                    });

                    return () => unsub(); // Store unsubscribe function to call on cleanup
                } else {
                    setNotifications([]);
                    setUnreadCount(0);
                }
            });
        };

        fetchNotifications();

        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
        };
    }, []);

    const markAsRead = async (notificationId: string) => {
        try {
            const { db } = await import('@/lib/firebase');
            const { doc, updateDoc } = await import('firebase/firestore');
            const notifRef = doc(db, "notifications", notificationId);
            await updateDoc(notifRef, { read: true });

            // Local state update handled by onSnapshot automatically
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.read) {
            await markAsRead(notif.id);
        }
        if (notif.link) {
            window.location.href = notif.link;
        }
        setIsOpen(false);
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-primary transition-colors focus:outline-none"
            >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800 text-sm">Bildirimler</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs text-primary font-medium">{unreadCount} yeni</span>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                Henüz bildiriminiz yok.
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-primary' : 'bg-transparent'}`}></div>
                                    <div>
                                        <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                            {notif.message}
                                        </p>
                                        <span className="text-xs text-gray-400 mt-1 block">
                                            {notif.created_at?.toDate ? new Date(notif.created_at.toDate()).toLocaleDateString('tr-TR') : 'Şimdi'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                            <button className="text-xs text-primary font-bold hover:underline">Tümünü Göster</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
