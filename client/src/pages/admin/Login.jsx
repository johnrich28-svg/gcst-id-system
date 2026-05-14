import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { login as apiLogin } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await apiLogin(credentials);
      login(response.data); // Store in AuthContext/LocalStorage
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-500 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="w-20 h-20 bg-primary-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary-500/20">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-6xl font-black text-white leading-tight">
            Administrative <span className="text-primary-500">Security</span> Console
          </h1>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">
            Manage student ID requests, verify documents, and generate official identification cards for GCST University.
          </p>
          <div className="pt-8 grid grid-cols-2 gap-8">
            <div>
              <p className="text-3xl font-black text-white">100%</p>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Secure Access</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">Live</p>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Request Queue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-12">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
              <ShieldCheck size={24} />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">Admin <span className="text-primary-600">Panel</span></span>
          </div>

          <div className="space-y-4 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900">Welcome Back</h2>
            <p className="text-lg text-slate-500 font-medium">Please enter your credentials to access the dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
                {error}
              </div>
            )}
            <div className="space-y-2">

              <Input 
                label="Email Address" 
                type="email" 
                placeholder="admin@gcst.edu.ph"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between ml-1">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <button type="button" className="text-xs font-bold text-primary-600 hover:text-primary-700">Forgot Password?</button>
              </div>
              <Input 
                type="password" 
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </div>

            <Button 
              size="lg" 
              className="w-full h-14 text-lg gap-2" 
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Sign In to Portal'}
              {!loading && <ArrowRight size={20} />}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 font-medium">
            Not an authorized administrator? <button onClick={() => navigate('/')} className="text-primary-600 font-bold">Return to Student Portal</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
