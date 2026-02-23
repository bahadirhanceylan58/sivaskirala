'use client';

import { useEffect, useState } from 'react';

interface Booking {
    id: string;
    product_title?: string;
    product_id?: string;
    renter_id?: string;
    renter_name?: string;
    renter_email?: string;
    start_date?: string;
    end_date?: string;
    total_price: number;
    status: string;
    created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
    pending: { label: 'Bekliyor', classes: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    approved: { label: 'Onaylandı', classes: 'bg-green-500/10 text-green-400 border-green-500/20' },
    rejected: { label: 'Reddedildi', classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
    completed: { label: 'Tamamlandı', classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { db } = await import('@/lib/firebase');
            const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
            const q = query(collection(db, 'bookings'), orderBy('created_at', 'desc'));
            const snap = await getDocs(q);
            const data: Booking[] = [];
            snap.forEach(d => data.push({ id: d.id, ...d.data() } as Booking));
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        if (!confirm(`Durumu "${STATUS_CONFIG[newStatus]?.label || newStatus}" olarak güncellemek istiyor musunuz?`)) return;
        try {
            const { db } = await import('@/lib/firebase');
            const { doc, updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(db, 'bookings', id), { status: newStatus });
            fetchBookings();
        } catch (error: any) {
            alert('Hata: ' + error.message);
        }
    };

    const filtered = bookings.filter(b => filter === 'all' || b.status === filter);
    const totalRevenue = bookings.filter(b => b.status === 'approved').reduce((sum, b) => sum + (b.total_price || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Rezervasyonlar</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Toplam {bookings.length} rezervasyon • Onaylanan gelir:{' '}
                        <span className="text-green-400 font-semibold">{totalRevenue.toLocaleString('tr-TR')} ₺</span>
                    </p>
                </div>
                <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1 self-start sm:self-auto">
                    {[
                        { value: 'all', label: 'Tümü' },
                        { value: 'pending', label: 'Bekleyen' },
                        { value: 'approved', label: 'Onaylı' },
                        { value: 'rejected', label: 'Red' },
                    ].map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === tab.value
                                ? 'bg-green-500 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Yükleniyor...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">İlan</th>
                                    <th className="px-6 py-4">Kiralayan</th>
                                    <th className="px-6 py-4">Tarih Aralığı</th>
                                    <th className="px-6 py-4">Toplam</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filtered.map((booking) => {
                                    const sc = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                                    return (
                                        <tr key={booking.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-white text-sm font-medium max-w-[160px] truncate">
                                                    {booking.product_title || `#${booking.product_id?.slice(0, 8) || booking.id.slice(0, 8)}`}
                                                </p>
                                                <p className="text-gray-600 text-xs">{new Date(booking.created_at).toLocaleDateString('tr-TR')}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-white text-sm">{booking.renter_name || '—'}</p>
                                                <p className="text-gray-500 text-xs">{booking.renter_email || booking.renter_id?.slice(0, 12) || '—'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {booking.start_date && booking.end_date ? (
                                                    <span>{booking.start_date} → {booking.end_date}</span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-green-400 font-semibold text-sm">
                                                {(booking.total_price || 0).toLocaleString('tr-TR')} ₺
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.classes}`}>
                                                    {sc.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {booking.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateStatus(booking.id, 'approved')}
                                                                className="text-xs px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
                                                            >
                                                                Onayla
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(booking.id, 'rejected')}
                                                                className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                                                            >
                                                                Reddet
                                                            </button>
                                                        </>
                                                    )}
                                                    {booking.status === 'approved' && (
                                                        <button
                                                            onClick={() => updateStatus(booking.id, 'completed')}
                                                            className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
                                                        >
                                                            Tamamlandı
                                                        </button>
                                                    )}
                                                    {(booking.status === 'rejected' || booking.status === 'completed') && (
                                                        <span className="text-gray-600 text-xs">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                            {filter !== 'all' ? 'Bu kategoride rezervasyon yok.' : 'Henüz rezervasyon bulunmuyor.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
