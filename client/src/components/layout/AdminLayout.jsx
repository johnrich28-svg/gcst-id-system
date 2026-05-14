import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  UserCheck, 
  Calendar, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { label: 'ID Requests', icon: <FileText size={20} />, path: '/admin/requests' },
    { label: 'Generated IDs', icon: <UserCheck size={20} />, path: '/admin/generated-ids' },
    { label: 'Schedule', icon: <Calendar size={20} />, path: '/admin/schedule' },
  ];

  if (location.pathname.startsWith('/admin/batch-print')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col fixed h-full z-50">
        <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800">
          <ShieldCheck className="text-primary-500" size={28} />
          <span className="font-display font-bold text-xl tracking-tight">Admin <span className="text-primary-500">Panel</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => navigate('/admin/login')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 px-8 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            {menuItems.find(i => i.path === location.pathname)?.label || 'Admin'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">Administrator</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="Admin" />
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
