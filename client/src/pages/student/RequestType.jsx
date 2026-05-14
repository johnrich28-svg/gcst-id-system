import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, Zap, AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';

const RequestType = () => {
  const navigate = useNavigate();

  const types = [
    {
      id: 'normal',
      title: 'Normal Request',
      description: 'Standard ID card for regular students. Processed within 3-5 working days.',
      icon: <User size={24} />,
      color: 'bg-blue-500',
      path: '/request/normal'
    },
    {
      id: 'scholar',
      title: 'Scholar ID',
      description: 'Special ID for scholarship recipients with privilege markers.',
      icon: <GraduationCap size={24} />,
      color: 'bg-indigo-600',
      path: '/request/scholar'
    },
    {
      id: 'rush',
      title: 'Rush Processing',
      description: 'Priority printing for students who need their ID urgently (Same day).',
      icon: <Zap size={24} />,
      color: 'bg-amber-500',
      path: '/request/rush'
    },
    {
      id: 'lost',
      title: 'Lost / Replacement',
      description: 'Request a new card if your previous one was lost or damaged.',
      icon: <AlertCircle size={24} />,
      color: 'bg-red-500',
      path: '/request/lost'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 animate-fade-in">
      <div className="flex items-center gap-4 mb-12">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft size={18} className="mr-2" /> Back
        </Button>
      </div>

      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl font-black text-slate-900">Select Request Type</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Choose the appropriate category for your ID request. Each type has different requirements and processing times.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => navigate(type.path)}
            className="group relative flex flex-col items-start p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-500/20 transition-all duration-300 text-left overflow-hidden"
          >
            <div className={`w-14 h-14 rounded-2xl ${type.color} text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              {type.icon}
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-3">{type.title}</h3>
            <p className="text-slate-500 leading-relaxed mb-6">{type.description}</p>
            
            <div className="mt-auto flex items-center gap-2 text-primary-600 font-bold group-hover:gap-3 transition-all">
              Continue Request <Zap size={16} fill="currentColor" />
            </div>

            {/* Decorative background circle */}
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 ${type.color} opacity-[0.03] rounded-full`}></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RequestType;
