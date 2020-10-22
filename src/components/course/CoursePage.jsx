import React from 'react';

import Course from './Course';
import AuthenticatedUserSubsidyPage from '../app/AuthenticatedUserSubsidyPage';

export default function CoursePage() {
  return (
    <AuthenticatedUserSubsidyPage>
      <Course />
    </AuthenticatedUserSubsidyPage>
  );
}
