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
                            className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold text-slate-900">{stat.count}</div>
                                    <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
                                </div>
                                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Overdue Tasks */}
                {overdueTasks.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                        <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
                            ⚠️ مهام متأخرة ({overdueTasks.length})
                        </h2>
                        <div className="mt-3 space-y-2">
                            {overdueTasks.slice(0, 5).map((task) => (
                                <div key={task.id} className="p-3 bg-white rounded-xl border border-red-100">
                                    <div className="font-semibold text-slate-900">{task.title}</div>
                                    <div className="text-sm text-red-600 mt-1">
                                        تاريخ الاستحقاق: {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">إجراءات سريعة</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link
                            to="/companies/new"
                            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-center transition"
                        >
                            <span className="text-2xl">🏢</span>
                            <div className="text-sm font-semibold text-slate-700 mt-2">إضافة شركة</div>
                        </Link>
                        <Link
                            to="/tenders/new"
                            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-center transition"
                        >
                            <span className="text-2xl">📋</span>
                            <div className="text-sm font-semibold text-slate-700 mt-2">إضافة مناقصة</div>
                        </Link>
                        <Link
                            to="/contracts/new"
                            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-center transition"
                        >
                            <span className="text-2xl">📄</span>
                            <div className="text-sm font-semibold text-slate-700 mt-2">إضافة عقد</div>
                        </Link>
                        <Link
                            to="/tasks/new"
                            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-center transition"
                        >
                            <span className="text-2xl">✅</span>
                            <div className="text-sm font-semibold text-slate-700 mt-2">إضافة مهمة</div>
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
