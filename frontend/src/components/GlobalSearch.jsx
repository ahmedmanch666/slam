import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

export default function GlobalSearch({ onClose }) {
    const navigate = useNavigate();
    const { data } = useData();
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const results = useMemo(() => {
        if (!query.trim()) return [];

        const q = query.toLowerCase();
        const allResults = [];

        // Search companies
        data.companies.forEach(item => {
            if (item.name?.toLowerCase().includes(q) || item.notes?.toLowerCase().includes(q)) {
                allResults.push({ type: 'company', label: item.name, path: '/companies', icon: '🏢', id: item.id });
            }
        });

        // Search tenders
        data.tenders.forEach(item => {
            if (item.title?.toLowerCase().includes(q) || item.notes?.toLowerCase().includes(q)) {
                allResults.push({ type: 'tender', label: item.title, path: `/tenders/${item.id}`, icon: '📋', id: item.id });
            }
        });

        // Search contracts
        data.contracts.forEach(item => {
            if (item.title?.toLowerCase().includes(q) || item.notes?.toLowerCase().includes(q)) {
                allResults.push({ type: 'contract', label: item.title, path: '/contracts', icon: '📄', id: item.id });
            }
        });

        // Search tasks
        data.tasks.forEach(item => {
            if (item.title?.toLowerCase().includes(q) || item.notes?.toLowerCase().includes(q)) {
                allResults.push({ type: 'task', label: item.title, path: '/tasks', icon: '✅', id: item.id });
            }
        });

        return allResults.slice(0, 10); // Limit to 10 results
    }, [query, data]);

    const handleSelect = (result) => {
        navigate(result.path);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🔍</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="ابحث في الشركات، المناقصات، العقود، المهام..."
                            className="flex-1 text-lg outline-none bg-transparent"
                        />
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
                    </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {results.length === 0 && query.trim() && (
                        <div className="p-6 text-center text-slate-500">
                            لا توجد نتائج لـ "{query}"
                        </div>
                    )}

                    {results.map((result) => (
                        <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleSelect(result)}
                            className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition text-right"
                        >
                            <span className="text-2xl">{result.icon}</span>
                            <div className="flex-1">
                                <div className="font-semibold text-slate-900">{result.label}</div>
                                <div className="text-xs text-slate-500">
                                    {result.type === 'company' && 'شركة'}
                                    {result.type === 'tender' && 'مناقصة'}
                                    {result.type === 'contract' && 'عقد'}
                                    {result.type === 'task' && 'مهمة'}
                                </div>
                            </div>
                            <span className="text-slate-400">→</span>
                        </button>
                    ))}
                </div>

                <div className="p-3 border-t border-slate-200 text-center text-xs text-slate-400">
                    اضغط ESC للإغلاق
                </div>
            </div>
        </div>
    );
}
