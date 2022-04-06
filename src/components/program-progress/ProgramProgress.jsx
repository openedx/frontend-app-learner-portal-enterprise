import React from 'react';

import ProgramProgressPage from './ProgramProgressPage';
import AuthenticatedUserSubsidyPage from '../app/AuthenticatedUserSubsidyPage';

export default function ProgramProgress() {
  return (
    <AuthenticatedUserSubsidyPage>
      <ProgramProgressPage />
    </AuthenticatedUserSubsidyPage>
  );
}
