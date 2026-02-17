'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeListings: 0,
        pendingListings: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { db } = await import('@/lib/firebase');
                const { collection, getCountFromServer, query, where, getDocs } = await import('firebase/firestore');

                // 1. Total Users
                const usersColl = collection(db, "users");
                const usersSnapshot = await getCountFromServer(usersColl);
                const totalUsers = usersSnapshot.data().count;

                // 2. Product Counts
                const productsColl = collection(db, "products");

                const activeQuery = query(productsColl, where("status", "==", "active"));
                const activeSnapshot = await getCountFromServer(activeQuery);
                const activeListings = activeSnapshot.data().count;

                const pendingQuery = query(productsColl, where("status", "==", "pending"));
                const pendingSnapshot = await getCountFromServer(pendingQuery);
                const pendingListings = pendingSnapshot.data().count;

                // 3. Total Revenue
                // Firestore doesn't support aggregation queries for sum directly in client SDK easily without cloud functions or reading all docs.
                // For now, we'll read approved bookings.
                const bookingsColl = collection(db, "bookings");
                const revenueQuery = query(bookingsColl, where("status", "==", "approved"));
                const revenueSnapshot = await getDocs(revenueQuery);

                let totalRevenue = 0;
                revenueSnapshot.forEach(doc => {
                    totalRevenue += (doc.data().total_price || 0);
                });

                setStats({
                    totalUsers,
                    activeListings,
                    pendingListings,
                    totalRevenue
                });
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Genel Bakış</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Toplam Üye</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Aktif İlan</p>
                    <p className="text-3xl font-bold text-primary mt-2">{stats.activeListings}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Toplam Kazanç</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalRevenue} ₺</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Bekleyen Onay</p>
                    <p className={`text-3xl font-bold mt-2 ${stats.pendingListings > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {stats.pendingListings}
                    </p>
                    {stats.pendingListings > 0 && (
                        <Link href="/admin/ilanlar" className="text-xs text-orange-600 hover:underline block mt-1">
                            İncele →
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Son Hareketler</h3>
                <p className="text-gray-500 text-sm italic">Henüz işlem geçmişi yok.</p>
            </div>
        </div>
    );
}
