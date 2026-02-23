'use client';

import { useState } from 'react';
import { WrenchScrewdriverIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface MigrationResult {
    checked: number;
    updated: number;
    skipped: number;
    errors: number;
}

export default function AdminMigrationPage() {
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<MigrationResult | null>(null);
    const [log, setLog] = useState<string[]>([]);

    const addLog = (msg: string) => setLog(prev => [...prev, msg]);

    const runMigration = async () => {
        if (!confirm('Tüm ilanlar taranacak ve owner_id alanı ownerId olarak güncellenecek. Devam?')) return;

        setRunning(true);
        setResult(null);
        setLog([]);

        const stats: MigrationResult = { checked: 0, updated: 0, skipped: 0, errors: 0 };

        try {
            const { db } = await import('@/lib/firebase');
            const { collection, getDocs, doc, updateDoc, deleteField } = await import('firebase/firestore');

            addLog('🔍 Firestore\'dan tüm ilanlar okunuyor...');
            const snap = await getDocs(collection(db, 'products'));
            addLog(`📦 ${snap.size} ilan bulundu.`);

            for (const docSnap of snap.docs) {
                stats.checked++;
                const data = docSnap.data();

                const hasOldField = 'owner_id' in data && data.owner_id;
                const hasNewField = 'ownerId' in data && data.ownerId;

                if (!hasOldField) {
                    // No owner_id to migrate
                    stats.skipped++;
                    continue;
                }

                if (hasNewField) {
                    // Already migrated, just remove old field
                    try {
                        await updateDoc(doc(db, 'products', docSnap.id), {
                            owner_id: deleteField(),
                        });
                        addLog(`🧹 "${data.title || docSnap.id}": eski owner_id alanı temizlendi.`);
                        stats.updated++;
                    } catch (e: any) {
                        addLog(`❌ "${data.title || docSnap.id}": temizleme hatası — ${e.message}`);
                        stats.errors++;
                    }
                    continue;
                }

                // Migrate: set ownerId, remove owner_id
                try {
                    await updateDoc(doc(db, 'products', docSnap.id), {
                        ownerId: data.owner_id,
                        owner_id: deleteField(),
                    });
                    addLog(`✅ "${data.title || docSnap.id}": owner_id → ownerId taşındı.`);
                    stats.updated++;
                } catch (e: any) {
                    addLog(`❌ "${data.title || docSnap.id}": güncelleme hatası — ${e.message}`);
                    stats.errors++;
                }
            }

            setResult(stats);
            addLog('');
            addLog(`🎉 Migrasyon tamamlandı: ${stats.updated} güncellendi, ${stats.skipped} atlandı, ${stats.errors} hata.`);

        } catch (error: any) {
            addLog(`🚨 Kritik hata: ${error.message}`);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold text-white">Veri Migrasyonu</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Eski <code className="bg-gray-800 text-orange-400 px-1.5 py-0.5 rounded text-xs">owner_id</code> alanını yeni{' '}
                    <code className="bg-gray-800 text-green-400 px-1.5 py-0.5 rounded text-xs">ownerId</code> alanına taşır.
                </p>
            </div>

            {/* Info Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                    <WrenchScrewdriverIcon className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-white font-semibold">Ne Yapılacak?</p>
                        <ul className="text-gray-400 text-sm mt-2 space-y-1 list-disc list-inside">
                            <li>Tüm <code className="text-orange-400">products</code> belgeleri taranır</li>
                            <li><code className="text-orange-400">owner_id</code> varsa → <code className="text-green-400">ownerId</code> olarak kopyalanır</li>
                            <li>Eski <code className="text-orange-400">owner_id</code> alanı silinir</li>
                            <li>Zaten <code className="text-green-400">ownerId</code> varsa sadece eski alan temizlenir</li>
                        </ul>
                    </div>
                </div>

                <button
                    onClick={runMigration}
                    disabled={running}
                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {running ? (
                        <>
                            <div className="h-4 w-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                            Çalışıyor...
                        </>
                    ) : (
                        <>
                            <WrenchScrewdriverIcon className="h-5 w-5" />
                            Migrasyonu Başlat
                        </>
                    )}
                </button>
            </div>

            {/* Result */}
            {result && (
                <div className={`bg-gray-900 border rounded-2xl p-6 ${result.errors > 0 ? 'border-red-500/30' : 'border-green-500/30'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        {result.errors > 0
                            ? <XCircleIcon className="h-6 w-6 text-red-400" />
                            : <CheckCircleIcon className="h-6 w-6 text-green-400" />
                        }
                        <h3 className="text-white font-bold">Sonuç</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Taranan', value: result.checked, color: 'text-blue-400' },
                            { label: 'Güncellenen', value: result.updated, color: 'text-green-400' },
                            { label: 'Atlandı', value: result.skipped, color: 'text-gray-400' },
                            { label: 'Hata', value: result.errors, color: 'text-red-400' },
                        ].map(s => (
                            <div key={s.label} className="bg-gray-800 rounded-xl p-4 text-center">
                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Log */}
            {log.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                        <p className="text-gray-400 text-sm font-medium">İşlem Günlüğü</p>
                        <button onClick={() => setLog([])} className="text-gray-600 hover:text-gray-400 text-xs">Temizle</button>
                    </div>
                    <div className="p-4 max-h-72 overflow-y-auto space-y-1 font-mono text-xs">
                        {log.map((line, i) => (
                            <p key={i} className={line.includes('✅') || line.includes('🎉') ? 'text-green-400' :
                                line.includes('❌') || line.includes('🚨') ? 'text-red-400' :
                                    line.includes('🧹') ? 'text-yellow-400' : 'text-gray-400'}>
                                {line}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
