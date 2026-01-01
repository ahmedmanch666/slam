import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Layout from '../components/Layout';

export default function Home() {
    const { auth } = useAuth();
    const { data, loading } = useData();

    const stats = [
        {
            label: 'الشركات',
            count: data.companies.length,
            icon: '🏢',
            link: '/companies',
            color: 'bg-blue-500'
        },
        {
            label: 'المناقصات',
            count: data.tenders.length,
            icon: '📋',
            link: '/tenders',
            color: 'bg-green-500'
        },
        {
            label: 'العقود',
            count: data.contracts.length,
            icon: '📄',
            link: '/contracts',
            color: 'bg-purple-500'
        },
        {
            label: 'المهام',
            count: data.tasks.length,
            icon: '✅',
            link: '/tasks',
            color: 'bg-orange-500'
        },
    ];

    const overdueTasks = data.tasks.filter(t => {
        if (t.status === 'DONE') return false;
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < new Date();
    });

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        مرحباً، {auth?.email?.split('@')[0]} 👋
                    </h1>
                    <p className="text-slate-600 mt-1">لوحة التحكم الرئيسية</p>
                </div>

                {loading && (
                    <div className="text-center py-8 text-slate-500">جاري تحميل البيانات...</div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <Link
                            key={stat.label}
                            to={stat.link}
                            className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition group cursor-pointer block"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold text-slate-900 group-hover:text-indigo-600 transition">{stat.count}</div>
                                    <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
                                </div>
                                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Overdue Tasks and Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Overdue Tasks */}
                    {overdueTasks.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                            <h2 className="text-lg font-bold text-red-800 flex items-center gap-2 mb-3">
                                ⚠️ مهام متأخرة ({overdueTasks.length})
                            </h2>
                            <div className="space-y-2">
                                {overdueTasks.slice(0, 3).map((task) => (
                                    <div key={task.id} className="p-3 bg-white rounded-xl border border-red-100 flex justify-between items-center">
                                        <div className="font-semibold text-slate-900">{task.title}</div>
                                        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                            {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">إجراءات سريعة</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                to="/companies?add=true"
                                className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-center transition border border-blue-100"
                            >
                                <span className="text-2xl">🏢</span>
                                <div className="text-sm font-semibold text-blue-700 mt-2">إضافة شركة</div>
                            </Link>
                            <Link
                                to="/tenders?add=true"
                                className="p-4 rounded-xl bg-green-50 hover:bg-green-100 text-center transition border border-green-100"
                            >
                                <span className="text-2xl">📋</span>
                                <div className="text-sm font-semibold text-green-700 mt-2">إضافة مناقصة</div>
                            </Link>
                            <Link
                                to="/contracts?add=true"
                                className="p-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-center transition border border-purple-100"
                            >
                                <span className="text-2xl">📄</span>
                                <div className="text-sm font-semibold text-purple-700 mt-2">إضافة عقد</div>
                            </Link>
                            <Link
                                to="/tasks?add=true"
                                className="p-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-center transition border border-orange-100"
                            >
                                <span className="text-2xl">✅</span>
                                <div className="text-sm font-semibold text-orange-700 mt-2">إضافة مهمة</div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent Tenders */}
                    {data.tenders.length > 0 && (
                        <div className="bg-white rounded-2xl p-5 border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-900">📋 آخر المناقصات</h2>
                                <Link to="/tenders" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                    عرض الكل ←
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {data.tenders.slice(0, 5).map((tender) => {
                                    const company = data.companies.find(c => c.id === tender.companyId);
                                    return (
                                        <Link
                                            key={tender.id}
                                            to={`/tenders/${tender.id}`}
                                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition group"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-slate-900 truncate group-hover:text-indigo-700">{tender.title}</div>
                                                <div className="text-xs text-slate-500 mt-1 truncate">
                                                    🏢 {company?.name || 'غير محدد'}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap mr-2 ${tender.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {tender.status === 'open' ? 'مفتوحة' : tender.status}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Recent Tasks */}
                    {data.tasks.length > 0 && (
                        <div className="bg-white rounded-2xl p-5 border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-900">✅ آخر المهام</h2>
                                <Link to="/tasks" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                    عرض الكل ←
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {data.tasks.slice(0, 5).map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-slate-900 truncate">{task.title}</div>
                                            <div className="text-xs text-slate-500 mt-1 truncate">
                                                {task.dueDate ? `📅 ${new Date(task.dueDate).toLocaleDateString('ar-SA')}` : 'بدون تاريخ'}
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap mr-2 ${task.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {task.status === 'pending' ? 'انتظار' : 'مكتمل'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
