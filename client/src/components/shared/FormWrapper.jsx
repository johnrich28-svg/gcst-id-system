import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Button from '../ui/Button';

const FormWrapper = ({ title, description, children, onSubmit, loading }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/request-type')}>
          <ArrowLeft size={18} className="mr-2" /> Back
        </Button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2 tracking-tight">{title}</h1>
            <p className="text-slate-400 font-medium">{description}</p>
          </div>
          {/* Decorative design */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
        </div>

        <form onSubmit={onSubmit} className="p-10 space-y-8">
          {children}

          <div className="pt-6 flex gap-4">
            <Button 
              type="submit" 
              size="lg" 
              className="flex-1 gap-2" 
              disabled={loading}
            >
              <Save size={20} />
              {loading ? 'Submitting...' : 'Submit ID Request'}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              size="lg"
              onClick={() => navigate('/request-type')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormWrapper;
