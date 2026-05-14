import React from 'react';
import Input from '../ui/Input';

const StudentInfoFields = ({ formData, onChange, color = "primary" }) => {
  const focusColor = color === "red" ? "focus:border-red-500 focus:ring-red-500/10" : "focus:border-primary-500 focus:ring-primary-500/10";
  const selectBase = "w-full px-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl outline-none transition-all";

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-1 gap-6">
        <Input 
          label="Full Name" 
          name="fullName" 
          placeholder="First M. Last" 
          value={formData.fullName}
          onChange={onChange}
          required 
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1">Course / Program</label>
          <select 
            name="course" 
            className={`${selectBase} ${focusColor}`}
            value={formData.course}
            onChange={onChange}
            required
          >
            <option value="">Select Course</option>
            <option value="BSIT">BS Information Technology</option>
            <option value="BSCS">BS Computer Science</option>
            <option value="BEED">Bachelor of Elementary Education</option>
            <option value="BSED">Bachelor of Secondary Education</option>
            <option value="BSCRIM">BS Criminology</option>
            <option value="BSA">BS Accountancy</option>
            <option value="BSBA-MM">BS Business Administration — Marketing Mgmt</option>
            <option value="BSBA-OM">BS Business Administration — Operations Mgmt</option>
            <option value="BSTM">BS Tourism Management</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1">Year Level</label>
          <select 
            name="yearLevel" 
            className={`${selectBase} ${focusColor}`}
            value={formData.yearLevel}
            onChange={onChange}
            required
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
        <Input 
          label="Section" 
          name="section" 
          placeholder="e.g. 1A" 
          value={formData.section}
          onChange={onChange}
          required 
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Input 
          label="Email Address" 
          name="email" 
          type="email" 
          placeholder="student@gcst.edu.ph" 
          value={formData.email}
          onChange={onChange}
          required 
        />
        <Input 
          label="Contact Number" 
          name="contactNo" 
          placeholder="09123456789" 
          value={formData.contactNo}
          onChange={onChange}
          required 
        />
      </div>

      <Input 
        label="Home Address" 
        name="address" 
        placeholder="Full address (Street, Brgy, City, Province)" 
        value={formData.address}
        onChange={onChange}
        required 
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Input 
          label="Guardian Name" 
          name="guardianName" 
          placeholder="Full Name" 
          value={formData.guardianName}
          onChange={onChange}
          required 
        />
        <Input 
          label="Guardian Contact Number" 
          name="guardianContact" 
          placeholder="09123456789" 
          value={formData.guardianContact}
          onChange={onChange}
          required 
        />
      </div>
    </div>
  );
};

export default StudentInfoFields;
