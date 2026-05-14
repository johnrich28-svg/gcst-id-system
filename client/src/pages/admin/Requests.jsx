import React, { useState, useEffect } from 'react';
import { Search, Eye, ChevronDown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { getRequests } from '../../services/admin.service';
import { getStatusConfig } from '../../utils/statusColors';

const TYPE_FILTERS = ['All', 'rush', 'normal', 'scholar', 'lost'];
const STATUS_FILTERS = ['All', 'PENDING', 'UNDER_REVIEW', 'FOR_PAYMENT', 'PAID', 'APPROVED', 'GENERATED', 'READY_FOR_RELEASE', 'RELEASED', 'REJECTED'];

// Priority order for sorting
const TYPE_PRIORITY = { rush: 0, scholar: 1, normal: 2, lost: 3 };

const Requests = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'All');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await getRequests();
        const sorted = (response.data || []).sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setRequests(sorted);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
    
    // Make dashboard real-time with polling
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredRequests = requests.filter(req => {
    const matchesType = typeFilter === 'All' || req.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      req.personalInfo?.fullName?.toLowerCase().includes(search) ||
      req.referenceNumber?.toLowerCase().includes(search) ||
      req.personalInfo?.studentId?.toLowerCase().includes(search);
    return matchesType && matchesStatus && matchesSearch;
  });

  const typeColor = {
    rush: 'bg-red-100 text-red-700 border-red-200',
    scholar: 'bg-blue-100 text-blue-700 border-blue-200',
    normal: 'bg-slate-100 text-slate-700 border-slate-200',
    lost: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">ID Requests</h1>
          <p className="text-slate-500 font-medium">Sorted by priority: Rush → Scholar → Normal → Lost</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input
          className="pl-12"
          placeholder="Search by name, student ID or reference number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Type Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all capitalize ${
              typeFilter === t
                ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            {t === 'All' ? 'All Types' : t}
          </button>
        ))}

        <div className="ml-auto flex flex-wrap gap-2">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                statusFilter === s
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {s === 'All' ? 'All Statuses' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-800">{filteredRequests.length}</span> of {requests.length} requests
      </p>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Priority</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Reference No.</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Submission Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400">Loading requests...</td></tr>
            ) : filteredRequests.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400">No requests match your filters.</td></tr>
            ) : filteredRequests.map((req) => {
              const statusConfig = getStatusConfig(req.status);
              return (
                <tr key={req._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black capitalize border ${typeColor[req.type] || typeColor.normal}`}>
                      {req.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-primary-600">{req.referenceNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">{req.personalInfo?.fullName}</span>
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
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/requests/${req._id}`)}
                        className="text-primary-600 hover:bg-primary-50"
                      >
                        <Eye size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Requests;
