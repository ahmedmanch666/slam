import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from './GlobalSearch';

const navItems = [
    { path: '/', label: 'الرئيسية', icon: '🏠' },
    { path: '/companies', label: 'الشركات', icon: '🏢' },
    { path: '/tenders', label: 'المناقصات', icon: '📋' },
    { path: '/contracts', label: 'العقود', icon: '📄' },
    { path: '/tasks', label: 'المهام', icon: '✅' },
];

export default function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { auth, logout } = useAuth();
    const [showSearch, setShowSearch] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50" dir="rtl">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-l border-slate-200 px-6 pb-4">
                    {/* Logo */}
                    <div className="flex h-16 shrink-0 items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-xl font-bold text-white">م</span>
                        </div>
                        <span className="text-lg font-bold text-slate-900">مدير المناقصات</span>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={() => setShowSearch(true)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition mb-2"
                    >
                        <span>🔍</span>
                        <span className="text-sm">بحث سريع...</span>
                        <span className="mr-auto text-xs bg-slate-200 px-2 py-0.5 rounded">Ctrl+K</span>
                    </button>

                    {/* Nav */}
                    <nav className="flex flex-1 flex-col">
                        <ul className="flex flex-1 flex-col gap-y-2">
                            {navItems.map((item) => {
                                const isActive = item.path === '/'
                                    ? location.pathname === '/'
                                    : location.pathname.startsWith(item.path);

                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition ${isActive
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className="text-lg">{item.icon}</span>
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* User */}
                        <div className="mt-auto border-t border-slate-200 pt-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-white font-bold">
                                        {auth?.email?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-slate-900 truncate">
                                        {auth?.email}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {auth?.role === 'admin' ? 'مدير' : 'مستخدم'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full p-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                            >
                                تسجيل الخروج
                            </button>
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Main content */}
            <main className="lg:pr-64">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>

            {/* Bottom Nav - Mobile */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 pb-safe">
                <div className="flex justify-around py-2">
                    {navItems.slice(0, 4).map((item) => {
                        const isActive = item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center p-2 rounded-xl transition ${isActive
                                    ? 'text-indigo-600'
                                    : 'text-slate-500 hover:text-indigo-600'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="text-xs mt-1">{item.label}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center p-2 rounded-xl text-red-500"
                    >
                        <span className="text-xl">↩️</span>
                        <span className="text-xs mt-1">خروج</span>
                    </button>
                </div>
            </nav>

            {/* Global Search Modal */}
            {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}
        </div>
    );
}
