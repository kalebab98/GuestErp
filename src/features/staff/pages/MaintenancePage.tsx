import React from 'react';
import { AllRequestsPage } from './AllRequestsPage';

export const MaintenancePage: React.FC = () => {
  return (
    <AllRequestsPage
      fixedDepartment="maintenance"
      title="Maintenance & Engineering"
      subtitle="HVAC, plumbing, electrical, appliances, and technical apartment tickets"
    />
  );
};

