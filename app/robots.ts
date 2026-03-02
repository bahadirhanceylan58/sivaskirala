import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/hesabim/', '/mesajlar/', '/api/'],
            },
        ],
        sitemap: 'https://sivaskirala.vercel.app/sitemap.xml',
    };
}
