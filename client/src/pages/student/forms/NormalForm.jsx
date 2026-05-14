import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitIdRequest } from '../../../services/request.service';
import FormWrapper from '../../../components/shared/FormWrapper';
import StudentInfoFields from '../../../components/shared/StudentInfoFields';
import FileUpload from '../../../components/ui/FileUpload';
import { Camera, PenTool } from 'lucide-react';

const NormalForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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

    if (!files.photo) {
      alert('Please upload your 1x1 Photo before submitting.');
      return;
    }
    if (!files.signature) {
      alert('Please upload your Signature before submitting.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('type', 'normal');
      data.append('personalInfo', JSON.stringify(formData));
      data.append('photo1x1', files.photo);
      data.append('signature', files.signature);

      const response = await submitIdRequest(data);
      setLoading(false);
      navigate('/success', {
        state: {
          refNo: response.data.referenceNumber,
          type: 'Normal ID Request',
          message: 'Your request has been successfully submitted to the registrar for processing.'
        }
      });
    } catch (error) {
      setLoading(false);
      alert(error.response?.data?.message || 'Failed to submit request.');
    }
  };


  return (
    <FormWrapper 
      title="Normal ID Request" 
      description="Fill in your details for a standard student ID card replacement or renewal."
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div className="space-y-8">
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-2 h-6 bg-primary-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
          </div>
          <StudentInfoFields formData={formData} onChange={handleChange} />
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-2 h-6 bg-primary-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-800">Uploads</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <FileUpload label="1x1 Photo" name="photo" onChange={handleFileChange} accept="image/*" icon={Camera} helperText="PNG, JPG (Max 2MB)" />
            <FileUpload label="Signature" name="signature" onChange={handleFileChange} accept="image/*" icon={PenTool} helperText="Scanned signature or photo" />
          </div>
        </section>
      </div>
    </FormWrapper>
  );
};

export default NormalForm;
