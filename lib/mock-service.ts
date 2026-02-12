import { supabase } from './supabase';

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'user' | 'admin';
    isBlocked?: boolean;
    password?: string;
}

export interface Product {
    id: string;
    title: string;
    price: number;
    image: string;
    category: string;
    description: string;
    location: string;
    ownerId: string;
    features?: string[];
    sizes?: string[];
    // Supabase returns owner_id, we might need to map it or use snake_case
}

const STORAGE_KEYS = {
    USERS: 'sivas_users',
    SESSION: 'sivas_session',
    PRODUCTS: 'sivas_products',
};

// Fallback Mock Data (in case DB is empty)
const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        title: 'Sony A7 III Kamera + 24-70mm Lens',
        price: 1500,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000',
        category: 'Fotoğraf & Kamera',
        description: 'Profesyonel çekimleriniz için ideal set. 2 batarya ve çanta dahil.',
        location: 'Merkez, Sivas',
        ownerId: 'user1',
        features: ['24.2 MP Full-Frame Sensör', '4K Video Kaydı', '2 Adet Batarya', 'Taşıma Çantası', '64GB SD Kart']
    },
    {
        id: '2',
        title: 'Kamp Çadırı (4 Kişilik)',
        price: 300,
        image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=1000',
        category: 'Kamp & Outdoor',
        description: 'Su geçirmez, kurulumu kolay 4 mevsim çadır.',
        location: 'Kümbet, Sivas',
        ownerId: 'user2',
        features: ['Su Geçirmez', '4 Mevsim Kullanım', 'Hızlı Kurulum', 'Sinekli Pencereler']
    },
    {
        id: '3',
        title: 'Abiye Elbise - Zümrüt Yeşili',
        price: 750,
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=1000',
        category: 'Abiye & Giyim',
        description: 'Özel günleriniz için şık tasarım abiye. Kuru temizlemesi yapılmış.',
        location: 'Merkez, Sivas',
        ownerId: 'user1',
        sizes: ['36', '38', '40'],
        features: ['Kuru Temizleme Yapılmış', 'Orijinal Kılıfında', 'Tadilatsız']
    },
    {
        id: '4',
        title: 'JBL PartyBox 310 Hoparlör',
        price: 600,
        image: 'https://images.unsplash.com/photo-1544785365-c9676779432f?auto=format&fit=crop&q=80&w=1000',
        category: 'Ses & Görüntü',
        description: 'Yüksek ses kalitesi ve ışık şovları ile partiniz renklensin.',
        location: 'Merkez, Sivas',
        ownerId: 'user3',
        features: ['240W Güç', '18 Saat Pil Ömrü', 'Işık Efektleri', 'Mikrofon Girişi']
    }
];

export const MockService = {
    // --- AUTH ---
    // Legacy methods kept for compatibility, but mainly using Supabase direct calls in components
    register: async (email: string, fullName: string, password: string) => {
        // Just return a success mock for now if called, although RegisterPage uses Supabase directly
        return { id: 'mock', email, fullName };
    },

    login: async (email: string, password: string) => {
        // Just return a success mock for now if called, although LoginPage uses Supabase directly
        return { id: 'mock', email, fullName: 'Demo User' };
    },

    logout: () => {
        supabase.auth.signOut();
        window.location.href = '/';
    },

    getCurrentUser: () => {
        // Deprecated: Components should use useUser() or supabase.auth.getUser()
        return null;
    },

    // --- PRODUCTS ---
    getProducts: async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error || !data || data.length === 0) {
                console.warn('Supabase products empty or error, falling back to mock data:', error);
                return MOCK_PRODUCTS;
            }

            // Map database columns to Product interface if needed
            // Our Schema: title, category, price_per_day etc.
            // Interface: title, category, price, etc.
            return data.map((item: any) => ({
                id: item.id,
                title: item.title,
                price: item.price_per_day, // Map database column to interface
                category: item.category,
                image: item.images && item.images.length > 0 ? item.images[0] : '',
                description: item.description,
                location: item.location,
                ownerId: item.owner_id,
                features: item.features,
                sizes: item.sizes
            })) as Product[];

        } catch (e) {
            console.error(e);
            return MOCK_PRODUCTS;
        }
    },

    getProduct: async (id: string) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                // Fallback check in mock data
                return MOCK_PRODUCTS.find(p => p.id === id) || null;
            }

            return {
                id: data.id,
                title: data.title,
                price: data.price_per_day,
                category: data.category,
                image: data.images && data.images.length > 0 ? data.images[0] : '',
                description: data.description,
                location: data.location,
                ownerId: data.owner_id,
                features: data.features,
                sizes: data.sizes
            } as Product;

        } catch (e) {
            console.error(e);
            return MOCK_PRODUCTS.find(p => p.id === id) || null;
        }
    },

    // --- CART (Local Storage for now) ---
    addToCart: (product: Product, duration: number) => {
        if (typeof window === 'undefined') return;

        const cart = JSON.parse(localStorage.getItem('sivas_cart') || '[]');
        const existingItem = cart.find((item: any) => item.product.id === product.id);

        if (existingItem) {
            existingItem.duration = duration; // Update duration
        } else {
            cart.push({ product, duration });
        }

        localStorage.setItem('sivas_cart', JSON.stringify(cart));

        // Dispatch event for Navbar update
        window.dispatchEvent(new Event('storage'));
    },

    getCart: () => {
        if (typeof window === 'undefined') return [];
        return JSON.parse(localStorage.getItem('sivas_cart') || '[]');
    },

    removeFromCart: (cartId: string) => {
        // Implemented if needed
    }
};
