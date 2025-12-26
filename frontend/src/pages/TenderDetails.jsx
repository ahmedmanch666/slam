import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

// Sub-components will be defined here or imported
// For simplicity, defining them efficiently in one file first

export default function TenderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: globalData, saveItem } = useData(); // Global data serves for cache
    const { auth } = useAuth();

    const [tender, setTender] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);

    // Sub-data states
    const [items, setItems] = useState([]);
    const [competitors, setCompetitors] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        if (globalData.tenders) {
            const found = globalData.tenders.find(t => t.id === id);
            if (found) {
                setTender(found);
                loadSubData(found.id);
            } else {
                // If not found in global (page refresh?), ideally fetch or wait
                // For now, assuming Global Load happens first.
                // Or we can fetch single if needed.
                if (!globalData.loading) setLoading(false);
            }
        }
    }, [id, globalData.tenders]);

    const loadSubData = async (tenderId) => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${auth.accessToken}` };

            // Parallel fetch
            const [iRes, cRes, aRes, invRes] = await Promise.all([
                fetch(`/api/data/tender_items?tender_id=${tenderId}`, { headers }),
                fetch(`/api/data/tender_competitors?tender_id=${tenderId}`, { headers }),
                fetch(`/api/data/tender_attachments?tender_id=${tenderId}`, { headers }),
                fetch(`/api/data/invoices?tender_id=${tenderId}`, { headers })
            ]);

            const [iData, cData, aData, invData] = await Promise.all([
                iRes.json(), cRes.json(), aRes.json(), invRes.json()
            ]);

            setItems(iData.items || []);
            setCompetitors(cData.items || []);
            setAttachments(aData.items || []);
            setInvoices(invData.items || []);

        } catch (err) {
            console.error(err);
            alert('فشل تحميل تفاصيل المناقصة');
        } finally {
            setLoading(false);
        }
    };

    if (!tender) return <Layout><div>جاري التحميل...</div></Layout>;

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/tenders')} className="text-slate-400 hover:text-indigo-600 transition">
                                ➡️ عودة
                            </button>
                            <h1 className="text-2xl font-bold text-slate-900">{tender.title}</h1>
                        </div>
                        <p className="text-slate-500 mt-1 mr-8">
                            {globalData.companies.find(c => c.id === tender.companyId)?.name || 'شركة غير محددة'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200">
                            🖨️ طباعة تقرير
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1">
                    {[
                        { id: 'general', label: 'ℹ️ المعلومات الأساسية' },
                        { id: 'items', label: '📦 الأصناف والمواصفات' },
                        { id: 'competitors', label: '🤝 المنافسين' },
                        { id: 'invoices', label: '💰 الفواتير والمالية' },
                        { id: 'images', label: '🖼️ الصور والمرفقات' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 min-h-[500px]">
                    {activeTab === 'general' && <GeneralTab tender={tender} refresh={() => navigate(0)} />}
                    {activeTab === 'items' && <ItemsTab items={items} tenderId={tender.id} refresh={() => loadSubData(tender.id)} />}
                    {activeTab === 'competitors' && <CompetitorsTab competitors={competitors} tenderId={tender.id} refresh={() => loadSubData(tender.id)} />}
                    {activeTab === 'images' && <AttachmentsTab attachments={attachments} tenderId={tender.id} refresh={() => loadSubData(tender.id)} />}
                    {activeTab === 'invoices' && <InvoicesTab invoices={invoices} tenderId={tender.id} refresh={() => loadSubData(tender.id)} />}
                </div>
            </div>
        </Layout>
    );
}

// --- Tab Components Placeholders ---

// --- Tab Components ---

function GeneralTab({ tender, refresh }) {
    const { saveItem } = useData();
    const [form, setForm] = useState({ ...tender });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const success = await saveItem('tenders', form);
        if (success) {
            alert('تم حفظ التعديلات بنجاح');
            refresh();
        }
        setSaving(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">عنوان المناقصة</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الحالة</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 border rounded-lg">
                    <option value="open">مفتوحة</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="closed">مغلقة</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">القيمة التقديرية</label>
                <input type="number" name="value" value={form.value || ''} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">حالة الضريبة</label>
                <select name="vat_status" value={form.vat_status || 'exclusive'} onChange={handleChange} className="w-full p-2 border rounded-lg">
                    <option value="exclusive">غير شامل الضريبة (15%)</option>
                    <option value="inclusive">شامل الضريبة</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ التسليم</label>
                <input type="date" name="submission_date"
                    value={form.submission_date ? new Date(form.submission_date).toISOString().split('T')[0] : ''}
                    onChange={handleChange} className="w-full p-2 border rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">مدة التوريد المسموحة</label>
                <input type="text" name="delivery_duration" value={form.delivery_duration || ''} onChange={handleChange} placeholder="مثال: 30 يوم" className="w-full p-2 border rounded-lg" />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ اعتماد العينة</label>
                <input type="date" name="sample_date"
                    value={form.sample_date ? new Date(form.sample_date).toISOString().split('T')[0] : ''}
                    onChange={handleChange} className="w-full p-2 border rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ اعتماد البروفة</label>
                <input type="date" name="proof_date"
                    value={form.proof_date ? new Date(form.proof_date).toISOString().split('T')[0] : ''}
                    onChange={handleChange} className="w-full p-2 border rounded-lg"
                />
            </div>

            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">تعليمات المدير العام</label>
                <textarea name="gm_instructions" value={form.gm_instructions || ''} onChange={handleChange} rows={2} className="w-full p-2 border rounded-lg" />
            </div>

            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">تعليمات المدير المباشر</label>
                <textarea name="dm_instructions" value={form.dm_instructions || ''} onChange={handleChange} rows={2} className="w-full p-2 border rounded-lg" />
            </div>

            <div className="col-span-2 mt-4">
                <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
            </div>
        </form>
    );
}

function ItemsTab({ items, tenderId, refresh }) {
    const { auth } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الصنف؟')) return;
        try {
            await fetch('/api/data/tender_items', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            refresh();
        } catch (e) { alert('فشل الحذف'); }
    };

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold">قائمة الأصناف</h3>
                <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
                    + إضافة صنف جديد
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">اسم الصنف</th>
                            <th className="px-6 py-3">الكمية</th>
                            <th className="px-6 py-3">المواصفات الفنية</th>
                            <th className="px-6 py-3">جدول التوريد</th>
                            <th className="px-6 py-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4">لا توجد أصناف مضافة</td></tr>
                        ) : items.map(item => {
                            const specs = typeof item.specifications === 'string' ? JSON.parse(item.specifications || '{}') : item.specifications;
                            return (
                                <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                                    <td className="px-6 py-4">{item.quantity}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs space-y-1">
                                            {specs.carton_type && <div><strong>النوع:</strong> {specs.carton_type}</div>}
                                            {specs.layer_type && <div><strong>الطبقات:</strong> {specs.layer_type}</div>}
                                            {specs.grammage && <div><strong>الجرام:</strong> {specs.grammage}</div>}
                                            {specs.print_colors && <div><strong>ألوان:</strong> {specs.print_colors}</div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 truncate max-w-xs">{item.delivery_schedule}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="text-blue-600 hover:underline">تعديل</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">حذف</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <ItemModal
                    tenderId={tenderId}
                    item={editingItem}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); refresh(); }}
                />
            )}
        </div>
    );
}

function ItemModal({ tenderId, item, onClose, onSave }) {
    const { auth } = useAuth();
    const [form, setForm] = useState({
        id: item?.id || crypto.randomUUID(),
        tender_id: tenderId,
        name: item?.name || '',
        quantity: item?.quantity || 0,
        specifications: typeof item?.specifications === 'string' ? JSON.parse(item.specifications) : (item?.specifications || {}),
        delivery_schedule: item?.delivery_schedule || ''
    });

    const handleSpecChange = (field, value) => {
        setForm(prev => ({
            ...prev,
            specifications: { ...prev.specifications, [field]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/data/tender_items', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            onSave();
        } catch (e) { alert('فشل الحفظ'); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{item ? 'تعديل صنف' : 'إضافة صنف جديد'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold">اسم الصنف</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded" required />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">الكمية المطلوبة</label>
                            <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full p-2 border rounded" />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-bold text-slate-700 mb-3">المواصفات الفنية</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs">نوع الكرتون</label>
                                <select value={form.specifications.carton_type || ''} onChange={e => handleSpecChange('carton_type', e.target.value)} className="w-full p-2 border rounded text-sm">
                                    <option value="">- اختر -</option>
                                    <option value="duplex">دوبلكس</option>
                                    <option value="bristol">برستول كوشيه</option>
                                    <option value="kraft">كرافت</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs">نوع التضليع</label>
                                <select value={form.specifications.flute_type || ''} onChange={e => handleSpecChange('flute_type', e.target.value)} className="w-full p-2 border rounded text-sm">
                                    <option value="">- اختر -</option>
                                    <option value="c">C Flute</option>
                                    <option value="e">E Flute</option>
                                    <option value="be">BE Flute</option>
                                    <option value="micro">Micro Flute</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs">طبقات الورق</label>
                                <select value={form.specifications.layers || ''} onChange={e => handleSpecChange('layers', e.target.value)} className="w-full p-2 border rounded text-sm">
                                    <option value="">- اختر -</option>
                                    <option value="3">3 طبقات</option>
                                    <option value="5">5 طبقات</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs">عدد الألوان</label>
                                <input type="number" value={form.specifications.print_colors || ''} onChange={e => handleSpecChange('print_colors', e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="مثال: 4" />
                            </div>
                            <div>
                                <label className="text-xs">الجرام (جم)</label>
                                <input type="text" value={form.specifications.grammage || ''} onChange={e => handleSpecChange('grammage', e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="مثال: 150/120/150" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <label className="text-xs">المقاسات (طول × عرض × ارتفاع)</label>
                            <input type="text" value={form.specifications.dimensions || ''} onChange={e => handleSpecChange('dimensions', e.target.value)} className="w-full p-2 border rounded text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold">جدول التوريد (سنوي)</label>
                        <textarea value={form.delivery_schedule} onChange={e => setForm({ ...form, delivery_schedule: e.target.value })} className="w-full p-2 border rounded" rows={2} placeholder="تفاصيل التوريد المطلوبة..." />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded">حفظ</button>
                        <button type="button" onClick={onClose} className="px-4 bg-slate-100 rounded">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CompetitorsTab({ competitors, tenderId, refresh }) {
    const { auth } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [editingComp, setEditingComp] = useState(null);

    const handleDelete = async (id) => {
        if (!confirm('حذف هذا المنافس؟')) return;
        try {
            await fetch('/api/data/tender_competitors', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            refresh();
        } catch (e) { alert('فشل الحذف'); }
    };

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold">قائمة المنافسين</h3>
                <button onClick={() => { setEditingComp(null); setShowModal(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
                    + إضافة منافس
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">اسم المنافس</th>
                            <th className="px-6 py-3">السعر</th>
                            <th className="px-6 py-3">التفاصيل</th>
                            <th className="px-6 py-3">الحالة</th>
                            <th className="px-6 py-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {competitors.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4">لا يوجد منافسين</td></tr>
                        ) : competitors.map(comp => (
                            <tr key={comp.id} className={`border-b ${comp.is_winner ? 'bg-green-50' : 'bg-white'}`}>
                                <td className="px-6 py-4 font-medium text-slate-900">{comp.name}</td>
                                <td className="px-6 py-4 font-bold">{Number(comp.price).toLocaleString()} ر.س</td>
                                <td className="px-6 py-4 truncate max-w-xs">{comp.details}</td>
                                <td className="px-6 py-4">
                                    {comp.is_winner ? <span className="text-green-600 font-bold">🏆 تم الترسية</span> : '-'}
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => { setEditingComp(comp); setShowModal(true); }} className="text-blue-600 hover:underline">تعديل</button>
                                    <button onClick={() => handleDelete(comp.id)} className="text-red-600 hover:underline">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <CompetitorModal
                    tenderId={tenderId}
                    comp={editingComp}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); refresh(); }}
                />
            )}
        </div>
    );
}

function CompetitorModal({ tenderId, comp, onClose, onSave }) {
    const { auth } = useAuth();
    const [form, setForm] = useState({
        id: comp?.id || crypto.randomUUID(),
        tender_id: tenderId,
        name: comp?.name || '',
        price: comp?.price || 0,
        details: comp?.details || '',
        is_winner: comp?.is_winner || false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/data/tender_competitors', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            onSave();
        } catch (e) { alert('فشل الحفظ'); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{comp ? 'تعديل منافس' : 'إضافة منافس'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold">اسم المنافس</label>
                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">السعر المقدم</label>
                        <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">ملاحظات / تفاصيل</label>
                        <textarea value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} className="w-full p-2 border rounded" rows={3} />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="is_winner" checked={form.is_winner} onChange={e => setForm({ ...form, is_winner: e.target.checked })} className="w-5 h-5 rounded" />
                        <label htmlFor="is_winner" className="text-sm font-semibold cursor-pointer">ترسية المناقصة على هذا المنافس؟</label>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded">حفظ</button>
                        <button type="button" onClick={onClose} className="px-4 bg-slate-100 rounded">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AttachmentsTab({ attachments, tenderId, refresh }) {
    const { auth } = useAuth();
    const [url, setUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!url) return;
        setUploading(true);
        try {
            await fetch('/api/data/tender_attachments', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: crypto.randomUUID(),
                    tender_id: tenderId,
                    type: 'image',
                    url: url,
                    description: 'صورة مضافة'
                })
            });
            setUrl('');
            refresh();
        } catch (e) { alert('فشل الإضافة'); }
        setUploading(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('حذف هذه الصورة؟')) return;
        try {
            await fetch('/api/data/tender_attachments', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            refresh();
        } catch (e) { alert('فشل الحذف'); }
    };

    return (
        <div>
            <form onSubmit={handleAdd} className="flex gap-2 mb-6 p-4 bg-slate-50 rounded-xl">
                <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="ضع رابط الصورة هنا (http://...)"
                    className="flex-1 p-2 border rounded-lg dir-ltr"
                    required
                />
                <button type="submit" disabled={uploading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    {uploading ? 'جاري الإضافة...' : 'إضافة رابط'}
                </button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {attachments.map(att => (
                    <div key={att.id} className="group relative bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                        <img src={att.url} alt="attachment" className="w-full h-40 object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Error'} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="bg-white/20 text-white p-2 rounded-full hover:bg-white/40">👁️</a>
                            <button onClick={() => handleDelete(att.id)} className="bg-red-500/80 text-white p-2 rounded-full hover:bg-red-600">🗑️</button>
                        </div>
                    </div>
                ))}
            </div>
            {attachments.length === 0 && <div className="text-center py-8 text-slate-500">لا توجد صور مضافة</div>}
        </div>
    );
}

function InvoicesTab({ invoices, tenderId, refresh }) {
    const { auth } = useAuth();
    const [showModal, setShowModal] = useState(false);

    const handleDelete = async (id) => {
        if (!confirm('حذف هذه الفاتورة؟')) return;
        try {
            await fetch('/api/data/invoices', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            refresh();
        } catch (e) { alert('فشل الحذف'); }
    };

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold">الفواتير</h3>
                <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
                    + إضافة فاتورة
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">التاريخ</th>
                            <th className="px-6 py-3">الكمية</th>
                            <th className="px-6 py-3">المبلغ</th>
                            <th className="px-6 py-3">قيمة الضريبة</th>
                            <th className="px-6 py-3">الإجمالي</th>
                            <th className="px-6 py-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-4">لا توجد فواتير</td></tr>
                        ) : invoices.map(inv => (
                            <tr key={inv.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4">{new Date(inv.date).toLocaleDateString('ar-SA')}</td>
                                <td className="px-6 py-4">{inv.quantity}</td>
                                <td className="px-6 py-4">{Number(inv.amount).toLocaleString()}</td>
                                <td className="px-6 py-4 text-red-600">{Number(inv.vat_amount).toLocaleString()}</td>
                                <td className="px-6 py-4 font-bold">{(Number(inv.amount) + Number(inv.vat_amount)).toLocaleString()} ر.س</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDelete(inv.id)} className="text-red-600 hover:underline">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <InvoiceModal
                    tenderId={tenderId}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); refresh(); }}
                />
            )}
        </div>
    );
}

function InvoiceModal({ tenderId, onClose, onSave }) {
    const { auth } = useAuth();
    const [form, setForm] = useState({
        id: crypto.randomUUID(),
        tender_id: tenderId,
        date: new Date().toISOString().split('T')[0],
        amount: '',
        quantity: '',
        vat_amount: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/data/invoices', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    date: new Date(form.date).getTime(),
                    amount: Number(form.amount),
                    quantity: Number(form.quantity),
                    vat_amount: Number(form.vat_amount)
                })
            });
            onSave();
        } catch (e) { alert('فشل الحفظ'); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">إضافة فاتورة</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold">تاريخ الفاتورة</label>
                        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">الكمية الموردة</label>
                        <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">المبلغ (بدون ضريبة)</label>
                        <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">قيمة الضريبة المضافة</label>
                        <input type="number" value={form.vat_amount} onChange={e => setForm({ ...form, vat_amount: e.target.value })} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded">حفظ</button>
                        <button type="button" onClick={onClose} className="px-4 bg-slate-100 rounded">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
