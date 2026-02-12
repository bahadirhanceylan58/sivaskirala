
// This service simulates a backend using localStorage so the app "works" immediately for the user.
// In the future, this will be replaced by direct Supabase calls.

export interface User {
    id: string;
    email: string;
    id: string;
    email: string;
    fullName: string;
    role: 'user' | 'admin';
    isBlocked?: boolean;
}

export interface Product {
    id: string;
    title: string;
    category: string;
    price: number;
    image: string;
    ownerId: string;
}

const STORAGE_KEYS = {
    USERS: 'sivas_users',
    SESSION: 'sivas_session',
    PRODUCTS: 'sivas_products',
};

export const MockService = {
    // --- AUTH ---
    register: async (email: string, fullName: string, password: string) => {
        await new Promise(r => setTimeout(r, 800)); // Simulate delay
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

        if (users.find((u: any) => u.email === email)) {
            throw new Error('Bu e-posta adresi zaten kayıtlı!');
        }

        const newUser: User = { id: crypto.randomUUID(), email, fullName, password, role: 'user' };
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

        // Auto login
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ id: newUser.id, email, fullName }));
        return newUser;
    },

    login: async (email: string, password: string) => {
        await new Promise(r => setTimeout(r, 800));
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const user = users.find((u: any) => u.email === email && u.password === password);

        if (!user) throw new Error('E-posta veya şifre hatalı!');

        if (!user) throw new Error('E-posta veya şifre hatalı!');
        if (user.isBlocked) throw new Error('Hesabınız engellenmiştir. Yönetici ile iletişime geçin.');

        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ id: user.id, email: user.email, fullName: user.fullName, role: user.role }));
        return user;
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        window.location.href = '/';
    },

    getCurrentUser: () => {
        if (typeof window === 'undefined') return null;
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || 'null');
    },

    // --- PRODUCTS ---
    addProduct: async (productData: Omit<Product, 'id'>) => {
        await new Promise(r => setTimeout(r, 800));
        const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
        const newProduct = { ...productData, id: crypto.randomUUID() };
        products.push(newProduct);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        return newProduct;
    },

    getProducts: async () => {
        // Return mock data + local data
        const localProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
        return [...localProducts]; // Add default mocks here if needed
    }
};
