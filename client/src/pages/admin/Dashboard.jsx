import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  ArrowUpRight,
  MoreVertical,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { getRequests } from '../../services/admin.service';
import { getStatusConfig } from '../../utils/statusColors';

const Dashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRequests();
        setRequests(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate real stats
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'PENDING' || r.status === 'UNDER_REVIEW').length;
  const generatedRequests = requests.filter(r => r.status === 'GENERATED' || r.status === 'READY_FOR_RELEASE' || r.status === 'RELEASED').length;
  const scholarRequests = requests.filter(r => r.type === 'scholar').length;

  const stats = [
    { label: 'Total Requests', value: totalRequests.toString(), icon: <FileText className="text-blue-600" />, trend: 'Active', color: 'bg-blue-50' },
    { label: 'Pending Approval', value: pendingRequests.toString(), icon: <Clock className="text-amber-600" />, trend: 'Action Needed', color: 'bg-amber-50' },
    { label: 'Generated IDs', value: generatedRequests.toString(), icon: <CheckCircle className="text-emerald-600" />, trend: 'Ready', color: 'bg-emerald-50' },
    { label: 'Scholar IDs', value: scholarRequests.toString(), icon: <Users className="text-indigo-600" />, trend: 'Processing', color: 'bg-indigo-50' },
  ];

  // Get 5 most recent requests
  const recentRequests = requests.slice(0, 5);


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <Badge variant={stat.trend.startsWith('+') ? 'success' : 'danger'}>
                {stat.trend} <TrendingUp size={10} className="ml-1" />
              </Badge>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Requests Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Recent ID Requests</h3>
              <p className="text-slate-500 font-medium">Monitoring the latest submissions from students.</p>
            </div>
            <Button variant="ghost" className="text-primary-600 font-bold">View All</Button>
          </div>

          <div className="card p-0 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Request Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400">Loading requests...</td>
                  </tr>
                ) : recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400">No recent requests found.</td>
                  </tr>
                ) : recentRequests.map((req) => {
                  const statusConfig = getStatusConfig(req.status);
                  return (
                    <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${req._id}`} alt="Avatar" />
                          </div>
                          <span className="font-bold text-slate-900">{req.personalInfo.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-600 capitalize">{req.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                          <span className="text-xs font-bold uppercase tracking-wider">{req.status.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/admin/requests/${req._id}`)}
                          className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          <ArrowUpRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900">Quick Actions</h3>
          <div className="card space-y-4 p-6">
            <Button
              className="w-full justify-start gap-3 h-12"
              variant="secondary"
              onClick={() => navigate('/admin/requests')}
            >
              <Search size={18} /> View All ID Requests
            </Button>
            <Button
              className="w-full justify-start gap-3 h-12"
              variant="secondary"
              onClick={() => navigate('/admin/requests?status=PENDING')}
            >
              <FileText size={18} /> Review Pending Requests
            </Button>
            <Button
              className="w-full justify-start gap-3 h-12"
              variant="secondary"
              onClick={() => navigate('/admin/schedule')}
            >
              <Users size={18} /> Manage Release Schedule
            </Button>
          </div>


          <div className="card p-6 bg-slate-900 text-white border-none shadow-primary-500/20">
            <h4 className="font-bold text-lg mb-4">System Status</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Printer Status</span>
                <span className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">DB Connection</span>
                <span className="text-emerald-400 text-sm font-bold">Stable</span>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500">Last updated: Just now</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
