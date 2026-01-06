import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';

export default function Profile() {
    const { auth } = useAuth();
    const { theme } = useTheme();
    const { success, error } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        avatar_url: '',
        role: ''
    });
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await fetch('/api/profile', {
                headers: { 'Authorization': `Bearer ${auth.accessToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    avatar_url: data.avatar_url || '',
                    role: data.role || 'user'
                });
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${auth.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: profile.name,
                    avatar_url: profile.avatar_url
                })
            });
            if (res.ok) {
                success('تم حفظ الملف الشخصي بنجاح');
            } else {
                error('فشل حفظ الملف الشخصي');
            }
        } catch (err) {
            error('حدث خطأ');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            error('كلمات المرور غير متطابقة');
            return;
        }
        if (passwords.new.length < 8) {
            error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch('/api/profile/password', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${auth.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });
            if (res.ok) {
                success('تم تغيير كلمة المرور بنجاح');
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                const data = await res.json();
                error(data.error || 'فشل تغيير كلمة المرور');
            }
        } catch (err) {
            error('حدث خطأ');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Convert to base64
        const reader = new FileReader();
        reader.onload = () => {
            setProfile(prev => ({ ...prev, avatar_url: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const isDark = theme === 'dark';

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    👤 الملف الشخصي
                </h1>

                {/* Profile Info */}
                <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 shadow-sm mb-6`}>
                    <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        المعلومات الأساسية
                    </h2>

                    <form onSubmit={handleSave} className="space-y-4">
                        {/* Avatar */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Avatar"
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-3xl text-white font-bold">
                                            {profile.name?.[0] || profile.email?.[0]?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                )}
                                <label className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition">
                                    <span className="text-white text-sm">📷</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <div>
                                <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {profile.name || 'اسم المستخدم'}
                                </div>
                                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {profile.role === 'admin' ? '👑 مدير النظام' : '👤 مستخدم'}
                                </div>
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                الاسم
                            </label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                                placeholder="أدخل اسمك"
                            />
                        </div>

                        {/* Email (readonly) */}
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-600 border-slate-600 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition font-semibold"
                        >
                            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
                    <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        🔐 تغيير كلمة المرور
                    </h2>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                كلمة المرور الحالية
                            </label>
                            <input
                                type="password"
                                value={passwords.current}
                                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                                className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                كلمة المرور الجديدة
                            </label>
                            <input
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                                className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                تأكيد كلمة المرور
                            </label>
                            <input
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving || !passwords.current || !passwords.new}
                            className="w-full bg-amber-600 text-white py-3 rounded-xl hover:bg-amber-700 disabled:opacity-50 transition font-semibold"
                        >
                            {saving ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
