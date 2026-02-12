'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        import('@/lib/mock-service').then(({ MockService }) => {
            MockService.getStats().then(setStats);
        });
    }, []);

    if (!stats) return <div>İstatistikler yükleniyor...</div>;

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
                    <p className="text-3xl font-bold text-orange-500 mt-2">0</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Son Hareketler</h3>
                <p className="text-gray-500 text-sm">Henüz işlem geçmişi yok.</p>
            </div>
        </div>
    );
}
