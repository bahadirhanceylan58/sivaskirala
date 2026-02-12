'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from '@/lib/mock-service';
import { ChartBarIcon, CubeIcon, UsersIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            const { supabase } = await import('@/lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                window.location.href = '/giris-yap';
                return;
            }

            // Check if user is admin in profiles table
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (profile?.role === 'admin') {
                setIsAdmin(true);
            } else {
                window.location.href = '/';
            }
            setLoading(false);
        };

        checkAdmin();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
    if (!isAdmin) return null;

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex-shrink-0">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-bold text-green-400">Yönetim Paneli</h1>
                    <p className="text-xs text-gray-400 mt-1">Sivas Kirala Admin</p>
                </div>

                <nav className="p-4 space-y-2">
                    <Link href="/admin" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
                        <ChartBarIcon className="h-5 w-5" />
                        <span>Genel Bakış</span>
                    </Link>
                    <Link href="/admin/ilanlar" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
                        <CubeIcon className="h-5 w-5" />
                        <span>İlan Yönetimi</span>
                    </Link>
                    <Link href="/admin/uyeler" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
                        <UsersIcon className="h-5 w-5" />
                        <span>Üyeler</span>
                    </Link>
                </nav>

                <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800">
                    <Link href="/" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-900/20 text-red-400 transition-colors">
                        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                        <span>Siteye Dön</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
