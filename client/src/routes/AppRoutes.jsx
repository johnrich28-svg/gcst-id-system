import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layouts
import StudentLayout from '../components/layout/StudentLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Student Pages
import StudentHome from '../pages/student/Home';
import RequestType from '../pages/student/RequestType';
import TrackRequest from '../pages/student/TrackRequest';
import Success from '../pages/student/Success';
import NormalForm from '../pages/student/forms/NormalForm';
import ScholarForm from '../pages/student/forms/ScholarForm';
import RushForm from '../pages/student/forms/RushForm';
import LostForm from '../pages/student/forms/LostForm';

// Admin Pages
import AdminLogin from '../pages/admin/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminRequests from '../pages/admin/Requests';
import RequestDetails from '../pages/admin/RequestDetails';
import GeneratedIDs from '../pages/admin/GeneratedIDs';
import AdminSchedule from '../pages/admin/Schedule';
import BatchPrint from '../pages/admin/BatchPrint';

const StudentWrapper = () => (
  <StudentLayout>
    <Outlet />
  </StudentLayout>
);

import { useAuth } from '../context/AuthContext';

const AdminWrapper = () => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner

  if (!user || !user.token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};


const AppRoutes = () => {
  return (
    <Routes>
      {/* Student Routes */}
      <Route element={<StudentWrapper />}>
        <Route index element={<StudentHome />} />
        <Route path="request-type" element={<RequestType />} />
        <Route path="track-request" element={<TrackRequest />} />
        <Route path="success" element={<Success />} />
        <Route path="request/normal" element={<NormalForm />} />
        <Route path="request/scholar" element={<ScholarForm />} />
        <Route path="request/rush" element={<RushForm />} />
        <Route path="request/lost" element={<LostForm />} />
      </Route>

      {/* Admin Login (No Layout) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={<AdminWrapper />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="requests/:id" element={<RequestDetails />} />
        <Route path="generated-ids" element={<GeneratedIDs />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="batch-print/:batchId" element={<BatchPrint />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
