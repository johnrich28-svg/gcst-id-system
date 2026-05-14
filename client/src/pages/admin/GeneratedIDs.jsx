import React, { useState } from 'react';
import { Search, Printer, Download, Filter, FileText, Loader2, BookOpen, User2, RefreshCw, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { getGeneratedIds, downloadIdPdf } from '../../services/admin.service';
import api from '../../services/api';

// ─── Course full-name lookup ───────────────────────────────────────────────────
const COURSE_NAMES = {
  BSCRIM:     'BS Criminology',
  BSA:        'BS Accountancy',
  'BSBA-MM':  'BSBA — Marketing Mgmt',
  'BSBA-OM':  'BSBA — Operations Mgmt',
  BSED:       'BS Secondary Education',
  BEED:       'BS Elementary Education',
  BSCS:       'BS Computer Science',
  BSIT:       'BS Information Technology',
  BSTM:       'BS Tourism Management',
};

const YEAR_LABELS = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' };

const GeneratedIDs = () => {
  const [searchTerm, setSearchTerm]     = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [generatedIds, setGeneratedIds]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [regenerating, setRegenerating]   = useState(null); // id being regenerated

  const fetchGenerated = async () => {
    try {
      const response = await getGeneratedIds();
      setGeneratedIds(response.data);
    } catch (error) {
      console.error('Failed to fetch generated IDs:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchGenerated(); }, []);

  const handleRegenerate = async (id) => {
    setRegenerating(id);
    try {
      await api.post(`/id/regenerate/${id}`);
      await fetchGenerated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to regenerate PDFs.');
    } finally {
      setRegenerating(null);
    }
  };

  const filteredIds = generatedIds.filter((item) => {
    const matchSearch =
      item.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCourse = courseFilter ? item.course === courseFilter : true;
    return matchSearch && matchCourse;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Generated IDs</h1>
          <p className="text-slate-500 font-medium">
            Approved student IDs — download front &amp; back PDFs.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => {
              filteredIds.forEach((item) => {
                downloadIdPdf(item._id, 'front');
                downloadIdPdf(item._id, 'back');
              });
            }}
            disabled={filteredIds.length === 0}
          >
            <Download size={18} /> Download All
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input
            className="pl-12"
            placeholder="Search by name or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-700 focus:border-primary-500"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="">All Courses</option>
          {Object.entries(COURSE_NAMES).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
      </div>

      {/* Stats row */}
      {!loading && (
        <div className="flex gap-4 flex-wrap">
          <div className="bg-white border border-slate-100 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <User2 size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Generated</p>
              <p className="text-2xl font-black text-slate-900">{generatedIds.length}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Showing</p>
              <p className="text-2xl font-black text-slate-900">{filteredIds.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* ID Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={24} /> Loading generated IDs...
        </div>
      ) : filteredIds.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <Printer size={40} />
          </div>
          <p className="text-slate-500 font-medium">No generated IDs found.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredIds.map((item) => (
            <div
              key={item._id}
              className="bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* ID preview header */}
                <div
                  className="h-28 flex items-center justify-between px-6 relative overflow-hidden bg-slate-100"
                >
                  {/* Template Background Preview */}
                  <img 
                    src="/src/assets/id-template-front.png" 
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    onError={(e) => { e.target.style.display = 'none'; }} 
                    alt=""
                  />
                  <div className="relative z-10">
                    <p className="text-white/80 text-[8px] font-black uppercase tracking-widest bg-black/20 px-2 rounded">Student ID</p>
                    <p className="text-white font-black text-base font-mono drop-shadow-md">{item.studentId}</p>
                  </div>
                {item.photoUrl ? (
                  <img
                    src={item.photoUrl}
                    alt={item.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/40"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                    <User2 size={24} className="text-white/40" />
                  </div>
                )}
                {/* decorative rings */}
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-4 border-white/10" />
                <div className="absolute -right-4 -bottom-12 w-28 h-28 rounded-full border-4 border-white/5" />
              </div>

              {/* Info section */}
              <div className="p-5 space-y-3">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Student Name</p>
                  <p className="text-base font-black text-slate-900 truncate">{item.fullName}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Course</p>
                    <p className="text-sm font-bold text-slate-700">{COURSE_NAMES[item.course] || item.course}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Year</p>
                    <p className="text-sm font-bold text-slate-700">{YEAR_LABELS[item.yearLevel] || item.yearLevel}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  Issued: {new Date(item.issuedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>

                {/* Download buttons */}
                <div className="flex gap-2 pt-2 border-t border-slate-50">
                  {item.frontPdfPath && item.backPdfPath ? (
                    <>
                      <button
                        onClick={() => downloadIdPdf(item._id, 'front')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm transition-colors"
                      >
                        <FileText size={15} /> Front PDF
                      </button>
                      <button
                        onClick={() => downloadIdPdf(item._id, 'back')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors"
                      >
                        <BookOpen size={15} /> Back PDF
                      </button>
                      <button
                        onClick={() => {
                          downloadIdPdf(item._id, 'front');
                          setTimeout(() => downloadIdPdf(item._id, 'back'), 400);
                        }}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                        title="Download Both"
                      >
                        <Download size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRegenerate(item._id)}
                      disabled={regenerating === item._id}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-sm transition-colors disabled:opacity-50"
                    >
                      {regenerating === item._id
                        ? <><Loader2 size={15} className="animate-spin" /> Generating...</>
                        : <><RefreshCw size={15} /> Generate PDFs</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GeneratedIDs;
