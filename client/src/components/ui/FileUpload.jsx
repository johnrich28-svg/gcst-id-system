import React, { useState } from 'react';
import { UploadCloud, CheckCircle } from 'lucide-react';

const FileUpload = ({ label, name, onChange, accept, icon: Icon = UploadCloud, helperText }) => {
  const [fileName, setFileName] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName(null);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700 ml-1">
        {label}
      </label>
      <div className="relative group">
        <input
          type="file"
          name={name}
          onChange={handleFileChange}
          accept={accept}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all ${fileName ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 group-hover:bg-slate-100 group-hover:border-primary-300'}`}>
          {fileName ? (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-100 shadow-sm flex items-center justify-center text-emerald-600 mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 truncate max-w-full px-2">
                {fileName}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Click to change file
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 mb-3 group-hover:text-primary-500 transition-colors">
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-600">
                Click to upload or drag and drop
              </p>
              {helperText && (
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">
                  {helperText}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
