import React, { useState, useEffect, useRef } from 'react';
import { X, UserCheck, Loader2, ShieldCheck, AlertCircle, ChevronDown } from 'lucide-react';
import { getStaff, verifyStaffPin } from '../../services/staff.service';

/**
 * StaffSignoffModal
 *
 * Props:
 *   isOpen       — boolean, controls visibility
 *   onClose      — fn, called when modal is dismissed without confirming
 *   onConfirm    — fn(staffId, staffName), called after PIN is successfully verified
 *   title        — string, action title (e.g. "Release Batch")
 *   description  — string, short description shown in the modal
 */
const StaffSignoffModal = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', description = '' }) => {
  const [staffList, setStaffList]     = useState([]);
  const [selectedStaff, setSelected]  = useState('');
  const [pin, setPin]                 = useState('');
  const [loading, setLoading]         = useState(false);
  const [fetching, setFetching]       = useState(true);
  const [error, setError]             = useState('');
  const pinRef = useRef(null);

  // Load staff list when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setSelected('');
    setPin('');
    setError('');
    setFetching(true);

    getStaff()
      .then(res => setStaffList(res.data || []))
      .catch(() => setError('Failed to load staff list.'))
      .finally(() => setFetching(false));
  }, [isOpen]);

  // Auto-focus PIN when staff is selected
  useEffect(() => {
    if (selectedStaff && pinRef.current) {
      setTimeout(() => pinRef.current?.focus(), 50);
    }
  }, [selectedStaff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff) { setError('Please select your name.'); return; }
    if (!pin)           { setError('Please enter your PIN.'); return; }

    setError('');
    setLoading(true);
    try {
      const res = await verifyStaffPin(selectedStaff, pin);
      const { id, name } = res.data;
      onConfirm(id, name);
      setPin('');
      setSelected('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed.';
      setError(msg);
      setPin('');
      pinRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const staffMember = staffList.find(s => s._id === selectedStaff);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-8 pt-8 pb-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Staff Sign-off Required</p>
              <h2 className="text-xl font-black">{title}</h2>
            </div>
          </div>

          {description && (
            <p className="text-sm text-indigo-200 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          {fetching ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 className="animate-spin mr-2" size={20} /> Loading staff list...
            </div>
          ) : (
            <>
              {/* Staff Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Your Name
                </label>
                <div className="relative">
                  <select
                    value={selectedStaff}
                    onChange={e => { setSelected(e.target.value); setError(''); }}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all pr-10"
                  >
                    <option value="">— Select your name —</option>
                    {staffList.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* PIN Input */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Your PIN
                </label>
                <input
                  ref={pinRef}
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={pin}
                  onChange={e => { setPin(e.target.value); setError(''); }}
                  placeholder="Enter your PIN"
                  disabled={!selectedStaff}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 tracking-widest outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed placeholder:tracking-normal placeholder:font-normal"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Confirm Summary */}
              {staffMember && pin && !error && (
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-semibold">
                  <UserCheck size={16} className="shrink-0 text-emerald-500" />
                  Signing off as <span className="font-black ml-1">{staffMember.name}</span>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetching || !selectedStaff || !pin}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                : <><UserCheck size={16} /> Confirm</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffSignoffModal;
