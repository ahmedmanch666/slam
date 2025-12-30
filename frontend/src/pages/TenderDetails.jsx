import { useState, useEffect, useRef } from 'react';
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
                fetch(`/api/data?type=tender_items&tender_id=${tenderId}`, { headers }),
                fetch(`/api/data?type=tender_competitors&tender_id=${tenderId}`, { headers }),
                fetch(`/api/data?type=tender_attachments&tender_id=${tenderId}`, { headers }),
                fetch(`/api/data?type=invoices&tender_id=${tenderId}`, { headers })
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
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <button onClick={() => navigate('/tenders')} className="text-indigo-600 hover:text-indigo-800 transition text-sm font-medium">
                                    ← عودة للمناقصات
                                </button>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{tender.title}</h1>
                            <p className="text-slate-500 mt-1 text-sm sm:text-base">
                                🏢 {globalData.companies.find(c => c.id === tender.companyId)?.name || 'شركة غير محددة'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 text-sm">
                                🖨️ طباعة
                            </button>
                        </div>
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
                        { id: 'reports', label: '📊 التقارير' },
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
                    {activeTab === 'reports' && <ReportsTab tender={tender} items={items} competitors={competitors} invoices={invoices} />}
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
            await fetch('/api/data?type=tender_items', {
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
        delivery_schedule: typeof item?.delivery_schedule === 'string' ? JSON.parse(item.delivery_schedule || '{}') : (item?.delivery_schedule || {})
    });

    const handleSpecChange = (field, value) => {
        setForm(prev => ({
            ...prev,
            specifications: { ...prev.specifications, [field]: value }
        }));
    };

    const handleScheduleChange = (month, value) => {
        setForm(prev => ({
            ...prev,
            delivery_schedule: { ...prev.delivery_schedule, [month]: Number(value) || 0 }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/data?type=tender_items', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            onSave();
        } catch (e) { alert('فشل الحفظ'); }
    };

    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    const fluteTypes = [
        { value: 'c', label: 'C Flute' },
        { value: 'e', label: 'E Flute' },
        { value: 'b', label: 'B Flute' },
        { value: 'be', label: 'BE Flute (مزدوج)' },
        { value: 'bc', label: 'BC Flute (مزدوج)' },
        { value: 'ee', label: 'EE Flute (مزدوج)' },
        { value: 'bb', label: 'BB Flute (مزدوج)' },
        { value: 'micro', label: 'Micro Flute (ميكروفلوت)' },
        { value: 'f', label: 'F Flute' },
        { value: 'n', label: 'N Flute' }
    ];

    const cartonTypes = [
        { value: 'duplex', label: 'دوبلكس' },
        { value: 'triplex', label: 'تريبلكس' },
        { value: 'bristol', label: 'برستول كوشيه' },
        { value: 'kraft', label: 'كرافت' },
        { value: 'white_kraft', label: 'كرافت أبيض' },
        { value: 'corrugated', label: 'مموج (كرتون مضلع)' },
        { value: 'grey_board', label: 'جراي بورد' },
        { value: 'ivory', label: 'آيفوري' },
        { value: 'folding_box', label: 'فولدينج بوكس' }
    ];

    const coatingOptions = [
        { value: 'none', label: 'بدون' },
        { value: 'matt_lamination', label: 'لامينيشن مط' },
        { value: 'gloss_lamination', label: 'لامينيشن لامع' },
        { value: 'uv_spot', label: 'UV جزئي' },
        { value: 'uv_full', label: 'UV كامل' },
        { value: 'varnish', label: 'ورنيش' },
        { value: 'aqueous', label: 'طلاء مائي' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{item ? 'تعديل صنف' : 'إضافة صنف جديد'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold block mb-1">اسم الصنف *</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded-lg" required />
                        </div>
                        <div>
                            <label className="text-sm font-semibold block mb-1">الكمية الإجمالية المطلوبة</label>
                            <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full p-2 border rounded-lg" />
                        </div>
                    </div>

                    {/* Technical Specifications */}
                    <div className="border-t pt-4">
                        <h3 className="font-bold text-indigo-700 mb-4 text-lg">📐 المواصفات الفنية</h3>

                        {/* Carton Type & Flute */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="text-xs font-medium text-slate-600">نوع الكرتون</label>
                                <select value={form.specifications.carton_type || ''} onChange={e => handleSpecChange('carton_type', e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                                    <option value="">- اختر -</option>
                                    {cartonTypes.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">نوع التضليع (Flute)</label>
                                <select value={form.specifications.flute_type || ''} onChange={e => handleSpecChange('flute_type', e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                                    <option value="">- اختر -</option>
                                    {fluteTypes.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">عدد طبقات الورق</label>
                                <select value={form.specifications.layers || ''} onChange={e => handleSpecChange('layers', e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                                    <option value="">- اختر -</option>
                                    <option value="3">3 طبقات</option>
                                    <option value="5">5 طبقات</option>
                                    <option value="7">7 طبقات</option>
                                </select>
                            </div>
                        </div>

                        {/* Paper Grammage & Colors */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="text-xs font-medium text-slate-600">جرامات الورق (مثال: 150/127/150)</label>
                                <input type="text" value={form.specifications.paper_grammage || ''} onChange={e => handleSpecChange('paper_grammage', e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="جرام/جرام/جرام" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">عدد ألوان الطباعة</label>
                                <input type="number" min="0" max="12" value={form.specifications.print_colors || ''} onChange={e => handleSpecChange('print_colors', e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="مثال: 4" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">التشطيب / الطلاء</label>
                                <select value={form.specifications.coating || ''} onChange={e => handleSpecChange('coating', e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                                    <option value="">- اختر -</option>
                                    {coatingOptions.map(co => <option key={co.value} value={co.value}>{co.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Dimensions */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs font-medium text-slate-600">المقاسات الخارجية (طول × عرض × ارتفاع) سم</label>
                                <input type="text" value={form.specifications.dimensions_outer || ''} onChange={e => handleSpecChange('dimensions_outer', e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="مثال: 30 × 20 × 15" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">المقاسات الداخلية (طول × عرض × ارتفاع) سم</label>
                                <input type="text" value={form.specifications.dimensions_inner || ''} onChange={e => handleSpecChange('dimensions_inner', e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="مثال: 28 × 18 × 13" />
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label className="text-xs font-medium text-slate-600">ملاحظات فنية إضافية</label>
                            <textarea value={form.specifications.notes || ''} onChange={e => handleSpecChange('notes', e.target.value)} className="w-full p-2 border rounded-lg text-sm" rows={2} placeholder="أي تفاصيل إضافية..." />
                        </div>
                    </div>

                    {/* Monthly Delivery Schedule */}
                    <div className="border-t pt-4">
                        <h3 className="font-bold text-emerald-700 mb-4 text-lg">📅 جدول التوريد السنوي (الكمية المطلوبة شهرياً)</h3>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                            {months.map((month, idx) => (
                                <div key={month} className="text-center">
                                    <label className="text-xs text-slate-500 block mb-1">{month}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.delivery_schedule[idx + 1] || ''}
                                        onChange={e => handleScheduleChange(idx + 1, e.target.value)}
                                        className="w-full p-2 border rounded text-sm text-center"
                                        placeholder="0"
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-center">
                            الإجمالي: {Object.values(form.delivery_schedule).reduce((a, b) => a + (Number(b) || 0), 0).toLocaleString()} وحدة
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                        <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">حفظ الصنف</button>
                        <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-100 rounded-lg font-semibold hover:bg-slate-200 transition">إلغاء</button>
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
            await fetch('/api/data?type=tender_competitors', {
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
            await fetch('/api/data?type=tender_competitors', {
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
            await fetch('/api/data?type=tender_attachments', {
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
            await fetch('/api/data?type=tender_attachments', {
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
            await fetch('/api/data?type=invoices', {
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
            await fetch('/api/data?type=invoices', {
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

function ReportsTab({ tender, items, competitors, invoices }) {
    const { data } = useData();
    const reportRef = useRef(null);

    const company = data.companies.find(c => c.id === tender.companyId);
    const winner = competitors.find(c => c.is_winner);

    const totalInvoices = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const totalVat = invoices.reduce((sum, inv) => sum + Number(inv.vat_amount || 0), 0);
    const totalWithVat = totalInvoices + totalVat;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const content = reportRef.current.innerHTML;
        printWindow.document.write(`
            <html dir="rtl">
            <head>
                <title>تقرير المناقصة - ${tender.title}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; line-height: 1.8; }
                    h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
                    h2 { color: #4f46e5; margin-top: 30px; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
                    th { background: #f1f5f9; }
                    .section { margin-bottom: 25px; }
                    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
                    .badge-success { background: #dcfce7; color: #166534; }
                    .badge-warning { background: #fef3c7; color: #92400e; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleExportWord = () => {
        const content = reportRef.current.innerHTML;
        const blob = new Blob([`
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset="utf-8"><title>تقرير المناقصة</title></head>
            <body dir="rtl" style="font-family: Arial; line-height: 1.8;">${content}</body></html>
        `], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `تقرير_${tender.title.replace(/\s+/g, '_')}.doc`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Export Buttons */}
            <div className="flex gap-3 mb-6">
                <button onClick={handlePrint} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
                    🖨️ طباعة التقرير
                </button>
                <button onClick={handleExportWord} className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
                    📄 تصدير Word
                </button>
            </div>

            {/* Report Content */}
            <div ref={reportRef} className="bg-slate-50 p-8 rounded-2xl border">
                <h1 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-600 pb-3 mb-6">
                    📋 تقرير المناقصة: {tender.title}
                </h1>

                {/* Basic Info */}
                <div className="section mb-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-3">ℹ️ المعلومات الأساسية</h2>
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b"><td className="py-2 font-semibold w-1/3">اسم الشركة</td><td>{company?.name || 'غير محدد'}</td></tr>
                            <tr className="border-b"><td className="py-2 font-semibold">الحالة</td><td>{tender.status === 'open' ? 'مفتوحة' : tender.status === 'closed' ? 'مغلقة' : tender.status}</td></tr>
                            <tr className="border-b"><td className="py-2 font-semibold">القيمة التقديرية</td><td>{Number(tender.value || 0).toLocaleString()} ر.س</td></tr>
                            <tr className="border-b"><td className="py-2 font-semibold">تاريخ اعتماد العينة</td><td>{tender.sample_date ? new Date(tender.sample_date).toLocaleDateString('ar-SA') : '-'}</td></tr>
                            <tr className="border-b"><td className="py-2 font-semibold">تاريخ اعتماد البروفة</td><td>{tender.proof_date ? new Date(tender.proof_date).toLocaleDateString('ar-SA') : '-'}</td></tr>
                            <tr className="border-b"><td className="py-2 font-semibold">مدة التوريد</td><td>{tender.delivery_duration || '-'}</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* Items Summary */}
                <div className="section mb-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-3">📦 ملخص الأصناف ({items.length})</h2>
                    {items.length > 0 ? (
                        <table className="w-full text-sm border">
                            <thead className="bg-slate-100">
                                <tr><th className="p-2 border">الصنف</th><th className="p-2 border">الكمية</th><th className="p-2 border">المواصفات</th></tr>
                            </thead>
                            <tbody>
                                {items.map(item => {
                                    const specs = typeof item.specifications === 'string' ? JSON.parse(item.specifications || '{}') : item.specifications;
                                    return (
                                        <tr key={item.id}>
                                            <td className="p-2 border font-medium">{item.name}</td>
                                            <td className="p-2 border text-center">{item.quantity}</td>
                                            <td className="p-2 border text-xs">
                                                {specs.carton_type && `نوع: ${specs.carton_type} | `}
                                                {specs.flute_type && `تضليع: ${specs.flute_type} | `}
                                                {specs.print_colors && `ألوان: ${specs.print_colors}`}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : <p className="text-slate-500">لا توجد أصناف</p>}
                </div>

                {/* Competitors */}
                <div className="section mb-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-3">🤝 المنافسين ({competitors.length})</h2>
                    {competitors.length > 0 ? (
                        <table className="w-full text-sm border">
                            <thead className="bg-slate-100">
                                <tr><th className="p-2 border">المنافس</th><th className="p-2 border">السعر</th><th className="p-2 border">الحالة</th></tr>
                            </thead>
                            <tbody>
                                {competitors.map(comp => (
                                    <tr key={comp.id} className={comp.is_winner ? 'bg-green-50' : ''}>
                                        <td className="p-2 border font-medium">{comp.name}</td>
                                        <td className="p-2 border">{Number(comp.price).toLocaleString()} ر.س</td>
                                        <td className="p-2 border">{comp.is_winner ? '🏆 فائز' : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="text-slate-500">لا يوجد منافسين</p>}
                    {winner && (
                        <div className="mt-3 p-3 bg-green-100 rounded-lg text-green-800">
                            ✅ <strong>الفائز بالمناقصة:</strong> {winner.name} بسعر {Number(winner.price).toLocaleString()} ر.س
                        </div>
                    )}
                </div>

                {/* Financial Summary */}
                <div className="section mb-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-3">💰 الملخص المالي</h2>
                    <table className="w-full text-sm border">
                        <tbody>
                            <tr className="border-b"><td className="p-2 font-semibold">عدد الفواتير</td><td>{invoices.length}</td></tr>
                            <tr className="border-b"><td className="p-2 font-semibold">إجمالي المبالغ (بدون ضريبة)</td><td>{totalInvoices.toLocaleString()} ر.س</td></tr>
                            <tr className="border-b"><td className="p-2 font-semibold">إجمالي الضريبة</td><td className="text-red-600">{totalVat.toLocaleString()} ر.س</td></tr>
                            <tr className="bg-indigo-50"><td className="p-2 font-bold">الإجمالي الكلي</td><td className="font-bold text-indigo-700">{totalWithVat.toLocaleString()} ر.س</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* Management Instructions */}
                {(tender.gm_instructions || tender.dm_instructions) && (
                    <div className="section mb-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-3">📝 تعليمات الإدارة</h2>
                        {tender.gm_instructions && (
                            <div className="p-3 bg-amber-50 rounded-lg mb-2">
                                <strong>المدير العام:</strong> {tender.gm_instructions}
                            </div>
                        )}
                        {tender.dm_instructions && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <strong>المدير المباشر:</strong> {tender.dm_instructions}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-slate-400 mt-8 pt-4 border-t">
                    تم إنشاء هذا التقرير بتاريخ {new Date().toLocaleDateString('ar-SA')} | نظام إدارة المناقصات
                </div>
            </div>
        </div>
    );
}
