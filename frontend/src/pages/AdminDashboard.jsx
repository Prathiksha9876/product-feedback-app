import { useState, useEffect } from 'react';
import api from '../api/axios';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { ShieldAlert, Users, MessageSquare, AlertTriangle, Lightbulb, CheckCircle, Sparkles } from 'lucide-react';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allFeedback, setAllFeedback] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, feedbackRes, summaryRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/feedback'),
          api.get('/feedback/summary')
        ]);
        setStats(statsRes.data);
        setAllFeedback(feedbackRes.data);
        setAiSummary(summaryRes.data.summary);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/feedback/${id}/status`, { status: newStatus });
      // Refresh feedback list
      const { data } = await api.get('/feedback');
      setAllFeedback(data);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <Users size={24} className="text-blue-400" /> },
    { label: 'Total Feedback', value: stats.totalFeedback, icon: <MessageSquare size={24} className="text-purple-400" /> },
    { label: 'Completed', value: stats.statusChartData.find(s => s.name === 'Completed')?.value || 0, icon: <CheckCircle size={24} className="text-green-400" /> },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/30">
          <ShieldAlert className="text-purple-400 h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 text-sm mt-1">Manage feedback, users, and platform analytics.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-4 bg-white/50 rounded-xl rounded-tr-none rounded-bl-none border border-slate-200/50">
              {stat.icon}
            </div>
            <div>
              <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Summary Card */}
      <div className="glass p-6 rounded-2xl mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-full shadow-sm text-purple-600">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">AI Feedback Summary</h3>
            <p className="text-slate-700 italic">{aiSummary}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Distribution */}
        <div className="glass p-6 rounded-2xl flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-900 mb-2 w-full">Category Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.categoryDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats.categoryDistribution?.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '0.5rem' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="glass p-6 rounded-2xl flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-900 mb-2 w-full">Sentiment Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.sentimentDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats.sentimentDistribution?.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '0.5rem' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution Bar Chart */}
        <div className="glass p-6 rounded-2xl col-span-1 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
            Feedback Prioritization
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.priorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trends Over Time */}
        <div className="glass p-6 rounded-2xl col-span-1 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
            Submission Trends Over Time
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trendsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Line type="monotone" dataKey="submissions" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Issues */}
        <div className="glass p-6 rounded-2xl flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <AlertTriangle size={16} /> Top Bugs
            </h3>
            <div className="space-y-3">
              {stats.topBugs.map(bug => (
                <div key={bug._id} className="flex justify-between items-center bg-white/50 p-3 rounded-lg border border-slate-800">
                  <span className="text-sm text-slate-700 truncate max-w-[200px]">{bug.title}</span>
                  <span className="text-xs font-bold bg-white/80 px-2 py-1 rounded-md text-slate-600">Score: {bug.priorityScore}</span>
                </div>
              ))}
              {stats.topBugs.length === 0 && <p className="text-xs text-slate-500 italic">No bugs reported</p>}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Lightbulb size={16} /> Top Features
            </h3>
            <div className="space-y-3">
              {stats.topFeatures.map(feat => (
                <div key={feat._id} className="flex justify-between items-center bg-white/50 p-3 rounded-lg border border-slate-800">
                  <span className="text-sm text-slate-700 truncate max-w-[200px]">{feat.title}</span>
                  <span className="text-xs font-bold bg-white/80 px-2 py-1 rounded-md text-slate-600">Score: {feat.priorityScore}</span>
                </div>
              ))}
              {stats.topFeatures.length === 0 && <p className="text-xs text-slate-500 italic">No features requested</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Management Table (Grouped by Priority) */}
      <div className="flex flex-col gap-6">
        {[
          { label: 'High Priority', data: allFeedback.filter(f => f.priority === 'High'), color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Medium Priority', data: allFeedback.filter(f => f.priority === 'Medium'), color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { label: 'Low Priority', data: allFeedback.filter(f => f.priority === 'Low'), color: 'text-green-500', bg: 'bg-green-50' }
        ].map(group => (
          <div key={group.label} className="glass p-6 rounded-2xl overflow-hidden">
            <h3 className={`text-lg font-bold mb-4 ${group.color}`}>{group.label} ({group.data.length})</h3>
            {group.data.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No feedback in this priority bucket.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className={`text-xs text-slate-600 uppercase border-b border-slate-200/50 ${group.bg}`}>
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Title</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Sentiment</th>
                      <th className="px-4 py-3 rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.data.map((item) => (
                      <tr key={item._id} className="border-b border-slate-200/50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[250px]">{item.title}</td>
                        <td className="px-4 py-3 text-slate-600">{item.category}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{item.sentiment}</td>
                        <td className="px-4 py-3">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item._id, e.target.value)}
                            className="bg-white/50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2 outline-none"
                          >
                            <option value="Under Review">Under Review</option>
                            <option value="Planned">Planned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
