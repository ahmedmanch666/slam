import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import Layout from '../../components/Layout';

const PERMISSIONS = [
    { key: 'dashboard', label: 'لوحة التحكم', icon: '🏠' },
    { key: 'companies', label: 'الشركات', icon: '🏢' },
    { key: 'tenders', label: 'المناقصات', icon: '📋' },
    { key: 'contracts', label: 'العقود', icon: '📄' },
    { key: 'tasks', label: 'المهام', icon: '✅' },
];

export default function AdminUsers() {
    const { auth } = useAuth();
    const { theme } = useTheme();
    const { success, error } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({
        email: '',
        password: '',
        name: '',
        role: 'user',
        permissions: {
            dashboard: true,
            companies: true,
            tenders: true,
            contracts: true,
            tasks: true
        }
    });

    const isDark = theme === 'dark';

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${auth.accessToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users.map(u => ({
                    ...u,
                    permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions) : (u.permissions || {})
                })));
            }
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = '/api/admin/users';
            const method = editingUser ? 'PUT' : 'POST';
            const body = editingUser
                ? { id: editingUser.id, name: form.name, role: form.role, permissions: form.permissions, password: form.password || undefined }
                : form;

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${auth.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                success(editingUser ? 'تم تحديث المستخدم' : 'تم إضافة المستخدم');
                setShowModal(false);
                setEditingUser(null);
                setForm({
                    email: '',
                    password: '',
                    name: '',
                    role: 'user',
                    permissions: { dashboard: true, companies: true, tenders: true, contracts: true, tasks: true }
                });
                loadUsers();
            } else {
                const data = await res.json();
                error(data.error || 'فشلت العملية');
            }
        } catch (err) {
            error('حدث خطأ');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setForm({
            email: user.email,
            password: '',
            name: user.name || '',
            role: user.role,
            permissions: user.permissions || {}
        });
        setShowModal(true);
    };

    const handleDelete = async (user) => {
        if (!confirm(`هل أنت متأكد من حذف ${user.email}؟`)) return;

        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: user.id })
            });

            if (res.ok) {
                success('تم حذف المستخدم');
                loadUsers();
            } else {
                const data = await res.json();
                error(data.error || 'فشل الحذف');
            }
        } catch (err) {
            error('حدث خطأ');
        }
    };

    const togglePermission = (key) => {
        setForm(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [key]: !prev.permissions[key]
            }
        }));
    };

    if (auth?.role !== 'admin') {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-64">
                    <span className="text-6xl mb-4">🔒</span>
                    <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        غير مصرح لك بالوصول
                    </h1>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        هذه الصفحة للمديرين فقط
                    </p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        👥 إدارة المستخدمين
                    </h1>
                    <button
                        onClick={() => {
                            setEditingUser(null);
                            setForm({
                                email: '',
                                password: '',
                                name: '',
                                role: 'user',
                                permissions: { dashboard: true, companies: true, tenders: true, contracts: true, tasks: true }
                            });
                            setShowModal(true);
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition font-semibold flex items-center gap-2"
                    >
                        <span>➕</span> إضافة مستخدم
                    </button>
                </div>

                {/* Users List */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {users.map(user => (
                            <div key={user.id} className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-4 shadow-sm`}>
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-lg">
                                            {user.name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {user.name || 'بدون اسم'}
                                        </div>
                                        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {user.email}
                                        </div>
                                    </div>

                                    {/* Role Badge */}
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {user.role === 'admin' ? '👑 مدير' : '👤 مستخدم'}
                                    </span>

                                    {/* Actions */}
                                    {user.id !== 'seed_admin' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Permissions */}
                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex flex-wrap gap-2">
                                        {PERMISSIONS.map(perm => (
                                            <span
                                                key={perm.key}
                                                className={`px-2 py-1 rounded-lg text-xs ${user.permissions?.[perm.key]
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-600'
                                                    }`}
                                            >
                                                {perm.icon} {perm.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
                        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {editingUser ? '✏️ تعديل مستخدم' : '➕ إضافة مستخدم جديد'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    البريد الإلكتروني
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                    disabled={!!editingUser}
                                    className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'} ${editingUser ? 'opacity-50' : ''}`}
                                    required={!editingUser}
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    كلمة المرور {editingUser && '(اتركها فارغة للإبقاء عليها)'}
                                </label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                                    className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                                    required={!editingUser}
                                    minLength={8}
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    الاسم
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    الدور
                                </label>
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                                    className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                                >
                                    <option value="user">👤 مستخدم</option>
                                    <option value="admin">👑 مدير</option>
                                </select>
                            </div>

                            {/* Permissions */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    الصلاحيات
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PERMISSIONS.map(perm => (
                                        <label
                                            key={perm.key}
                                            className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition ${form.permissions[perm.key]
                                                    ? 'bg-green-50 border-green-300'
                                                    : isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={form.permissions[perm.key] || false}
                                                onChange={() => togglePermission(perm.key)}
                                                className="w-4 h-4"
                                            />
                                            <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>
                                                {perm.icon} {perm.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-semibold"
                                >
                                    {editingUser ? 'حفظ التعديلات' : 'إضافة'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className={`flex-1 py-3 rounded-xl font-semibold ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} transition`}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
