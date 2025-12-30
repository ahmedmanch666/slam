import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Layout from '../components/Layout';

export default function Contracts() {
    const { data, saveItem, deleteItem, loading } = useData();
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // Auto-open add modal when ?add=true query param is present
    useEffect(() => {
        if (searchParams.get('add') === 'true') {
            setEditingItem(null);
            setShowForm(true);
            setSearchParams({});
        }
    }, [searchParams, setSearchParams]);

    const getCompanyName = (id) => data.companies.find(c => c.id === id)?.name || 'غير محدد';
    const getTenderTitle = (id) => data.tenders.find(t => t.id === id)?.title || 'غير محدد';

    const filteredItems = data.contracts.filter(c =>
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        getCompanyName(c.companyId)?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (item) => {
        if (confirm(`حذف العقد "${item.title}"؟`)) {
            await deleteItem('contracts', item.id);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setShowForm(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'draft': return 'bg-slate-100 text-slate-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'ساري';
            case 'completed': return 'مكتمل';
            case 'draft': return 'مسودة';
            case 'cancelled': return 'ملغي';
            default: return status;
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">العقود</h1>
                        <p className="text-slate-600 mt-1">إدارة العقود والاتفاقيات</p>
                    </div>
                    <button onClick={handleAdd} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">
                        + إضافة عقد
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                    <input
                        type="text"
                        placeholder="بحث بعنوان العقد أو اسم الشركة..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                    />
                </div>

                {loading && <div className="text-center py-8 text-slate-500">جاري التحميل...</div>}

                {filteredItems.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <span className="text-5xl">📄</span>
                        <p className="text-slate-600 mt-4">لا يوجد عقود</p>
                        <button onClick={handleAdd} className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">
                            إضافة أول عقد
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredItems.map(item => (
                            <div key={item.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:shadow-lg transition">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {getStatusLabel(item.status)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-600 mb-2 space-y-1">
                                            <p>🏢 {getCompanyName(item.companyId)}</p>
                                            {item.tenderId && <p>📋 مناقصة: {getTenderTitle(item.tenderId)}</p>}
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                                            {item.value && <span>💰 {Number(item.value).toLocaleString()} ج.م</span>}
                                            {item.start_date && <span>📅 يبدأ: {new Date(item.start_date).toLocaleDateString('ar-SA')}</span>}
                                            {item.end_date && <span>🏁 ينتهي: {new Date(item.end_date).toLocaleDateString('ar-SA')}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition"
                                        >
                                            🔓 Open
                                        </button>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 transition"
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item)}
                                            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm hover:bg-red-200 transition"
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showForm && (
                    <ContractForm
                        item={editingItem}
                        data={data}
                        onClose={() => setShowForm(false)}
                        onSave={async (formData) => {
                            const success = await saveItem('contracts', formData);
                            if (success) setShowForm(false);
                            else alert('فشل الحفظ');
                        }}
                    />
                )}
            </div>
        </Layout>
    );
}

function ContractForm({ item, data, onClose, onSave }) {
    const [form, setForm] = useState({
        id: item?.id || crypto.randomUUID(),
        title: item?.title || '',
        companyId: item?.companyId || '',
        tenderId: item?.tenderId || '',
        status: item?.status || 'draft',
        value: item?.value || '',
        start_date: item?.start_date ? new Date(item.start_date).toISOString().split('T')[0] : '',
        end_date: item?.end_date ? new Date(item.end_date).toISOString().split('T')[0] : '',
        notes: item?.notes || '',
        created_at: item?.created_at || Date.now()
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title) return alert('العنوان مطلوب');
        setSaving(true);
        try {
            await onSave({
                ...form,
                value: form.value ? Number(form.value) : null,
                start_date: form.start_date ? new Date(form.start_date).getTime() : null,
                end_date: form.end_date ? new Date(form.end_date).getTime() : null
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">{item ? 'تعديل عقد' : 'إضافة عقد'}</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">عنوان العقد *</label>
                        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">الشركة</label>
                            <select value={form.companyId} onChange={e => setForm({ ...form, companyId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500">
                                <option value="">- اختر -</option>
                                {data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">المناقصة المرتبطة</label>
                            <select value={form.tenderId} onChange={e => setForm({ ...form, tenderId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500">
                                <option value="">- اختر -</option>
                                {data.tenders.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">الحالة</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500">
                                <option value="draft">مسودة</option>
                                <option value="active">ساري</option>
                                <option value="completed">مكتمل</option>
                                <option value="cancelled">ملغي</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">القيمة (ج.م)</label>
                            <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">تاريخ البداية</label>
                            <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">تاريخ النهاية</label>
                            <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">ملاحظات</label>
                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" rows={3}></textarea>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
                            {saving ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
