'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

// Fix Leaflet icon issue
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Product {
    id: string;
    title: string;
    price: number;
    image: string;
    category: string;
    description: string;
    lat?: number;
    lng?: number;
}

interface MapClusterProps {
    products: Product[];
}

// Component to update map center when products change
function MapUpdater({ products }: { products: Product[] }) {
    const map = useMap();

    useEffect(() => {
        const located = products.filter(p => p.lat && p.lng);
        if (located.length > 0) {
            const bounds = L.latLngBounds(located.map(p => [p.lat!, p.lng!]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [products, map]);

    return null;
}

export default function MapCluster({ products }: MapClusterProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="h-full w-full bg-gray-100 flex items-center justify-center">Harita Yükleniyor...</div>;

    // Sadece koordinatı olan ürünler haritada gösterilir
    const locatedProducts = products.filter(p => p.lat && p.lng);
    const center: [number, number] = [39.7505, 37.0150];

    return (
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locatedProducts.map((product) => (
                <Marker
                    key={product.id}
                    position={[product.lat!, product.lng!]}
                    icon={icon}
                >
                    <Popup>
                        <div className="w-48">
                            <div className="relative h-24 mb-2">
                                <img src={product.image} alt={product.title} className="w-full h-full object-cover rounded" />
                            </div>
                            <h3 className="font-bold text-sm mb-1">{product.title}</h3>
                            <p className="text-primary font-bold">{product.price} ₺</p>
                            <Link href={`/ilan/${product.id}`} className="block text-center bg-primary text-white text-xs py-1 rounded mt-2 hover:bg-green-700">
                                İncele
                            </Link>
                        </div>
                    </Popup>
                </Marker>
            ))}
            {locatedProducts.length === 0 && (
                <></>
            )}
            <MapUpdater products={locatedProducts} />
        </MapContainer>
    );
}
