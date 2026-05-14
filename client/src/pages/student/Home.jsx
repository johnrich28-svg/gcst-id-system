import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Search, ShieldCheck, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-bold border border-primary-100">
            <ShieldCheck size={16} />
            Official GCST ID Portal
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-black text-slate-900 leading-tight">
            Get Your Student <span className="text-primary-600">ID Card</span> Digitally.
          </h1>
          
          <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
            Request, track, and manage your student identification with ease. 
            Fast processing for normal, scholar, rush, and replacement requests.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg gap-2"
              onClick={() => navigate('/request-type')}
            >
              Request New ID <ArrowRight size={20} />
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="px-8 py-4 text-lg gap-2"
              onClick={() => navigate('/track-request')}
            >
              Track My Request <Search size={20} />
            </Button>
          </div>
          
          <div className="flex items-center gap-8 pt-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="Student" />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Joined by <span className="text-slate-900 font-bold">2,500+</span> active students
            </p>
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg animate-fade-in delay-200">
          <div className="relative">
            {/* ID Card Mockup */}
            <div className="aspect-[1.58/1] bg-gradient-to-br from-primary-600 to-primary-800 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-colors"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic">GCST UNIVERSITY</h3>
                  <p className="text-[10px] tracking-widest opacity-80 font-bold">ESTABLISHED 1995</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center">
                  <ShieldCheck size={28} />
                </div>
              </div>
              
              <div className="mt-12 flex gap-6 relative z-10">
                <div className="w-24 h-32 bg-slate-200 rounded-xl border-2 border-white/30 overflow-hidden shadow-lg">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Student Photo" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-end space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Student Name</p>
                    <p className="text-xl font-bold tracking-tight">ALEXANDER R. SMITH</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Student ID</p>
                      <p className="font-mono font-bold">2024-001234</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Program</p>
                      <p className="font-bold">BS-CS</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-6 right-8 text-[10px] opacity-40 font-mono tracking-widest">
                VERIFIED GCST IDENTITY
              </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-accent-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -z-10 -top-10 -right-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-40 grid md:grid-cols-3 gap-8">
        {[
          { icon: <FilePlus className="text-primary-600" />, title: "Easy Request", desc: "Choose your request type and fill out the form in minutes." },
          { icon: <Search className="text-primary-600" />, title: "Live Tracking", desc: "Monitor your request status from submission to pick-up." },
          { icon: <ShieldCheck className="text-primary-600" />, title: "Secure Data", desc: "Your personal information is encrypted and protected." }
        ].map((feat, i) => (
          <div key={i} className="card p-10 group hover:-translate-y-2 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {feat.icon}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">{feat.title}</h3>
            <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
