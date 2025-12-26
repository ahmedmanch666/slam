import { useState } from 'react';
import { useData } from '../context/DataContext';
import Layout from '../components/Layout';

export default function Tenders() {
    const { data, saveItem, deleteItem, loading } = useData();
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingTender, setEditingTender] = useState(null);

    // Helper to get company name
    const getCompanyName = (id) => {
        const company = data.companies.find(c => c.id === id);
        return company ? company.name : 'غير محدد';
    };

    const filteredTenders = data.tenders.filter(t =>
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        getCompanyName(t.companyId)?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (tender) => {
        if (confirm(`حذف المناقصة "${tender.title}"؟`)) {
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
            case 'open': return 'مفتوحة';
            case 'closed': return 'مغلقة';
            case 'pending': return 'قيد الانتظار';
            default: return status;
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">المناقصات</h1>
                        <p className="text-slate-600 mt-1">إدارة ومتابعة المناقصات</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                    >
                        + إضافة مناقصة
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                    <input
                        type="text"
                        placeholder="بحث بعنوان المناقصة أو اسم الشركة..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                </div>

                {loading && (
                    <div className="text-center py-8 text-slate-500">جاري التحميل...</div>
                )}

                {/* Tenders List */}
                {filteredTenders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <span className="text-5xl">📄</span>
                        <p className="text-slate-600 mt-4">لا توجد مناقصات</p>
                        <button
                            onClick={handleAdd}
                            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                        >
                            إضافة أول مناقصة
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredTenders.map((tender) => (
                            <div
                                key={tender.id}
                                className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-slate-900">{tender.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(tender.status)}`}>
                                                {getStatusLabel(tender.status)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2">
                                            🏢 {getCompanyName(tender.companyId)}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            {tender.value && (
                                                <span>💰 {Number(tender.value).toLocaleString()} ر.س</span>
                                            )}
                                            {tender.submissionDate && (
                                                <span>📅 تسليم: {new Date(tender.submissionDate).toLocaleDateString('ar-SA')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mr-4">
                                        <button
                                            onClick={() => handleEdit(tender)}
                                            className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 transition"
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tender)}
                                            className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-sm hover:bg-red-200 transition"
                                        >
                                            حذف
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
                                alert('فشل حفظ المناقصة');
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
            alert('عنوان المناقصة مطلوب');
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
                        {tender ? 'تعديل مناقصة' : 'إضافة مناقصة'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            عنوان المناقصة *
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                            placeholder="مثال: توريد أجهزة حاسب"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            الشركة *
                        </label>
                        <select
                            value={form.companyId}
                            onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                        >
                            <option value="">اختر الشركة...</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                الحالة
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                            >
                                <option value="open">مفتوحة</option>
                                <option value="pending">قيد الانتظار</option>
                                <option value="closed">مغلقة</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                القيمة التقديرية (ر.س)
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
                            تاريخ التسليم
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
                            ملاحظات
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
                            {saving ? 'جاري الحفظ...' : (tender ? 'حفظ التعديلات' : 'إضافة')}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
