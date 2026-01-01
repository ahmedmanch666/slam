import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import { useDebounce } from '../hooks/useDebounce';

export default function Tenders() {
    const { data, saveItem, deleteItem, loading } = useData();
    const { success, error } = useToast();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [showForm, setShowForm] = useState(false);
    const [editingTender, setEditingTender] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Auto-open add modal when ?add=true query param is present
    useEffect(() => {
        if (searchParams.get('add') === 'true') {
            setTimeout(() => {
                setEditingTender(null);
                setShowForm(true);
                setSearchParams({});
            }, 0);
        }
    }, [searchParams, setSearchParams]);

    // Helper to get company name
    const getCompanyName = (id) => {
        const company = data.companies.find(c => c.id === id);
        return company ? company.name : 'غير محدد';
    };

    const filteredTenders = data.tenders.filter(t => {
        // Text Search
        const matchText =
            t.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            getCompanyName(t.companyId)?.toLowerCase().includes(debouncedSearch.toLowerCase());

        // Status Filter
        const matchStatus = statusFilter ? t.status === statusFilter : true;

        // Date Filter
        const tDate = t.created_at || 0;
        const matchStart = startDate ? tDate >= new Date(startDate).getTime() : true;
        const matchEnd = endDate ? tDate <= new Date(endDate).getTime() : true;

        return matchText && matchStatus && matchStart && matchEnd;
    });

    const handleDelete = async (tender) => {
        if (confirm(`حذف المناقصة "${tender.title}"؟`)) {
            const res = await deleteItem('tenders', tender.id);
            if (res) success('تم حذف المناقصة بنجاح');
            else error('فشل حذف المناقصة');
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
            case 'won': return 'bg-blue-100 text-blue-700';
            case 'lost': return 'bg-gray-100 text-gray-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return 'مفتوحة';
            case 'closed': return 'مغلقة';
            case 'pending': return 'قيد الانتظار';
            case 'won': return 'فائز';
            case 'lost': return 'خاسر';
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

                {/* Filters & Search */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-4">
                    <input
                        type="text"
                        placeholder="بحث بعنوان المناقصة أو اسم الشركة..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                    <div className="flex flex-wrap gap-4">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-slate-200 bg-white"
                        >
                            <option value="">الكل (الحالة)</option>
                            <option value="open">مفتوحة</option>
                            <option value="pending">قيد الانتظار</option>
                            <option value="closed">مغلقة</option>
                            <option value="won">فائز</option>
                            <option value="lost">خاسر</option>
                        </select>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">من:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="px-4 py-2 rounded-xl border border-slate-200"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">إلى:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="px-4 py-2 rounded-xl border border-slate-200"
                            />
                        </div>

                        {(statusFilter || startDate || endDate || search) && (
                            <button
                                onClick={() => { setSearch(''); setStatusFilter(''); setStartDate(''); setEndDate(''); }}
                                className="text-red-500 text-sm hover:underline px-2"
                            >
                                ✖ إعادة تعيين
                            </button>
                        )}
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-8 text-slate-500">جاري التحميل...</div>
                )}

                {/* Tenders List */}
                {filteredTenders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <span className="text-5xl">📋</span>
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
                            <Link
                                key={tender.id}
                                to={`/tenders/${tender.id}`}
                                className="block bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition group"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                                                {tender.title}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(tender.status)}`}>
                                                {getStatusLabel(tender.status)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 space-y-1">
                                            <p>🏢 {getCompanyName(tender.companyId)}</p>
                                            <p>📅 تاريخ: {new Date(tender.created_at).toLocaleDateString('ar-SA')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleEdit(tender);
                                            }}
                                            className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 transition"
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDelete(tender);
                                            }}
                                            className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-sm hover:bg-red-200 transition"
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Form Modal */}
                {showForm && (
                    <TenderForm
                        tender={editingTender}
                        data={data}
                        onClose={() => setShowForm(false)}
                        onSave={async (tenderData) => {
                            const res = await saveItem('tenders', tenderData);
                            if (res) {
                                success('تم حفظ المناقصة بنجاح');
                                setShowForm(false);
                            } else {
                                error('فشل حفظ المناقصة');
                            }
                        }}
                    />
                )}
            </div>
        </Layout>
    );
}

function TenderForm({ tender, data, onClose, onSave }) {
    const [form, setForm] = useState({
        id: tender?.id || crypto.randomUUID(),
        title: tender?.title || '',
        companyId: tender?.companyId || '',
        status: tender?.status || 'open',
        notes: tender?.notes || '',
        created_at: tender?.created_at || Date.now()
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Allow saving without all required fields
        setSaving(true);
        try {
            await onSave({ ...form, updatedAt: Date.now() });
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
                            الشركة
                        </label>
                        <select
                            value={form.companyId}
                            onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                        >
                            <option value="">- اختر الشركة -</option>
                            {data.companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

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
                            <option value="won">فائز</option>
                            <option value="lost">خاسر</option>
                        </select>
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
                            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center"
                        >
                            {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : (tender ? 'حفظ التعديلات' : 'إضافة')}
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
