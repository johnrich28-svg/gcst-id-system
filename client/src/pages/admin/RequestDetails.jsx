import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, X, Printer, Clock, User, MapPin, 
  Phone, ShieldAlert, Download, ExternalLink, Loader2
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { getRequestDetails, validateRequest, generateIdCard, confirmPayment } from '../../services/admin.service';
import { getStatusConfig } from '../../utils/statusColors';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      const response = await getRequestDetails(id);
      setRequest(response.data);
    } catch (error) {
      console.error('Failed to fetch request details:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <div className="p-20 text-center text-slate-400">Loading details...</div>;
  if (!request) return <div className="p-20 text-center text-slate-400">Request not found.</div>;

  const statusConfig = getStatusConfig(request?.status || 'PENDING');

  const handleConfirmPayment = async () => {
    if (!window.confirm('Confirm that this student has paid at the cashier?')) return;
    setActionLoading(true);
    try {
      await confirmPayment(id);
      await fetchDetails(); // Refresh details
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to confirm payment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (status) => {
    setActionLoading(true);
    try {
      await validateRequest(id, { 
        status, 
        remarks: status === 'APPROVED' ? 'Documents verified' : 'Incomplete documentation',
        checkedDocuments: {
          photo1x1: true,
          signature: true,
          scholarDoc: request.type === 'scholar',
          lossReasonDoc: request.type === 'lost'
        }
      });
      navigate('/admin/requests');
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/requests')}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900">{request.referenceNumber}</h1>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}>
                {request?.status?.replace(/_/g, ' ') || 'PENDING'}
              </div>
            </div>
            <p className="text-slate-500 font-medium">Submitted on {request?.createdAt ? new Date(request.createdAt).toLocaleString() : 'Date Unknown'}</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Confirm Payment — only for FOR_PAYMENT */}
          {request.status === 'FOR_PAYMENT' && (
            <Button
              className="bg-amber-600 hover:bg-amber-700 shadow-amber-500/20"
              onClick={handleConfirmPayment}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="animate-spin" /> : <Clock size={18} className="mr-2" />} Confirm Cashier Payment
            </Button>
          )}

          {/* Decline — only for PENDING/UNDER_REVIEW/PAID */}
          {(request.status === 'PENDING' || request.status === 'UNDER_REVIEW' || request.status === 'PAID') && (
            <Button 
              variant="secondary" 
              className="text-red-600 hover:bg-red-50 border-red-100"
              onClick={() => handleAction('REJECTED')}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="animate-spin" /> : <X size={18} className="mr-2" />} Decline Request
            </Button>
          )}

          {/* Approve — only for PENDING/UNDER_REVIEW/PAID */}
          {(request.status === 'PENDING' || request.status === 'UNDER_REVIEW' || request.status === 'PAID') && (
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
              onClick={() => handleAction('APPROVED')}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="animate-spin" /> : <Check size={18} className="mr-2" />} Approve Request
            </Button>
          )}
          {/* Generate ID Card — for APPROVED or GENERATED (re-generate) */}
          {(request.status === 'APPROVED' || request.status === 'GENERATED') && (
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
              onClick={async () => {
                setActionLoading(true);
                try {
                  await generateIdCard(id);
                  await fetchDetails();
                } catch (err) {
                  alert(err.response?.data?.message || 'Failed to generate ID card.');
                } finally {
                  setActionLoading(false);
                }
              }}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="animate-spin" /> : <Printer size={18} className="mr-2" />}
              {request.status === 'GENERATED' ? 'Re-generate ID Card' : 'Generate ID Card'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-10 bg-white space-y-10">
            {/* Student Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-slate-400">
                <User size={18} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Student Information</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Full Name</p>
                  <p className="text-lg font-bold text-slate-900">{request?.personalInfo?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Student ID</p>
                  <p className="text-lg font-bold text-slate-900">{request?.personalInfo?.studentId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Course & Section</p>
                  <p className="text-lg font-bold text-slate-900">{request?.personalInfo?.course || 'N/A'} - {request?.personalInfo?.section || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Year Level</p>
                  <p className="text-lg font-bold text-slate-900">{request?.personalInfo?.yearLevel || 'N/A'}</p>
                </div>
              </div>
            </section>

            {/* Contact & Address */}
            <section className="space-y-6 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin size={18} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Contact & Address</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Home Address</p>
                  <p className="text-lg font-bold text-slate-900 leading-relaxed">{request?.personalInfo?.address || 'N/A'}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Email Address</p>
                    <p className="text-lg font-bold text-slate-900">{request?.personalInfo?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Contact Number</p>
                    <p className="text-lg font-bold text-slate-900">{request?.personalInfo?.contactNo || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Guardian Info */}
            <section className="space-y-6 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldAlert size={18} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Emergency Contact</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Guardian Name</p>
                  <p className="text-lg font-bold text-slate-900">{request?.personalInfo?.guardianName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Guardian Contact</p>
                  <p className="text-lg font-bold text-slate-900">{request?.personalInfo?.guardianContact || 'N/A'}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Uploaded Documents */}
          <div className="card p-10 bg-white space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Verification Documents</h3>
              <Button variant="ghost" size="sm" className="text-primary-600">
                <Download size={18} className="mr-2" /> Download All
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">1x1 Photo</p>
                <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden relative group">
                  {request?.uploads?.photo1x1 ? (
                    <>
                      <img src={request.uploads.photo1x1} alt="Student" className="w-full h-full object-cover" />
                      <a href={request.uploads.photo1x1} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="text-white" size={24} />
                      </a>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">No Photo</div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Signature</p>
                <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden relative group">
                  {request?.uploads?.signature ? (
                    <>
                      <img src={request.uploads.signature} alt="Signature" className="w-full h-full object-contain p-4" />
                      <a href={request.uploads.signature} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="text-white" size={24} />
                      </a>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">No Signature</div>
                  )}
                </div>
              </div>
               <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Supporting Document</p>
                <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden relative group flex items-center justify-center flex-col gap-2">
                  <Printer size={32} className={`${(request?.uploads?.scholarDoc || request?.uploads?.lossReasonDoc) ? 'text-primary-600' : 'text-slate-300'}`} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {(request?.uploads?.scholarDoc || request?.uploads?.lossReasonDoc) ? 'View File' : 'No Document'}
                  </p>
                  {(request?.uploads?.scholarDoc || request?.uploads?.lossReasonDoc) && (
                    <a href={request.uploads.scholarDoc || request.uploads.lossReasonDoc} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="text-white" size={24} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Status */}
        <div className="space-y-8">
          <div className="card p-8 bg-slate-900 text-white space-y-6">
            <h3 className="text-lg font-bold">Request Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm py-3 border-b border-white/10">
                <span className="text-slate-400">Type</span>
                <span className="font-bold capitalize">{request?.type || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-3 border-b border-white/10">
                <span className="text-slate-400">Payment</span>
                <span className={`font-bold ${request?.payment?.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {request?.payment?.status || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-3 border-b border-white/10">
                <span className="text-slate-400">Ref Number</span>
                <span className="font-mono font-bold text-primary-400">{request?.payment?.transactionId || request?.referenceNumber || 'N/A'}</span>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Priority Status</p>
              <div className="flex items-center gap-2 text-amber-400">
                <Clock size={16} />
                <span className="text-sm font-bold">High Priority (Rush)</span>
              </div>
            </div>
          </div>

          <div className="card p-8 bg-white space-y-6">
            <h3 className="text-lg font-bold text-slate-900">History Log</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:bg-slate-100">
              <div className="relative flex gap-4 ml-0.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white z-10"></div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Submitted</p>
                  <p className="text-[10px] text-slate-500">10:45 AM, Apr 18</p>
                </div>
              </div>
              <div className="relative flex gap-4 ml-0.5">
                <div className="w-4 h-4 rounded-full bg-slate-200 ring-4 ring-white z-10"></div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Verification Started</p>
                  <p className="text-[10px] text-slate-500">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
