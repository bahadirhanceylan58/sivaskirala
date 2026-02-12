"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Fragment, useState } from 'react';
import { MagnifyingGlassIcon, ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50 border-b-4 border-primary">
            {/* Top Bar (Mobile/Desktop) */}
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex-shrink-0">
                    <Image
                        src="/logo.jpg"
                        alt="Sivas Kirala"
                        width={180}
                        height={60}
                        className="h-14 w-auto object-contain"
                        priority
                    />
                </Link>

                {/* Search Bar - Hidden on mobile, visible on lg */}
                <div className="hidden lg:flex flex-1 max-w-2xl mx-8 relative">
                    <input
                        type="text"
                        placeholder="Ürün, kategori veya marka ara..."
                        className="w-full border border-gray-300 rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors hover:border-primary"
                    />
                    <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-full hover:bg-red-700 transition-colors">
                        <MagnifyingGlassIcon className="h-4 w-4" />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                    <Link href="/giris-yap" className="hidden lg:flex items-center text-gray-700 hover:text-primary font-medium transition-colors">
                        <UserIcon className="h-6 w-6 mr-1" />
                        <span>Giriş Yap</span>
                    </Link>
                    <Link href="/ilan-ver" className="hidden lg:block bg-primary text-white px-5 py-2 rounded-full font-bold hover:bg-secondary transition-transform hover:scale-105 shadow-md shadow-green-100">
                        İlan Ver
                    </Link>
                    <Link href="/cart" className="relative group">
                        <ShoppingCartIcon className="h-6 w-6" />
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">0</span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden text-gray-700 hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <XMarkIcon className="h-6 w-6" />
                        ) : (
                            <Bars3Icon className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Categories Bar - Desktop Only */}
            <nav className="hidden lg:block border-t border-gray-100 bg-gray-50/50">
                {/* Dynamic Category Links (Desktop) */}
                <div className="container mx-auto px-4 py-3 flex space-x-6 text-sm font-medium text-gray-600 overflow-x-auto no-scrollbar">
                    <Link href="/kategori/organizasyon" className="hover:text-primary whitespace-nowrap">Organizasyon & Düğün</Link>
                    <Link href="/kategori/ses-goruntu" className="hover:text-primary whitespace-nowrap">Ses & Görüntü</Link>
                    <Link href="/kategori/abiye-giyim" className="hover:text-primary whitespace-nowrap">Abiye & Giyim</Link>
                    <Link href="/kategori/kamera" className="hover:text-primary whitespace-nowrap">Fotoğraf & Kamera</Link>
                    <Link href="/kategori/kamp" className="hover:text-primary whitespace-nowrap">Kamp & Outdoor</Link>
                    <Link href="/kategori/elektronik" className="hover:text-primary whitespace-nowrap">Elektronik</Link>
                </div>
            </nav>
            {/* Mobile Menu */}

            {/* Mobile Menu & Search */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-100 bg-white">
                    <div className="p-4 space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ara..."
                                className="w-full border border-gray-300 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                        <nav className="flex flex-col space-y-3 pt-2">
                            <Link href="/kategori/elektronik" className="text-gray-700 hover:text-primary font-medium">Elektronik</Link>
                            <Link href="/kategori/giyim" className="text-gray-700 hover:text-primary font-medium">Giyim & Aksesuar</Link>
                            <Link href="/kategori/anne-bebek" className="text-gray-700 hover:text-primary font-medium">Anne & Bebek</Link>
                            <Link href="/kategori/spor-outdoor" className="text-gray-700 hover:text-primary font-medium">Spor & Outdoor</Link>
                            <Link href="/kategori/hobi-oyun" className="text-gray-700 hover:text-primary font-medium">Hobi & Oyun</Link>
                            <Link href="/kategori/ev-yasam" className="text-gray-700 hover:text-primary font-medium">Ev & Yaşam</Link>
                            <div className="border-t border-gray-100 pt-3 mt-2 flex flex-col gap-3">
                                <Link href="/giris-yap" className="flex items-center space-x-2 text-gray-700 hover:text-primary font-medium">
                                    <UserIcon className="h-5 w-5" />
                                    <span>Giriş Yap / Üye Ol</span>
                                </Link>
                                <Link href="/ilan-ver" className="flex items-center justify-center space-x-2 bg-primary text-white py-2 rounded-lg font-bold hover:bg-secondary">
                                    <span>+ İlan Ver</span>
                                </Link>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
