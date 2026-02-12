'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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
                // Users count
                const { count: userCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                // Product counts
                const { count: activeCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'active');

                const { count: pendingCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending');

                // Bookings revenue (sum total_price)
                const { data: bookings } = await supabase
                    .from('bookings')
                    .select('total_price')
                    .eq('status', 'approved'); // Assuming we have 'approved' status

                const revenue = bookings?.reduce((sum, booking) => sum + booking.total_price, 0) || 0;

                setStats({
                    totalUsers: userCount || 0,
                    activeListings: activeCount || 0,
                    pendingListings: pendingCount || 0,
                    totalRevenue: revenue
                });
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

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
                        <Link href="/admin/products" className="text-xs text-orange-600 hover:underline block mt-1">
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
