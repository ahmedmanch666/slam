import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Layout from '../components/Layout';

export default function Companies() {
    const { data, saveItem, deleteItem, loading } = useData();
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);

    const filteredCompanies = data.companies.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone1?.includes(search)
    );

    const handleDelete = async (company) => {
        if (confirm(`حذف الشركة "${company.name}"؟`)) {
            await deleteItem('companies', company.id);
        }
    };

    const handleEdit = (company) => {
        setEditingCompany(company);
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditingCompany(null);
        setShowForm(true);
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">الشركات</h1>
                        <p className="text-slate-600 mt-1">إدارة الشركات والبيانات الأساسية</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                    >
                        + إضافة شركة
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو الهاتف..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                </div>

                {loading && (
                    <div className="text-center py-8 text-slate-500">جاري التحميل...</div>
                )}

                {/* Companies List */}
                {filteredCompanies.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <span className="text-5xl">🏢</span>
                        <p className="text-slate-600 mt-4">لا توجد شركات</p>
                        <button
                            onClick={handleAdd}
                            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                        >
                            إضافة أول شركة
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredCompanies.map((company) => (
                            <div
                                key={company.id}
                                className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{company.name}</h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {company.sector || 'بدون قطاع'} • {company.phone1 || 'بدون هاتف'}
                                        </p>
                                        {company.email && (
                                            <p className="text-sm text-slate-500">{company.email}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(company)}
                                            className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 transition"
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(company)}
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
                    <CompanyForm
                        company={editingCompany}
                        onClose={() => setShowForm(false)}
                        onSave={async (companyData) => {
                            await saveItem('companies', companyData);
                            setShowForm(false);
                        }}
                    />
                )}
            </div>
        </Layout>
    );
}

function CompanyForm({ company, onClose, onSave }) {
    const [form, setForm] = useState({
        id: company?.id || crypto.randomUUID(),
        name: company?.name || '',
        sector: company?.sector || '',
        phone1: company?.phone1 || '',
        phone2: company?.phone2 || '',
        email: company?.email || '',
        address: company?.address || '',
        website: company?.website || '',
        notes: company?.notes || '',
        createdAt: company?.createdAt || Date.now()
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            alert('اسم الشركة مطلوب');
            return;
        }
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
                        {company ? 'تعديل شركة' : 'إضافة شركة'}
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
                            اسم الشركة *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                            placeholder="مثال: شركة XYZ"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                القطاع
                            </label>
                            <input
                                type="text"
                                value={form.sector}
                                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                                placeholder="حكومي / خاص"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                الهاتف
                            </label>
                            <input
                                type="tel"
                                value={form.phone1}
                                onChange={(e) => setForm({ ...form, phone1: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                                placeholder="05xxxxxxxx"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            البريد الإلكتروني
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                            dir="ltr"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            العنوان
                        </label>
                        <input
                            type="text"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
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
                            {saving ? 'جاري الحفظ...' : (company ? 'حفظ التعديلات' : 'إضافة')}
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
