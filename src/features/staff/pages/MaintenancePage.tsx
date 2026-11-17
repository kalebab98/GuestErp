import React from 'react';
import { AllRequestsPage } from './AllRequestsPage';

export const MaintenancePage: React.FC = () => {
  return (
    <AllRequestsPage
      fixedDepartment="maintenance"
      title="Maintenance & Repairs"
      subtitle="Plumbing, hot water, electrical, appliances, locks, and general apartment repairs"
    />
  );
};
