import React from 'react';

import Course from './Course';
import AuthenticatedUserSubsidyPage from '../app/AuthenticatedUserSubsidyPage';
import OffersAlert from '../enterprise-user-subsidy/OffersAlert';

export default function CoursePage() {
  return (
    <AuthenticatedUserSubsidyPage>
      <OffersAlert />
      <Course />
    </AuthenticatedUserSubsidyPage>
  );
}
