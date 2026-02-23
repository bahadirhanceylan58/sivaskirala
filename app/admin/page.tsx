'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    UsersIcon,
    CubeIcon,
    BanknotesIcon,
    ClockIcon,
    CalendarDaysIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface Stats {
    totalUsers: number;
    activeListings: number;
    pendingListings: number;
    totalRevenue: number;
}

interface RecentBooking {
    id: string;
    product_title: string;
    renter_name?: string;
    total_price: number;
    status: string;
    created_at: string;
}

interface RecentUser {
    id: string;
    full_name: string;
    email: string;
    created_at: string;
}

const statusLabel: Record<string, { label: string; color: string }> = {
    pending: { label: 'Bekliyor', color: 'bg-orange-100 text-orange-700' },
    approved: { label: 'Onaylandı', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-700' },
    active: { label: 'Aktif', color: 'bg-blue-100 text-blue-700' },
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeListings: 0, pendingListings: 0, totalRevenue: 0 });
    const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const { db } = await import('@/lib/firebase');
                const { collection, getCountFromServer, query, where, getDocs, orderBy, limit } = await import('firebase/firestore');

                // Stats
                const usersColl = collection(db, 'users');
                const usersCount = (await getCountFromServer(usersColl)).data().count;

                const productsColl = collection(db, 'products');
                const activeCount = (await getCountFromServer(query(productsColl, where('status', '==', 'active')))).data().count;
                const pendingCount = (await getCountFromServer(query(productsColl, where('status', '==', 'pending')))).data().count;

                const bookingsColl = collection(db, 'bookings');
                const revenueSnap = await getDocs(query(bookingsColl, where('status', '==', 'approved')));
                let totalRevenue = 0;
                revenueSnap.forEach(d => { totalRevenue += (d.data().total_price || 0); });

                setStats({ totalUsers: usersCount, activeListings: activeCount, pendingListings: pendingCount, totalRevenue });

                // Recent bookings
                try {
                    const bookQ = query(bookingsColl, orderBy('created_at', 'desc'), limit(5));
                    const bookSnap = await getDocs(bookQ);
                    const bookings: RecentBooking[] = [];
                    bookSnap.forEach(d => bookings.push({ id: d.id, ...d.data() } as RecentBooking));
                    setRecentBookings(bookings);
                } catch { /* index may not exist yet */ }

                // Recent users
                try {
                    const userQ = query(usersColl, orderBy('created_at', 'desc'), limit(5));
                    const userSnap = await getDocs(userQ);
                    const users: RecentUser[] = [];
                    userSnap.forEach(d => users.push({ id: d.id, ...d.data() } as RecentUser));
                    setRecentUsers(users);
                } catch { /* index may not exist yet */ }

            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
                            <div className="h-4 bg-gray-800 rounded w-24 mb-4" />
                            <div className="h-8 bg-gray-800 rounded w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Toplam Üye',
            value: stats.totalUsers,
            icon: UsersIcon,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
            suffix: '',
        },
        {
            label: 'Aktif İlan',
            value: stats.activeListings,
            icon: CubeIcon,
            color: 'text-green-400',
            bg: 'bg-green-500/10 border-green-500/20',
            suffix: '',
        },
        {
            label: 'Toplam Kazanç',
            value: stats.totalRevenue.toLocaleString('tr-TR'),
            icon: BanknotesIcon,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
            suffix: ' ₺',
        },
        {
            label: 'Bekleyen Onay',
            value: stats.pendingListings,
            icon: ClockIcon,
            color: stats.pendingListings > 0 ? 'text-orange-400' : 'text-gray-500',
            bg: stats.pendingListings > 0 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-gray-800/50 border-gray-700',
            suffix: '',
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Genel Bakış</h2>
                <p className="text-gray-500 text-sm mt-1">Platformun anlık durumu</p>
            </div>

            {/* Pending Alert */}
            {stats.pendingListings > 0 && (
                <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-400 flex-shrink-0" />
                    <p className="text-orange-300 text-sm">
                        <span className="font-bold">{stats.pendingListings} ilan</span> onay bekliyor.{' '}
                        <Link href="/admin/ilanlar" className="underline hover:text-orange-200">İncele →</Link>
                    </p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((card) => (
                    <div key={card.label} className={`bg-gray-900 border ${card.bg} rounded-2xl p-6`}>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-gray-400 text-sm font-medium">{card.label}</p>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bg}`}>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                        </div>
                        <p className={`text-3xl font-bold ${card.color}`}>
                            {card.value}{card.suffix}
                        </p>
                    </div>
                ))}
            </div>

            {/* Two column tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                            <h3 className="text-white font-semibold">Son Rezervasyonlar</h3>
                        </div>
                        <Link href="/admin/rezervasyonlar" className="text-xs text-green-400 hover:text-green-300">Tümü →</Link>
                    </div>
                    <div className="divide-y divide-gray-800">
                        {recentBookings.length === 0 ? (
                            <p className="text-gray-500 text-sm px-6 py-8 text-center">Henüz rezervasyon yok.</p>
                        ) : recentBookings.map((b) => (
                            <div key={b.id} className="px-6 py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-white text-sm font-medium truncate max-w-[180px]">{b.product_title || 'İlan'}</p>
                                    <p className="text-gray-500 text-xs">{b.renter_name || '—'}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-green-400 text-sm font-semibold">{b.total_price} ₺</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(statusLabel[b.status] || statusLabel.pending).color}`}>
                                        {(statusLabel[b.status] || { label: b.status }).label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                            <UsersIcon className="h-5 w-5 text-gray-400" />
                            <h3 className="text-white font-semibold">Yeni Üyeler</h3>
                        </div>
                        <Link href="/admin/uyeler" className="text-xs text-green-400 hover:text-green-300">Tümü →</Link>
                    </div>
                    <div className="divide-y divide-gray-800">
                        {recentUsers.length === 0 ? (
                            <p className="text-gray-500 text-sm px-6 py-8 text-center">Henüz üye yok.</p>
                        ) : recentUsers.map((u) => (
                            <div key={u.id} className="px-6 py-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-sm flex-shrink-0">
                                    {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-white text-sm font-medium truncate">{u.full_name || '—'}</p>
                                    <p className="text-gray-500 text-xs truncate">{u.email}</p>
                                </div>
                                <p className="text-gray-600 text-xs ml-auto flex-shrink-0">
                                    {u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : '—'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
