import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { getBatches } from '../../services/admin.service';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BatchPrint = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [ids, setIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const batchesRes = await getBatches();
        const foundBatch = batchesRes.data.find(b => b._id === batchId);
        if (!foundBatch) {
          alert('Batch not found');
          navigate('/admin/schedule');
          return;
        }
        setBatch(foundBatch);
        const idsRes = await api.get('/id/generated');
        const batchRequestsIds = foundBatch.requestIds.map(r => r._id || r);
        const batchIds = idsRes.data.data.filter(id => batchRequestsIds.includes(id.requestId));
        setIds(batchIds);
      } catch (error) {
        console.error('Failed to fetch print data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [batchId, navigate]);

  const handleDownloadPDF = async () => {
    const cardElements = document.querySelectorAll('.id-card-print');
    if (!cardElements.length) {
      alert('No ID cards found to capture.');
      return;
    }

    setProcessing(true);
    console.log(`🚀 Starting batch PDF download for ${cardElements.length} cards...`);
    
    try {
      const pdf = new jsPDF('l', 'mm', [85.6, 54]);
      
      for (let i = 0; i < cardElements.length; i++) {
        try {
          console.log(`📸 Capturing card ${i + 1}/${cardElements.length}...`);
          const canvas = await html2canvas(cardElements[i], {
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0f172a',
            ignoreElements: (el) => el.tagName === 'IFRAME',
            onclone: (clonedDoc) => {
              const style = clonedDoc.createElement('style');
              style.innerHTML = `
                .id-card-print { 
                  border: 1px solid rgba(255,255,255,0.1) !important;
                }
                .id-card-print * {
                  color: #ffffff !important;
                  border-color: rgba(255,255,255,0.1) !important;
                }
              `;
              clonedDoc.head.appendChild(style);
            }
          });
          
          const imgData = canvas.toDataURL('image/png');
          if (i > 0) pdf.addPage([85.6, 54], 'l');
          pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
        } catch (cardErr) {
          console.error(`❌ Failed to capture card ${i + 1}:`, cardErr);
        }
      }
      
      console.log('💾 Saving PDF...');
      pdf.save(`${batch?.batchName || 'ID-Batch'}.pdf`);
      console.log('✅ PDF download complete.');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF. Check console for details.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="animate-spin text-primary-600" size={40} />
        <p className="font-bold text-slate-500">Preparing Batch for Printing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 print:p-0 print:bg-white relative">
      {/* Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <Loader2 className="animate-spin mb-4" size={48} />
          <h2 className="text-xl font-bold">Generating PDF Batch...</h2>
          <p className="opacity-70">Please wait while we capture {ids.length} ID cards.</p>
        </div>
      )}

      {/* Print Controls - Hidden during printing */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/schedule')}
            disabled={processing}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{batch?.batchName}</h1>
            <p className="text-sm text-slate-500 font-medium">Ready for batch download ({ids.length} IDs)</p>
          </div>
        </div>
        <Button onClick={handleDownloadPDF} disabled={processing} className="gap-2">
          {processing ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          {processing ? 'Processing...' : 'Download Batch (PDF)'}
        </Button>
      </div>

      {/* ID Grid for Printing */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4 print:gap-2">
        {ids.map((item) => (
          <div 
            key={item._id} 
            className="id-card-print aspect-[1.58/1] w-full p-6 text-white relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
              color: '#ffffff',
              borderRadius: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              printColorAdjust: 'exact', 
              WebkitPrintColorAdjust: 'exact' 
            }}
          >
            {/* Design Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', filter: 'blur(40px)' }}></div>
            
            <div className="flex justify-between items-start relative z-10" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h3 className="text-lg font-black tracking-tighter uppercase italic" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900 }}>GCST UNIVERSITY</h3>
                <p style={{ margin: 0, fontSize: '7px', letterSpacing: '0.1em', opacity: 0.6, fontWeight: 'bold', textTransform: 'uppercase' }}>Identification Card</p>
              </div>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ShieldCheck size={18} style={{ color: '#3b82f6', margin: 'auto' }} />
              </div>
            </div>
            
            <div className="mt-6 flex gap-5 relative z-10" style={{ marginTop: '1.5rem', display: 'flex', gap: '1.25rem' }}>
              <div style={{ width: '64px', height: '88px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                 <img src={item.photoUrl || 'https://picsum.photos/200'} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '8px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, fontWeight: 'bold' }}>Student Name</p>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: 1 }}>{item.fullName}</p>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, fontWeight: 'bold' }}>Student ID</p>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '12px', fontFamily: 'monospace' }}>{item.studentId}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, fontWeight: 'bold' }}>Program</p>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>{item.course}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-6 text-[7px] opacity-30 font-mono tracking-[0.2em] flex items-center gap-1" style={{ position: 'absolute', bottom: '1rem', right: '1.5rem', fontSize: '7px', opacity: 0.3, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CreditCard size={8} /> VERIFIED IDENTITY
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            background: white !important;
          }
          .card-grid {
            gap: 10px !important;
          }
        }
      `}} />
    </div>
  );
};

export default BatchPrint;
