import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck } from 'lucide-react';

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
            <User size={20} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">GCST <span className="text-primary-600">ID</span></span>
        </div>
        
        <nav className="flex gap-6 text-sm font-medium text-slate-600">
          <button onClick={() => navigate('/')} className="hover:text-primary-600 transition-colors">Home</button>
          <button onClick={() => navigate('/track-request')} className="hover:text-primary-600 transition-colors">Track Request</button>
        </nav>
      </header>
      
      <main className="flex-1 bg-slate-50">
        {children}
      </main>

      <footer className="py-8 bg-white border-t text-center text-slate-500 text-sm">
        <p>© 2026 GCST ID System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StudentLayout;
