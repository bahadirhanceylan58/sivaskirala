'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const CONTACT_INFO = [
    { icon: '📧', label: 'E-posta', value: 'info@sivaskirala.com', href: 'mailto:info@sivaskirala.com' },
    { icon: '📱', label: 'Telefon', value: '+90 555 555 55 55', href: 'tel:+905555555555' },
    { icon: '📍', label: 'Adres', value: 'Sivas, Türkiye', href: null },
    { icon: '🕐', label: 'Çalışma Saatleri', value: 'Hft. içi 09:00 – 18:00', href: null },
];

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        // Simüle — gerçek entegrasyon için /api/send-email kullanılabilir
        await new Promise(r => setTimeout(r, 1000));
        toast.success('Mesajınız alındı! En kısa sürede dönüş yapacağız.');
        setName(''); setEmail(''); setSubject(''); setMessage('');
        setSending(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">

                {/* Hero */}
                <div className="bg-gradient-to-br from-primary to-green-700 text-white py-20 px-4">
                    <div className="container mx-auto max-w-3xl text-center">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">İletişim</h1>
                        <p className="text-green-100 text-lg">Sorularınız için buradayız. Size en kısa sürede dönüş yaparız.</p>
                    </div>
                </div>

                <div className="container mx-auto max-w-5xl px-4 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

                        {/* Form */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Mesaj Gönder</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Adınız</label>
                                        <input type="text" required value={name} onChange={e => setName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none text-sm"
                                            placeholder="Ad Soyad" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">E-posta</label>
                                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none text-sm"
                                            placeholder="ornek@mail.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Konu</label>
                                    <select value={subject} onChange={e => setSubject(e.target.value)} required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none text-sm">
                                        <option value="">Konu Seçin</option>
                                        <option value="genel">Genel Bilgi</option>
                                        <option value="teknik">Teknik Sorun</option>
                                        <option value="sikayet">Şikayet</option>
                                        <option value="oneri">Öneri</option>
                                        <option value="diger">Diğer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mesajınız</label>
                                    <textarea rows={5} required value={message} onChange={e => setMessage(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none text-sm resize-none"
                                        placeholder="Mesajınızı buraya yazın..." />
                                </div>
                                <button type="submit" disabled={sending}
                                    className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60">
                                    {sending ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-5">İletişim Bilgileri</h2>
                                <div className="space-y-4">
                                    {CONTACT_INFO.map((item, i) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <span className="text-2xl">{item.icon}</span>
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
                                                {item.href ? (
                                                    <a href={item.href} className="text-sm text-gray-800 hover:text-primary transition-colors font-medium">
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm text-gray-800 font-medium">{item.value}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-900 mb-3">Sosyal Medya</h3>
                                <div className="flex gap-3">
                                    {[
                                        { label: 'Instagram', color: 'bg-pink-500', short: 'IG' },
                                        { label: 'Twitter', color: 'bg-sky-500', short: 'TW' },
                                        { label: 'Facebook', color: 'bg-blue-600', short: 'FB' },
                                    ].map((s, i) => (
                                        <button key={i} aria-label={s.label}
                                            className={`${s.color} text-white text-xs font-bold w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity`}>
                                            {s.short}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                                <p className="text-sm text-green-800 font-medium mb-1">⚡ Hızlı Yanıt</p>
                                <p className="text-xs text-green-700">Genellikle mesajlara 4 saat içinde dönüş yapıyoruz.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
