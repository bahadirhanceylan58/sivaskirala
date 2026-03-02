'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const getIcon = () => {
    if (typeof window === 'undefined') return null;
    return new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
    readOnly?: boolean;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    const icon = getIcon();
    return position === null || !icon ? null : <Marker position={position} icon={icon} />;
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng, readOnly = false }: LocationPickerProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    if (!isMounted) return <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-500">Harita yükleniyor...</div>;

    const center: [number, number] = initialLat && initialLng ? [initialLat, initialLng] : [39.7505, 37.0150];
    const icon = getIcon();

    return (
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={!readOnly} dragging={!readOnly}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {readOnly && initialLat && initialLng && icon ? (
                <Marker position={[initialLat, initialLng]} icon={icon} />
            ) : (
                <LocationMarker onLocationSelect={onLocationSelect} />
            )}
        </MapContainer>
    );
}
