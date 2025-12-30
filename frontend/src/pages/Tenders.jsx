import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Layout from '../components/Layout';

export default function Tenders() {
    const { data, saveItem, deleteItem, loading } = useData();
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingTender, setEditingTender] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // Auto-open add modal when ?add=true query param is present
    useEffect(() => {
        if (searchParams.get('add') === 'true') {
            setEditingTender(null);
            setShowForm(true);
            setSearchParams({});
        }
    }, [searchParams, setSearchParams]);

    // Helper to get company name
    const getCompanyName = (id) => {
        const company = data.companies.find(c => c.id === id);
        return company ? company.name : 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
    };

    const filteredTenders = data.tenders.filter(t =>
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        getCompanyName(t.companyId)?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (tender) => {
        if (confirm(`Ø­Ø°Ù Ø§Ù„Ù…Ù†Ø§Ù‚ØµØ© "${tender.title}"ØŸ`)) {
            await deleteItem('tenders', tender.id);
        }
    };

    const handleEdit = (tender) => {
        setEditingTender(tender);
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditingTender(null);
        setShowForm(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-green-100 text-green-700';
            case 'closed': return 'bg-red-100 text-red-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return 'Ù…ÙØªÙˆØ­Ø©';
            case 'closed': return 'Ù…ØºÙ„Ù‚Ø©';
            case 'pending': return 'Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±';
            default: return status;
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Ø§Ù„Ù…Ù†Ø§Ù‚ØµØ§Øª</h1>
                        <p className="text-slate-600 mt-1">Ø¥Ø¯Ø§Ø±Ø© ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ù…Ù†Ø§Ù‚ØµØ§Øª</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                    >
                        + Ø¥Ø¶Ø§ÙØ© Ù…Ù†Ø§Ù‚ØµØ©
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                    <input
                        type="text"
                        placeholder="Ø¨Ø­Ø« Ø¨Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…Ù†Ø§Ù‚ØµØ© Ø£Ùˆ Ø§Ø³Ù… Ø§Ù„Ø´Ø±ÙƒØ©..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                </div>

                {loading && (
                    <div className="text-center py-8 text-slate-500">Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù…ÙŠÙ„...</div>
                )}

                {/* Tenders List */}
                {filteredTenders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <span className="text-5xl">ðŸ“„</span>
                        <p className="text-slate-600 mt-4">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù†Ø§Ù‚ØµØ§Øª</p>
                        <button
                            onClick={handleAdd}
                            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                        >
                            Ø¥Ø¶Ø§ÙØ© Ø£ÙˆÙ„ Ù…Ù†Ø§Ù‚ØµØ©
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredTenders.map((tender) => (
                            <div
                                key={tender.id}
                                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:shadow-lg transition"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <Link
                                                to={`/tenders/${tender.id}`}
                                                className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition"
                                            >
                                                {tender.title}
                                            </Link>
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(tender.status)}`}>
                                                {getStatusLabel(tender.status)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2">
                                            ðŸ¢ {getCompanyName(tender.companyId)}
                                        </p>
                                        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                                            {tender.value && (
                                                <span>ðŸ’° {Number(tender.value).toLocaleString()} Ø±.Ø³</span>
                                            )}
                                            {tender.submissionDate && (
                                                <span>ðŸ“… ØªØ³Ù„ÙŠÙ…: {new Date(tender.submissionDate).toLocaleDateString('ar-SA')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                                        <Link
                                            to={`/tenders/${tender.id}`}
                                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition text-center"
                                        >
                                            ðŸ”“ Open
                                        </Link>
                                        <button
                                            onClick={() => handleEdit(tender)}
                                            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 transition"
                                        >
                                            ØªØ¹Ø¯ÙŠÙ„
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tender)}
                                            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm hover:bg-red-200 transition"
                                        >
                                            Ø­Ø°Ù
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Form Modal */}
                {showForm && (
                    <TenderForm
                        tender={editingTender}
                        companies={data.companies}
                        onClose={() => setShowForm(false)}
                        onSave={async (itemData) => {
                            const success = await saveItem('tenders', itemData);
                            if (success) {
                                setShowForm(false);
                            } else {
                                alert('ÙØ´Ù„ Ø­ÙØ¸ Ø§Ù„Ù…Ù†Ø§Ù‚ØµØ©');
                            }
                        }}
                    />
                )}
            </div>
        </Layout>
    );
}

function TenderForm({ tender, companies, onClose, onSave }) {
    const [form, setForm] = useState({
        id: tender?.id || crypto.randomUUID(),
        title: tender?.title || '',
        companyId: tender?.companyId || '',
        status: tender?.status || 'open',
        value: tender?.value || '',
        submissionDate: tender?.submissionDate ? new Date(tender.submissionDate).toISOString().split('T')[0] : '',
        notes: tender?.notes || '',
        createdAt: tender?.createdAt || Date.now()
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            alert('Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…Ù†Ø§Ù‚ØµØ© Ù…Ø·Ù„ÙˆØ¨');
            return;
        }
        setSaving(true);
        try {
            await onSave({
                ...form,
                submissionDate: form.submissionDate ? new Date(form.submissionDate).getTime() : null,
                value: form.value ? Number(form.value) : null
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                        {tender ? 'ØªØ¹Ø¯ÙŠÙ„ Ù…Ù†Ø§Ù‚ØµØ©' : 'Ø¥Ø¶Ø§ÙØ© Ù…Ù†Ø§Ù‚ØµØ©'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                    >
                        âœ•
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…Ù†Ø§Ù‚ØµØ© *
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                            placeholder="Ù…Ø«Ø§Ù„: ØªÙˆØ±ÙŠØ¯ Ø£Ø¬Ù‡Ø²Ø© Ø­Ø§Ø³Ø¨"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Ø§Ù„Ø´Ø±ÙƒØ© *
                        </label>
                        <select
                            value={form.companyId}
                            onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                        >
                            <option value="">Ø§Ø®ØªØ± Ø§Ù„Ø´Ø±ÙƒØ©...</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Ø§Ù„Ø­Ø§Ù„Ø©
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                            >
                                <option value="open">Ù…ÙØªÙˆØ­Ø©</option>
                                <option value="pending">Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±</option>
                                <option value="closed">Ù…ØºÙ„Ù‚Ø©</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠØ© (Ø±.Ø³)
                            </label>
                            <input
                                type="number"
                                value={form.value}
                                onChange={(e) => setForm({ ...form, value: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            ØªØ§Ø±ÙŠØ® Ø§Ù„ØªØ³Ù„ÙŠÙ…
                        </label>
                        <input
                            type="date"
                            value={form.submissionDate}
                            onChange={(e) => setForm({ ...form, submissionDate: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Ù…Ù„Ø§Ø­Ø¸Ø§Øª
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                            {saving ? 'Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø­ÙØ¸...' : (tender ? 'Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª' : 'Ø¥Ø¶Ø§ÙØ©')}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
                        >
                            Ø¥Ù„ØºØ§Ø¡
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
