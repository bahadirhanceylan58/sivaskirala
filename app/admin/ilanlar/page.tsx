'use client';

import { useEffect, useState } from 'react';

interface Product {
    id: string;
    title: string;
    price: number;
    category: string;
    status: string;
    image: string;
    created_at: string;
    ownerId: string;
    owner?: { full_name: string; email: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
    active: { label: 'Yayında', classes: 'bg-green-500/10 text-green-400 border-green-500/20' },
    pending: { label: 'Onay Bekliyor', classes: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    passive: { label: 'Pasif', classes: 'bg-gray-700 text-gray-400 border-gray-600' },
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { db } = await import('@/lib/firebase');
            const { collection, getDocs, orderBy, query, doc, getDoc } = await import('firebase/firestore');

            const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
            const querySnapshot = await getDocs(q);
            const productsData: Product[] = [];

            for (const docSnapshot of querySnapshot.docs) {
                const pData = docSnapshot.data();
                const product = { id: docSnapshot.id, ...pData } as Product;

                if (pData.ownerId) {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', pData.ownerId));
                        if (userDoc.exists()) {
                            const ud = userDoc.data();
                            product.owner = { full_name: ud.full_name || 'Bilinmiyor', email: ud.email || '-' };
                        }
                    } catch { /* skip */ }
                }
                productsData.push(product);
            }
            setProducts(productsData);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        const labels: Record<string, string> = { active: 'onaylamak', passive: 'pasife almak', pending: 'beklemede tutmak' };
        if (!confirm(`Bu ilanı ${labels[newStatus] || newStatus} istiyor musunuz?`)) return;
        try {
            const { db } = await import('@/lib/firebase');
            const { doc, updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(db, 'products', id), { status: newStatus });
            fetchProducts();
        } catch (error: any) {
            alert('Hata: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) return;
        try {
            const { db } = await import('@/lib/firebase');
            const { doc, deleteDoc } = await import('firebase/firestore');
            await deleteDoc(doc(db, 'products', id));
            fetchProducts();
        } catch (error: any) {
            alert('Hata: ' + error.message);
        }
    };

    const filtered = products.filter(p => {
        const matchStatus = filter === 'all' || p.status === filter;
        const matchSearch = search === '' ||
            p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.owner?.email?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">İlan Yönetimi</h2>
                    <p className="text-gray-500 text-sm mt-1">Toplam {products.length} ilan</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="İlan veya satıcı ara..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 w-full sm:w-56"
                    />
                    {/* Filter tabs */}
                    <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1">
                        {[
                            { value: 'all', label: 'Tümü' },
                            { value: 'pending', label: 'Bekleyen' },
                            { value: 'active', label: 'Aktif' },
                            { value: 'passive', label: 'Pasif' },
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
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Yükleniyor...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Ürün</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Satıcı</th>
                                    <th className="px-6 py-4">Fiyat</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filtered.map((product) => {
                                    const sc = STATUS_CONFIG[product.status] || STATUS_CONFIG.passive;
                                    return (
                                        <tr key={product.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0">
                                                        {product.image ? (
                                                            <img src={product.image} className="w-full h-full object-cover" alt={product.title} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">?</div>
                                                        )}
                                                    </div>
                                                    <span className="text-white text-sm font-medium line-clamp-1 max-w-[160px]">{product.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">{product.category}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-white text-sm">{product.owner?.full_name || '—'}</p>
                                                <p className="text-gray-500 text-xs">{product.owner?.email || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-green-400 font-semibold text-sm">{product.price} ₺</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.classes}`}>
                                                    {sc.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                                    {product.status !== 'active' && (
                                                        <button
                                                            onClick={() => updateStatus(product.id, 'active')}
                                                            className="text-xs px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
                                                        >
                                                            Onayla
                                                        </button>
                                                    )}
                                                    {product.status === 'active' && (
                                                        <button
                                                            onClick={() => updateStatus(product.id, 'passive')}
                                                            className="text-xs px-3 py-1.5 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
                                                        >
                                                            Pasife Al
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                                                    >
                                                        Sil
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                            {search || filter !== 'all' ? 'Filtreyle eşleşen ilan bulunamadı.' : 'Henüz ilan yok.'}
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
