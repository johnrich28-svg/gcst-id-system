import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Copy, Home, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const urlRef = queryParams.get('ref');

  const { refNo, type, message } = location.state || { 
    refNo: urlRef || 'REQ-XXXXXX', 
    type: 'ID Request',
    message: urlRef 
      ? 'Payment successful! Your request is now being processed.' 
      : 'Your request has been successfully submitted to the registrar for processing.'
  };

  const copyRef = () => {
    navigator.clipboard.writeText(refNo);
    alert('Reference number copied to clipboard!');
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 animate-fade-in text-center">
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-subtle">
        <CheckCircle size={48} />
      </div>

      <h1 className="text-4xl font-black text-slate-900 mb-4">Request Submitted!</h1>
      <div className="space-y-2 mb-12">
        <p className="text-lg text-slate-500">
          Your <span className="font-bold text-slate-900">{type}</span> submission was successful.
        </p>
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-medium max-w-md mx-auto">
          {message}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl mb-12">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Your Reference Number</p>
        <div className="flex items-center justify-center gap-4">
          <span className="text-3xl font-mono font-black text-primary-600">{refNo}</span>
          <button 
            onClick={copyRef}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary-600 transition-colors"
            title="Copy Reference"
          >
            <Copy size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please save your reference number. You will need it to track your request status or when claiming your ID.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Button variant="secondary" onClick={() => navigate('/')}>
            <Home size={18} className="mr-2" /> Back to Home
          </Button>
          <Button onClick={() => navigate('/track-request')}>
            Track Status <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Success;
