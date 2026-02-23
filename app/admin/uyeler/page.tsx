'use client';

import { useEffect, useState } from 'react';

interface Profile {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    role: string;
    is_blocked?: boolean;
    created_at: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { db } = await import('@/lib/firebase');
            const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
            const q = query(collection(db, 'users'), orderBy('created_at', 'desc'));
            const querySnapshot = await getDocs(q);
            const usersData: Profile[] = [];
            querySnapshot.forEach((doc) => usersData.push({ id: doc.id, ...doc.data() } as Profile));
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const toggleBlock = async (id: string, currentStatus: boolean) => {
        const action = currentStatus ? 'engelini kaldırmak' : 'engellemek';
        if (!confirm(`Bu kullanıcıyı ${action} istiyor musunuz?`)) return;
        try {
            const { db } = await import('@/lib/firebase');
            const { doc, updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(db, 'users', id), { is_blocked: !currentStatus });
            fetchUsers();
        } catch (error: any) {
            alert('Hata: ' + error.message);
        }
    };

    const makeAdmin = async (id: string) => {
        if (!confirm('Bu kullanıcıyı yönetici yapmak istiyor musunuz?')) return;
        try {
            const { db } = await import('@/lib/firebase');
            const { doc, updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(db, 'users', id), { role: 'admin' });
            fetchUsers();
        } catch (error: any) {
            alert('Hata: ' + error.message);
        }
    };

    const filtered = users.filter(u =>
        search === '' ||
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Üye Yönetimi</h2>
                    <p className="text-gray-500 text-sm mt-1">Toplam {users.length} üye</p>
                </div>
                <input
                    type="text"
                    placeholder="İsim veya e-posta ara..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 w-full sm:w-64"
                />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Yükleniyor...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Üye</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Katılma</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filtered.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm overflow-hidden flex-shrink-0">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} className="w-full h-full object-cover" alt={user.full_name} />
                                                    ) : (
                                                        (user.full_name || 'U').charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{user.full_name || '—'}</p>
                                                    <p className="text-gray-500 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${user.role === 'admin'
                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                : 'bg-gray-800 text-gray-400 border-gray-700'
                                                }`}>
                                                {user.role === 'admin' ? '👑 Yönetici' : 'Üye'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_blocked ? (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Engelli</span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">Aktif</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.role !== 'admin' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => makeAdmin(user.id)}
                                                        className="text-xs px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors"
                                                    >
                                                        Yönetici Yap
                                                    </button>
                                                    <button
                                                        onClick={() => toggleBlock(user.id, user.is_blocked || false)}
                                                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${user.is_blocked
                                                            ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                                            }`}
                                                    >
                                                        {user.is_blocked ? 'Engeli Kaldır' : 'Engelle'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                                            {search ? 'Eşleşen üye bulunamadı.' : 'Henüz üye yok.'}
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
