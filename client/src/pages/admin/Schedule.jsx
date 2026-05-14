import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, CheckCircle, Play, RefreshCw, ChevronDown, ChevronUp, Info, Download } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { getBatches, runAutoBatch, updateBatchReleaseDate } from '../../services/admin.service';
import api from '../../services/api';

// Priority order: rush is most urgent
const PRIORITY_ORDER = { rush: 0, scholar: 1, normal: 2, lost: 3 };

const typeBorderColor = {
  rush: 'border-l-red-500',
  scholar: 'border-l-blue-500',
  normal: 'border-l-slate-400',
  lost: 'border-l-amber-500',
};

const typeBadgeStyle = {
  rush: 'bg-red-100 text-red-700 border border-red-200',
  scholar: 'bg-blue-100 text-blue-700 border border-blue-200',
  normal: 'bg-slate-100 text-slate-700 border border-slate-200',
  lost: 'bg-amber-100 text-amber-700 border border-amber-200',
};

const Schedule = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'info'|'error', message }

  const fetchBatches = async () => {
    try {
      const response = await getBatches();
      const sorted = (response.data || []).sort((a, b) => {
        const pa = PRIORITY_ORDER[a.type] ?? 99;
        const pb = PRIORITY_ORDER[b.type] ?? 99;
        if (pa !== pb) return pa - pb;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setBatches(sorted);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAutoBatch = async () => {
    setActionLoading(true);
    try {
      const result = await runAutoBatch();
      const created = result?.data?.length ?? 0;
      await fetchBatches();
      if (created === 0) {
        showToast('info', 'No new batches created — no GENERATED requests found, or all groups already have a batch.');
      } else {
        showToast('success', `✅ ${created} new batch${created > 1 ? 'es' : ''} created successfully!`);
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Auto-batching failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetReleaseDate = async (id, date) => {
    if (!date) return;
    const year = new Date(date).getFullYear();
    if (year < 2000) return;
    try {
      await updateBatchReleaseDate(id, date);
      await fetchBatches();
    } catch (error) {
      alert('Failed to set release date.');
    }
  };

  const handleReleaseBatch = async (id) => {
    if (!window.confirm('Mark this batch as released? This is final.')) return;
    try {
      await api.put(`/admin/batches/${id}/release`);
      await fetchBatches();
    } catch (error) {
      alert('Failed to release batch.');
    }
  };

  const handleDownloadBatch = (batchId, batchName) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token || '';
    const url = `${base}/admin/batches/${batchId}/download?token=${token}`;
    window.open(url, '_blank');
  };

  const quotas = { rush: 10, normal: 50, scholar: 50, lost: 50 };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold transition-all animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' :
          toast.type === 'error'   ? 'bg-red-600 text-white' :
          'bg-slate-800 text-white'
        }`}>
          <Info size={18} className="shrink-0" />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Release Schedule</h1>
          <p className="text-slate-500 font-medium">
            Batches sorted by priority — <span className="text-red-600 font-bold">Rush</span> → Scholar → Normal → Lost
          </p>
        </div>
        <Button
          onClick={handleAutoBatch}
          disabled={actionLoading}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
          Run Auto-Batching
        </Button>
      </div>

      {/* Quota Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        {Object.entries(quotas).map(([type, quota]) => (
          <div key={type} className={`card p-5 border-l-4 ${typeBorderColor[type]}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 capitalize px-2 py-0.5 rounded-full inline-block ${typeBadgeStyle[type]}`}>{type}</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-2xl font-black text-slate-900">{quota}</span>
              <span className="text-sm text-slate-500 mb-0.5">IDs per batch</span>
            </div>
          </div>
        ))}
      </div>

      {/* Batch List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="text-primary-600" size={22} />
          Active Batches
        </h3>

        {loading ? (
          <div className="p-20 text-center text-slate-400">Loading batches...</div>
        ) : batches.length === 0 ? (
          <div className="card p-20 text-center text-slate-400 italic">
            No active batches. Run auto-batching to group generated IDs.
          </div>
        ) : batches.map((batch, idx) => {
          const isExpanded = expandedBatch === batch._id;
          const students = batch.requestIds || [];

          return (
            <div
              key={batch._id}
              className={`card border-l-4 ${typeBorderColor[batch.type]} transition-all`}
            >
              {/* Priority Badge */}
              {idx === 0 && (
                <div className="px-8 pt-4 pb-0">
                  <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase tracking-widest">
                    ⚡ Highest Priority
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* Batch Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-lg font-black text-slate-900">{batch.batchName}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-black capitalize ${typeBadgeStyle[batch.type]}`}>
                        {batch.type}
                      </span>
                      {batch.status === 'RELEASED' && (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 border border-emerald-200">Released</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users size={15} className="text-slate-400" />
                        <span className="font-bold">{students.length} Students</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock size={15} className="text-slate-400" />
                        <span>Release: <b>{batch.releaseDate && new Date(batch.releaseDate).getFullYear() > 1000
                          ? new Date(batch.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : 'TBA'}</b></span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1 max-w-sm">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Batch Capacity</span>
                        <span>{Math.min(Math.round((students.length / batch.quota) * 100), 100)}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${batch.type === 'rush' ? 'bg-red-500' : 'bg-primary-500'}`}
                          style={{ width: `${Math.min((students.length / batch.quota) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col gap-3 items-end md:items-end">
                    {/* Date Picker */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule Release</label>
                      <div className="relative h-[42px] min-w-[200px]">
                        <input
                          type="date"
                          className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full"
                          value={batch.releaseDate ? new Date(batch.releaseDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleSetReleaseDate(batch._id, e.target.value)}
                          onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        />
                        <div className="absolute inset-0 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 flex items-center justify-between hover:border-primary-300 transition-all pointer-events-none">
                          <span>
                            {batch.releaseDate && new Date(batch.releaseDate).getFullYear() > 1000
                              ? new Date(batch.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                              : 'Select Date'}
                          </span>
                          <Calendar size={14} className="text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-[42px] flex-1 border-slate-200"
                        onClick={() => handleDownloadBatch(batch._id, batch.batchName)}
                      >
                        <Download size={16} />
                        Download ZIP
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        className="h-[42px] flex-1"
                        disabled={!batch.releaseDate || batch.status === 'RELEASED'}
                        onClick={() => handleReleaseBatch(batch._id)}
                      >
                        <CheckCircle size={16} />
                        {batch.status === 'RELEASED' ? 'Released' : 'Release'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expandable Student List */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setExpandedBatch(isExpanded ? null : batch._id)}
                    className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isExpanded ? 'Hide' : 'Show'} Student List ({students.length})
                  </button>

                  {isExpanded && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="py-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">#</th>
                            <th className="py-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student Name</th>
                            <th className="py-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student ID</th>
                            <th className="py-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Course</th>
                            <th className="py-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Year / Section</th>
                            <th className="py-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Reference No.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {students.map((student, i) => {
                            const info = student.personalInfo || {};
                            return (
                              <tr key={student._id || i} className="hover:bg-slate-50">
                                <td className="py-2.5 px-4 font-mono text-slate-400">{i + 1}</td>
                                <td className="py-2.5 px-4 font-bold text-slate-900">{info.fullName || '—'}</td>
                                <td className="py-2.5 px-4 font-mono text-slate-600">{info.studentId || '—'}</td>
                                <td className="py-2.5 px-4 text-slate-600 uppercase">{info.course || '—'}</td>
                                <td className="py-2.5 px-4 text-slate-600">
                                  {info.yearLevel ? `${info.yearLevel}${info.section ? ` - ${info.section}` : ''}` : '—'}
                                </td>
                                <td className="py-2.5 px-4 font-mono text-primary-600">{student.referenceNumber || '—'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Schedule;
