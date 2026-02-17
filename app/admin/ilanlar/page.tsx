'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Product {
    id: string;
    title: string;
    price: number; // Changed from price_per_day to match Product interface
    category: string;
    status: string;
    image: string; // Changed from images array to single image string as per Add Item
    created_at: string;
    owner_id: string;
    owner?: {
        full_name: string;
        email: string;
    } | null;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { db } = await import('@/lib/firebase');
            const { collection, getDocs, orderBy, query, doc, getDoc } = await import('firebase/firestore');

            const q = query(collection(db, "products"), orderBy('created_at', 'desc'));
            const querySnapshot = await getDocs(q);

            const productsData: Product[] = [];

            // Fetch products and then their owners
            // Note: In a real app with many products, this N+1 query pattern is bad. 
            // Better to denormalize owner info into product doc or use an index.
            // For this scale, it's fine.
            for (const docSnapshot of querySnapshot.docs) {
                const pData = docSnapshot.data();
                const product = { id: docSnapshot.id, ...pData } as Product;

                if (pData.owner_id) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", pData.owner_id));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            product.owner = {
                                full_name: userData.full_name || 'Bilinmiyor',
                                email: userData.email || '-'
                            };
                        }
                    } catch (e) {
                        console.error("Error fetching owner", e);
                    }
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

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleApprove = async (id: string) => {
        if (!confirm('Bu ilanı onaylamak istiyor musunuz?')) return;

        try {
            const { db } = await import('@/lib/firebase');
            const { doc, updateDoc } = await import('firebase/firestore');

            const productRef = doc(db, "products", id);
            await updateDoc(productRef, { status: 'active' });

            alert('İlan onaylandı!');
            fetchProducts();
        } catch (error: any) {
            alert('Hata oluştu: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

        try {
            const { db } = await import('@/lib/firebase');
            const { doc, deleteDoc } = await import('firebase/firestore');

            await deleteDoc(doc(db, "products", id));

            alert('İlan silindi!');
            fetchProducts();
        } catch (error: any) {
            alert('Hata oluştu: ' + error.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">İlan Yönetimi</h2>
                <div className="text-sm text-gray-500">Toplam {products.length} ilan</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Ürün</th>
                            <th className="px-6 py-4">Kategori</th>
                            <th className="px-6 py-4">Satıcı</th>
                            <th className="px-6 py-4">Fiyat</th>
                            <th className="px-6 py-4">Durum</th>
                            <th className="px-6 py-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 relative overflow-hidden flex-shrink-0">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    className="w-full h-full object-cover"
                                                    alt={product.title}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Yok</div>
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-900 line-clamp-1 max-w-[200px]" title={product.title}>
                                            {product.title}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-sm">
                                    {product.category}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900">{product.owner ? product.owner.full_name : 'Bilinmiyor'}</p>
                                        <p className="text-gray-400 text-xs">{product.owner ? product.owner.email : '-'}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-900 font-medium text-sm">
                                    {product.price} ₺
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.status === 'active' ? 'bg-green-100 text-green-700' :
                                        product.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {product.status === 'active' ? 'Yayında' :
                                            product.status === 'pending' ? 'Onay Bekliyor' : product.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {product.status === 'pending' && (
                                        <button
                                            onClick={() => handleApprove(product.id)}
                                            className="text-green-600 hover:text-green-800 font-medium text-xs px-2 py-1 bg-green-50 rounded hover:bg-green-100 transition-colors"
                                        >
                                            Onayla
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                    >
                                        Sil
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Herhangi bir ilan bulunamadı.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
