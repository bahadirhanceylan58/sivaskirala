'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Profile {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
    role: string;
    is_blocked: boolean;
    created_at: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleBlock = async (id: string, currentStatus: boolean) => {
        const action = currentStatus ? 'engelini kaldırmak' : 'engellemek';
        if (!confirm(`Bu kullanıcıyı ${action} istiyor musunuz?`)) return;

        const { error } = await supabase
            .from('profiles')
            .update({ is_blocked: !currentStatus })
            .eq('id', id);

        if (error) {
            alert('Hata oluştu: ' + error.message);
        } else {
            fetchUsers();
        }
    };

    const makeAdmin = async (id: string) => {
        if (!confirm('Bu kullanıcıyı yönetici yapmak istiyor musunuz?')) return;

        const { error } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', id);

        if (error) {
            alert('Hata oluştu: ' + error.message);
        } else {
            alert('Kullanıcı yönetici yapıldı!');
            fetchUsers();
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Üye Yönetimi</h2>
                <div className="text-sm text-gray-500">Toplam {users.length} üye</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Üye</th>
                            <th className="px-6 py-4">Rol</th>
                            <th className="px-6 py-4">Katılma Tarihi</th>
                            <th className="px-6 py-4">Durum</th>
                            <th className="px-6 py-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-primary font-bold text-lg overflow-hidden relative">
                                            {user.avatar_url ? (
                                                <Image src={user.avatar_url} fill className="object-cover" alt={user.full_name} />
                                            ) : (
                                                user.full_name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.full_name}</p>
                                            <p className="text-gray-400 text-xs">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {user.role === 'admin' ? 'Yönetici' : 'Üye'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-sm">
                                    {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="px-6 py-4">
                                    {user.is_blocked ? (
                                        <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded">Engelli</span>
                                    ) : (
                                        <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">Aktif</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {user.role !== 'admin' && (
                                        <>
                                            <button
                                                onClick={() => makeAdmin(user.id)}
                                                className="text-purple-600 hover:text-purple-800 font-medium text-xs px-2 py-1 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
                                            >
                                                Yönetici Yap
                                            </button>
                                            <button
                                                onClick={() => toggleBlock(user.id, user.is_blocked || false)}
                                                className={`font-medium text-xs px-2 py-1 rounded transition-colors ${user.is_blocked
                                                        ? 'text-green-600 bg-green-50 hover:bg-green-100'
                                                        : 'text-red-500 bg-red-50 hover:bg-red-100'
                                                    }`}
                                            >
                                                {user.is_blocked ? 'Engeli Kaldır' : 'Engelle'}
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
