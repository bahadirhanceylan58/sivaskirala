'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ChartBarIcon,
    CubeIcon,
    UsersIcon,
    ArrowLeftOnRectangleIcon,
    CalendarDaysIcon,
    ChatBubbleLeftRightIcon,
    Bars3Icon,
    XMarkIcon,
    ShieldCheckIcon,
    WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const ADMIN_EMAIL = 'bahadirhanceylan@gmail.com';

const navItems = [
    { href: '/admin', label: 'Genel Bakış', icon: ChartBarIcon, exact: true },
    { href: '/admin/ilanlar', label: 'İlan Yönetimi', icon: CubeIcon },
    { href: '/admin/rezervasyonlar', label: 'Rezervasyonlar', icon: CalendarDaysIcon },
    { href: '/admin/uyeler', label: 'Üyeler', icon: UsersIcon },
    { href: '/admin/yorumlar', label: 'Yorumlar', icon: ChatBubbleLeftRightIcon },
    { href: '/admin/migrasyon', label: 'Veri Migrasyonu', icon: WrenchScrewdriverIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const { auth, db } = await import('@/lib/firebase');
                const { onAuthStateChanged } = await import('firebase/auth');
                const { doc, getDoc } = await import('firebase/firestore');

                onAuthStateChanged(auth, async (user) => {
                    if (!user) {
                        window.location.href = '/giris-yap';
                        return;
                    }

                    // Admin check: hardcoded email OR Firestore role
                    const isEmailAdmin = user.email === ADMIN_EMAIL;

                    let isRoleAdmin = false;
                    try {
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        if (userDoc.exists()) {
                            isRoleAdmin = userDoc.data().role === 'admin';
                        }
                    } catch (e) {
                        console.error('Error checking role:', e);
                    }

                    if (isEmailAdmin || isRoleAdmin) {
                        setIsAdmin(true);
                        setAdminUser({
                            name: user.displayName || user.email?.split('@')[0] || 'Admin',
                            email: user.email || '',
                        });
                    } else {
                        window.location.href = '/';
                        return;
                    }

                    setLoading(false);
                });
            } catch (error) {
                console.error('Admin check error:', error);
                window.location.href = '/giris-yap';
            }
        };

        checkAdmin();
    }, []);

    const handleSignOut = async () => {
        const { auth } = await import('@/lib/firebase');
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        window.location.href = '/';
    };

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <ShieldCheckIcon className="h-12 w-12 text-green-500 animate-pulse" />
                    <p className="text-gray-400 text-sm">Yetki kontrol ediliyor...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
                        <ShieldCheckIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white leading-none">Yönetim</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Sivas Kirala</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const active = isActive(item.href, item.exact);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${active
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'
                                }`}
                        >
                            <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-green-400' : ''}`} />
                            {item.label}
                            {active && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Info + Logout */}
            <div className="p-4 border-t border-gray-800 space-y-2">
                {adminUser && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-sm flex-shrink-0">
                            {adminUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-white text-xs font-semibold truncate">{adminUser.name}</p>
                            <p className="text-gray-500 text-xs truncate">{adminUser.email}</p>
                        </div>
                    </div>
                )}

                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm"
                >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    Siteye Dön
                </Link>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-white hover:bg-red-900/30 transition-colors text-sm"
                >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    Çıkış Yap
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-gray-950">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col bg-gray-900 border-r border-gray-800 flex-shrink-0 fixed h-full z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="relative w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-50">
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Mobile Top Bar */}
                <header className="lg:hidden sticky top-0 z-20 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-400 hover:text-white"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="h-5 w-5 text-green-400" />
                        <span className="text-white font-semibold text-sm">Yönetim Paneli</span>
                    </div>
                </header>

                <main className="flex-1 p-6 lg:p-8 bg-gray-950">
                    {children}
                </main>
            </div>
        </div>
    );
}
