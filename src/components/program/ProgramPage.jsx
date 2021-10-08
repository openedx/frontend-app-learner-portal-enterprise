import React from 'react';

import Program from './Program';
import AuthenticatedUserSubsidyPage from '../app/AuthenticatedUserSubsidyPage';

const ProgramPage = () => (
  <AuthenticatedUserSubsidyPage>
    <Program />
  </AuthenticatedUserSubsidyPage>
);

export default ProgramPage;
