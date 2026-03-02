import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Sivas Kirala',
        short_name: 'Sivas Kirala',
        description: "Sivas'ta her şeyi günlük kirala",
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#16a34a',
        orientation: 'portrait',
        categories: ['shopping', 'lifestyle'],
        lang: 'tr',
        icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
        shortcuts: [
            {
                name: 'İlan Ver',
                short_name: 'İlan Ver',
                description: 'Yeni ilan oluştur',
                url: '/ilan-ver',
                icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
            },
            {
                name: 'Arama',
                short_name: 'Ara',
                description: 'Ürün ara',
                url: '/arama',
                icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
            },
        ],
    };
}
