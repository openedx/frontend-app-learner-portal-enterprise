import React from 'react';

import ProgramProgressPage from './ProgramProgressPage';
import AuthenticatedUserSubsidyPage from '../app/AuthenticatedUserSubsidyPage';

const ProgramProgress = () => (
  <AuthenticatedUserSubsidyPage>
    <ProgramProgressPage />
  </AuthenticatedUserSubsidyPage>
);

export default ProgramProgress;
