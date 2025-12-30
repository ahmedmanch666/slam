import { useState } from 'react';
import { useData } from '../context/DataContext';
import Layout from '../components/Layout';

export default function Tasks() {
    const { data, saveItem, deleteItem, loading } = useData();
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const getRelatedName = (type, id) => {
        if (type === 'tender' && id) {
            const item = data.tenders.find(t => t.id === id);
            return item ? `مناقصة: ${item.title}` : 'مناقصة غير موجودة';
        }
        if (type === 'contract' && id) {
            const item = data.contracts.find(c => c.id === id);
            return item ? `عقد: ${item.title}` : 'عقد غير موجود';
        }
        return null;
    };

    const sortedTasks = [...data.tasks].sort((a, b) => {
        // Sort by status (pending first) then due date
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
    });

    const filteredItems = sortedTasks.filter(item =>
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.notes?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (item) => {
        if (confirm(`حذف المهمة "${item.title}"؟`)) {
            await deleteItem('tasks', item.id);
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

    const getPriorityColor = (p) => {
        switch (p) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'medium': return 'bg-orange-100 text-orange-700';
            case 'low': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPriorityLabel = (p) => {
        switch (p) {
            case 'high': return 'عال';
            case 'medium': return 'متوسط';
            case 'low': return 'منخفض';
            default: return p;
        }
    };

    const getStatusColor = (s) => {
        switch (s) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'in_progress': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-slate-100 text-slate-500';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (s) => {
        switch (s) {
            case 'pending': return 'قيد الانتظار';
            case 'in_progress': return 'جاري العمل';
            case 'completed': return 'مكتملة';
            case 'cancelled': return 'ملغاة';
            default: return s;
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">المهام</h1>
                        <p className="text-slate-600 mt-1">قائمة المهام والمتابعة</p>
                    </div>
                    <button onClick={handleAdd} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">
                        + إضافة مهمة
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                    <input
                        type="text"
                        placeholder="بحث في المهام..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                    />
                </div>

                {loading && <div className="text-center py-8 text-slate-500">جاري التحميل...</div>}

                {filteredItems.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <span className="text-5xl">📝</span>
                        <p className="text-slate-600 mt-4">لا يوجد مهام</p>
                        <button onClick={handleAdd} className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">
                            إضافة مهمة جديدة
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredItems.map(item => (
                            <div key={item.id} className={`bg-white rounded-2xl p-4 sm:p-5 border transition hover:shadow-lg ${item.status === 'completed' ? 'border-green-200 bg-green-50/50' : 'border-slate-200'}`}>
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            {item.priority && (
                                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${getPriorityColor(item.priority)}`}>
                                                    {getPriorityLabel(item.priority)}
                                                </span>
                                            )}
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {getStatusLabel(item.status)}
                                            </span>
                                            {item.dueDate && (
                                                <span className={`text-xs font-medium flex items-center gap-1 ${new Date(item.dueDate) < new Date() && item.status !== 'completed' ? 'text-red-600' : 'text-slate-500'}`}>
                                                    📅 {new Date(item.dueDate).toLocaleDateString('ar-SA')}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className={`text-lg font-bold text-slate-900 mb-1 ${item.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                                            {item.title}
                                        </h3>

                                        {item.notes && <p className="text-slate-600 text-sm mb-2">{item.notes}</p>}

                                        {item.relatedType && (
                                            <div className="text-xs bg-slate-100 inline-block px-2 py-1 rounded text-slate-600">
                                                🔗 {getRelatedName(item.relatedType, item.relatedId)}
                                            </div>
                                        )}
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
                    <TaskForm
                        item={editingItem}
                        data={data}
                        onClose={() => setShowForm(false)}
                        onSave={async (formData) => {
                            const success = await saveItem('tasks', formData);
                            if (success) setShowForm(false);
                        }}
                    />
                )}
            </div>
        </Layout>
    );
}

function TaskForm({ item, data, onClose, onSave }) {
    const [form, setForm] = useState({
        id: item?.id || crypto.randomUUID(),
        title: item?.title || '',
        status: item?.status || 'pending',
        priority: item?.priority || 'medium',
        relatedType: item?.relatedType || '',
        relatedId: item?.relatedId || '',
        dueDate: item?.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
        notes: item?.notes || '',
        created_at: item?.createdAt || Date.now()
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave({
                ...form,
                dueDate: form.dueDate ? new Date(form.dueDate).getTime() : null
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">{item ? 'تعديل مهمة' : 'إضافة مهمة'}</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">عنوان المهمة *</label>
                        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">الأولوية</label>
                            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500">
                                <option value="low">منخفضة</option>
                                <option value="medium">متوسطة</option>
                                <option value="high">عالية</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">الحالة</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500">
                                <option value="pending">قيد الانتظار</option>
                                <option value="in_progress">جاري العمل</option>
                                <option value="completed">مكتملة</option>
                                <option value="cancelled">ملغاة</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">مرتبط بـ</label>
                            <select value={form.relatedType} onChange={e => setForm({ ...form, relatedType: e.target.value, relatedId: '' })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500">
                                <option value="">(لا يوجد)</option>
                                <option value="tender">مناقصة</option>
                                <option value="contract">عقد</option>
                            </select>
                        </div>
                        {form.relatedType && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">العنصر المرتبط</label>
                                <select value={form.relatedId} onChange={e => setForm({ ...form, relatedId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500">
                                    <option value="">- اختر -</option>
                                    {form.relatedType === 'tender' && data.tenders.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                    {form.relatedType === 'contract' && data.contracts.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">تاريخ الاستحقاق</label>
                        <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
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
