import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Layout from '../components/Layout';

export default function Home() {
    const { auth } = useAuth();
    const { data, loading } = useData();

    const stats = [
        {
            label: 'Ø§Ù„Ø´Ø±ÙƒØ§Øª',
            count: data.companies.length,
            icon: 'ðŸ¢',
            link: '/companies',
            color: 'bg-blue-500'
        },
        {
            label: 'Ø§Ù„Ù…Ù†Ø§Ù‚ØµØ§Øª',
            count: data.tenders.length,
            icon: 'ðŸ“‹',
            link: '/tenders',
            color: 'bg-green-500'
        },
        {
            label: 'Ø§Ù„Ø¹Ù‚ÙˆØ¯',
            count: data.contracts.length,
            icon: 'ðŸ“„',
            link: '/contracts',
            color: 'bg-purple-500'
        },
        {
            label: 'Ø§Ù„Ù…Ù‡Ø§Ù…',
            count: data.tasks.length,
            icon: 'âœ…',
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
                        Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ {auth?.email?.split('@')[0]} ðŸ‘‹
                    </h1>
                    <p className="text-slate-600 mt-1">Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©</p>
                </div>

                {loading && (
                    <div className="text-center py-8 text-slate-500">Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª...</div>
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
                            âš ï¸ Ù…Ù‡Ø§Ù… Ù…ØªØ£Ø®Ø±Ø© ({overdueTasks.length})
                        </h2>
                        <div className="mt-3 space-y-2">
                            {overdueTasks.slice(0, 5).map((task) => (
                                <div key={task.id} className="p-3 bg-white rounded-xl border border-red-100">
                                    <div className="font-semibold text-slate-900">{task.title}</div>
                                    <div className="text-sm text-red-600 mt-1">
                                        ØªØ§Ø±ÙŠØ® Ø§Ù„Ø§Ø³ØªØ­Ù‚Ø§Ù‚: {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø³Ø±ÙŠØ¹Ø©</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link
                            to="/companies?add=true"
                            className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-center transition border border-blue-100"
                        >
                            <span className="text-2xl">ðŸ¢</span>
                            <div className="text-sm font-semibold text-blue-700 mt-2">Ø¥Ø¶Ø§ÙØ© Ø´Ø±ÙƒØ©</div>
                        </Link>
                        <Link
                            to="/tenders?add=true"
                            className="p-4 rounded-xl bg-green-50 hover:bg-green-100 text-center transition border border-green-100"
                        >
                            <span className="text-2xl">ðŸ“‹</span>
                            <div className="text-sm font-semibold text-green-700 mt-2">Ø¥Ø¶Ø§ÙØ© Ù…Ù†Ø§Ù‚ØµØ©</div>
                        </Link>
                        <Link
                            to="/contracts?add=true"
                            className="p-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-center transition border border-purple-100"
                        >
                            <span className="text-2xl">ðŸ“„</span>
                            <div className="text-sm font-semibold text-purple-700 mt-2">Ø¥Ø¶Ø§ÙØ© Ø¹Ù‚Ø¯</div>
                        </Link>
                        <Link
                            to="/tasks?add=true"
                            className="p-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-center transition border border-orange-100"
                        >
                            <span className="text-2xl">âœ…</span>
                            <div className="text-sm font-semibold text-orange-700 mt-2">Ø¥Ø¶Ø§ÙØ© Ù…Ù‡Ù…Ø©</div>
                        </Link>
                    </div>
                </div>

                {/* Recent Tenders */}
                {data.tenders.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">ðŸ“‹ Ø¢Ø®Ø± Ø§Ù„Ù…Ù†Ø§Ù‚ØµØ§Øª</h2>
                            <Link to="/tenders" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                Ø¹Ø±Ø¶ Ø§Ù„ÙƒÙ„ â†
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {data.tenders.slice(0, 5).map((tender) => {
                                const company = data.companies.find(c => c.id === tender.companyId);
                                return (
                                    <Link
                                        key={tender.id}
                                        to={`/tenders/${tender.id}`}
                                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition group"
                                    >
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900 group-hover:text-indigo-700">{tender.title}</div>
                                            <div className="text-sm text-slate-500 mt-1">
                                                ðŸ¢ {company?.name || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${tender.status === 'WON' ? 'bg-green-100 text-green-700' :
                                                tender.status === 'LOST' ? 'bg-red-100 text-red-700' :
                                                    tender.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {tender.status === 'WON' ? 'ÙØ§Ø¦Ø²' :
                                                    tender.status === 'LOST' ? 'Ø®Ø§Ø³Ø±' :
                                                        tender.status === 'PENDING' ? 'Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±' :
                                                            tender.status === 'DRAFT' ? 'Ù…Ø³ÙˆØ¯Ø©' : tender.status}
                                            </span>
                                            <span className="text-indigo-500 group-hover:translate-x-[-4px] transition-transform">â†</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
