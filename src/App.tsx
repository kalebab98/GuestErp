import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { GuestPortalPage } from './features/guest/pages/GuestPortalPage';
import { MyRequestsPage } from './features/guest/pages/MyRequestsPage';
import { StaffLayout } from './components/layout/StaffLayout';
import { OverviewPage } from './features/staff/pages/OverviewPage';
import { AllRequestsPage } from './features/staff/pages/AllRequestsPage';
import { MaintenancePage } from './features/staff/pages/MaintenancePage';
import { HousekeepingPage } from './features/staff/pages/HousekeepingPage';
import { GuestHealthPage } from './features/staff/pages/GuestHealthPage';
import { FeedbackPage } from './features/staff/pages/FeedbackPage';
import { ReportsPage } from './features/staff/pages/ReportsPage';
import { SettingsPage } from './features/staff/pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing / Gateway */}
        <Route path="/" element={<HomePage />} />

        {/* Guest Mobile Portal Routes */}
        <Route path="/portal" element={<GuestPortalPage />} />
        <Route path="/portal/requests" element={<MyRequestsPage />} />

        {/* Staff Management Dashboard Routes */}
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="requests" element={<AllRequestsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="housekeeping" element={<HousekeepingPage />} />
          <Route path="health" element={<GuestHealthPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

