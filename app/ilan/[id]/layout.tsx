import { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const { id } = await params;

        // Fetch from Firestore REST API (no Admin SDK needed)
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${id}`;
        const res = await fetch(url, { next: { revalidate: 3600 } });

        if (!res.ok) return { title: 'Sivas Kirala' };

        const doc = await res.json();
        const fields = doc.fields || {};

        const title = fields.title?.stringValue || 'Kiralık Ürün';
        const desc = fields.description?.stringValue || '';
        const price = fields.price?.doubleValue || fields.price?.integerValue || '';
        const image = fields.image?.stringValue || '/og-image.png';
        const description = desc
            ? desc.slice(0, 155) + (desc.length > 155 ? '...' : '')
            : `Sivas Kirala'da günlük ${price} ₺'ye kiralık ${title}. Hemen kirala!`;

        return {
            title,
            description,
            openGraph: {
                title: `${title} | Sivas Kirala`,
                description,
                images: [{ url: image, width: 800, height: 600, alt: title }],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${title} | Sivas Kirala`,
                description,
                images: [image],
            },
        };
    } catch {
        return { title: 'Sivas Kirala' };
    }
}

export default function IlanLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
