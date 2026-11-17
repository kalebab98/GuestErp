import React from 'react';
import { AllRequestsPage } from './AllRequestsPage';

export const HousekeepingPage: React.FC = () => {
  return (
    <AllRequestsPage
      fixedDepartment="housekeeping"
      title="Housekeeping & Linen Services"
      subtitle="Fresh towels, room cleaning, toiletries, bedding, and apartment amenities"
    />
  );
};

