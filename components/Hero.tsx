'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SLIDES = [
    {
        id: 1,
        title: "En Özel Günlerin İçin Şıklığı Kirala",
        category: "Abiye & Giyim",
        image: "https://images.unsplash.com/photo-1566479179817-0b9e6c2f7c9e?q=80&w=1920&auto=format&fit=crop",
        gradient: "from-purple-900 via-pink-900 to-rose-900",
        cta: "Koleksiyonu Keşfet",
        link: "/kategori/abiye-giyim",
    },
    {
        id: 2,
        title: "Doğayla Buluş, Macerayı Kirala",
        category: "Kamp & Outdoor",
        image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1920&auto=format&fit=crop",
        gradient: "from-green-900 via-emerald-900 to-teal-900",
        cta: "Doğaya Çık",
        link: "/kategori/kamp",
    },
    {
        id: 3,
        title: "Sinema Keyfini Evine Taşı",
        category: "Projeksiyon Sistemleri",
        image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=1920&auto=format&fit=crop",
        gradient: "from-gray-900 via-slate-800 to-zinc-900",
        cta: "İncele",
        link: "/kategori/elektronik",
    },
    {
        id: 4,
        title: "Profesyonel Ses, Eğlenceyi Katla",
        category: "Ses & Görüntü",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1920&auto=format&fit=crop",
        gradient: "from-indigo-900 via-violet-900 to-purple-900",
        cta: "Partiyi Başlat",
        link: "/kategori/ses-goruntu",
    },
];

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gray-900 group">
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Background */}
                    <div className={`relative w-full h-full transform transition-transform duration-[5000ms] ease-out ${index === currentSlide ? 'scale-110' : 'scale-100'}`}>
                        {!imgErrors[slide.id] ? (
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover opacity-60"
                                onError={() => setImgErrors(prev => ({ ...prev, [slide.id]: true }))}
                            />
                        ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${slide.gradient} opacity-80`} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    </div>

                    {/* Text */}
                    <div className="absolute inset-0 flex items-center justify-center text-center px-4 z-30 pointer-events-none">
                        <div className={`max-w-4xl transform transition-all duration-1000 delay-300 pointer-events-auto ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-green-300 text-sm font-bold mb-4 backdrop-blur-sm border border-primary/30 uppercase tracking-wider">
                                {slide.category}
                            </span>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                                {slide.title}
                            </h1>
                            <Link
                                href={slide.link}
                                className="inline-block bg-primary hover:bg-green-600 text-white font-bold py-3 px-8 md:py-4 md:px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-xl shadow-green-900/50"
                            >
                                {slide.cta}
                            </Link>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Dots */}
            <div className="absolute bottom-5 left-0 right-0 z-40 flex justify-center gap-3">
                {SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'w-3 bg-white/40 hover:bg-white/70'}`}
                        aria-label={`Slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Progress Bar */}
            <div
                key={currentSlide}
                className="absolute bottom-0 left-0 h-1 bg-primary z-30"
                style={{ animation: 'heroProgress 5s linear forwards' }}
            />
            <style>{`
                @keyframes heroProgress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
}
