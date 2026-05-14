import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, Clock, CheckCircle, Package } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { trackIdRequest } from '../../services/request.service';

const TrackRequest = () => {
  const [refNo, setRefNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!refNo) return;
    
    setLoading(true);
    try {
      const response = await trackIdRequest(refNo);
      const data = response.data;
      
      // Map status to steps
      const statusOrder = ['FOR_PAYMENT', 'PAID', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'GENERATED', 'READY_FOR_RELEASE', 'RELEASED'];
      const currentIdx = statusOrder.indexOf(data.status);
      
      setRequest({
        refNo: data.referenceNumber,
        status: data.status.replace(/_/g, ' '),
        studentName: data.personalInfo.fullName,
        type: data.type.charAt(0).toUpperCase() + data.type.slice(1) + ' Request',
        dateSubmitted: new Date(data.createdAt).toLocaleDateString(),
        steps: [
          { label: 'Submitted', date: new Date(data.createdAt).toLocaleString(), completed: true },
          { label: 'Payment', date: currentIdx >= 1 ? 'Settled' : (data.payment.required ? 'Action Required' : 'Not Required'), completed: currentIdx >= 1 || !data.payment.required },
          { label: 'Verification', date: currentIdx >= 3 ? 'Completed' : 'In Progress', completed: currentIdx >= 3 },
          { label: 'Approval', date: currentIdx >= 4 ? 'Approved' : 'Pending', completed: currentIdx >= 4 },
          { label: 'Ready for Pick-up', date: data.schedule?.releaseDate ? `Released on ${new Date(data.schedule.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : (currentIdx >= 6 ? 'Now Available' : 'Processing'), completed: currentIdx >= 6 },
        ]
      });

    } catch (error) {
      alert(error.response?.data?.message || 'Request not found.');
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Track Your Request</h1>
        <p className="text-slate-500">Enter your reference number to check the current status of your ID request.</p>
      </div>

      <div className="max-w-md mx-auto mb-16">
        <form onSubmit={handleTrack} className="flex gap-2">
          <Input 
            placeholder="Enter Reference No. (e.g. REQ-123456)" 
            value={refNo}
            onChange={(e) => setRefNo(e.target.value)}
            className="flex-1 uppercase font-mono"
          />
          <Button type="submit" className="h-[46px] px-6" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </Button>
        </form>
      </div>

      {request && (
        <div className="space-y-8 animate-slide-up">
          <div className="card grid md:grid-cols-2 gap-8 p-10 bg-white">
            <div className="space-y-6">
              <div>
                <Badge variant="primary" className="mb-2">Request Information</Badge>
                <h2 className="text-2xl font-bold text-slate-900">{request.studentName}</h2>
                <p className="text-slate-500">{request.type}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reference No.</p>
                  <p className="font-mono font-bold text-slate-800">{request.refNo}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date Submitted</p>
                  <p className="font-bold text-slate-800">{request.dateSubmitted}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-8 md:pt-0 md:pl-8">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Current Status</p>
              <div className="flex items-center gap-3 bg-primary-50 px-6 py-3 rounded-2xl border border-primary-100">
                <Clock className="text-primary-600 animate-pulse-subtle" size={24} />
                <span className="text-xl font-black text-primary-700">{request.status}</span>
              </div>
            </div>
          </div>

          <div className="card p-10">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <Package size={20} className="text-primary-600" />
              Tracking Timeline
            </h3>
            
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-slate-100">
              {request.steps.map((step, i) => (
                <div key={i} className="relative flex items-start gap-6 ml-1.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-4 border-white ring-4 ring-white ${step.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {step.completed ? <CheckCircle size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <div>
                    <p className={`font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                    <p className="text-xs text-slate-500 font-medium">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackRequest;
