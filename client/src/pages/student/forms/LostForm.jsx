import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitIdRequest } from '../../../services/request.service';
import { initiatePayment } from '../../../services/payment.service';
import FormWrapper from '../../../components/shared/FormWrapper';
import StudentInfoFields from '../../../components/shared/StudentInfoFields';
import FileUpload from '../../../components/ui/FileUpload';
import { Camera, PenTool, FileWarning, Store, Globe } from 'lucide-react';

const LostForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cashier'); // 'cashier' or 'online'
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    course: '',
    yearLevel: '',
    section: '',
    address: '',
    guardianName: '',
    guardianContact: '',
    contactNo: '',
  });

  const [files, setFiles] = useState({
    photo: null,
    signature: null,
    affidavit: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.contactNo === formData.guardianContact) {
      alert('Student contact number and Guardian contact number cannot be the same.');
      return;
    }

    // Validation
    if (!files.photo || !files.signature || !files.affidavit) {
      alert('Please complete all required uploads: Photo, Signature, and Affidavit of Loss.');
      return;
    }

    setLoading(true);

    try {
      // 1. Submit Request
      const data = new FormData();
      data.append('type', 'lost');
      data.append('personalInfo', JSON.stringify(formData));
      
      data.append('photo1x1', files.photo);
      data.append('signature', files.signature);
      data.append('lossReasonDoc', files.affidavit);

      const response = await submitIdRequest(data);
      const requestId = response.data._id;
      const refNo = response.data.referenceNumber;

      // 2. Handle Payment
      if (paymentMethod === 'online') {
        const paymentData = await initiatePayment(requestId, 'online');
        if (paymentData.data.checkoutUrl) {
          window.location.href = paymentData.data.checkoutUrl;
          return;
        }
      }
      
      setLoading(false);
      navigate('/success', { 
        state: { 
          refNo, 
          type: 'Lost ID Replacement',
          method: paymentMethod,
          message: 'Please proceed to the cashier with your reference number to pay the replacement fee.'
        } 
      });
    } catch (error) {
      setLoading(false);
      alert(error.response?.data?.message || 'Failed to submit request.');
    }
  };

  return (
    <FormWrapper 
      title="Lost ID Replacement" 
      description="Apply for a new ID card to replace a lost or stolen one. Affidavit of loss required."
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div className="space-y-8">
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-2 h-6 bg-red-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-800">Select Payment Method</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('cashier')}
              className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 ${
                paymentMethod === 'cashier' ? 'border-red-500 bg-red-50 ring-4 ring-red-500/10' : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'cashier' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Store className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Cashier Payment</p>
                <p className="text-xs text-slate-500 mt-1">Pay at school office</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('online')}
              className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 ${
                paymentMethod === 'online' ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-500/10' : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'online' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Online Payment</p>
                <p className="text-xs text-slate-500 mt-1">Pay via Paymongo (GCash/Maya)</p>
              </div>
            </button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-2 h-6 bg-red-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
          </div>
          <StudentInfoFields formData={formData} onChange={handleChange} color="red" />
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-2 h-6 bg-red-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-800">Required Uploads</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FileUpload label="1x1 Photo" name="photo" onChange={handleFileChange} accept="image/*" icon={Camera} helperText="PNG, JPG (Max 2MB)" />
            <FileUpload label="Signature" name="signature" onChange={handleFileChange} accept="image/*" icon={PenTool} helperText="Scanned signature" />
            <FileUpload label="Affidavit of Loss" name="affidavit" onChange={handleFileChange} accept=".pdf,image/*" icon={FileWarning} helperText="Notarized document" />
          </div>
        </section>
      </div>
    </FormWrapper>
  );
};

export default LostForm;
