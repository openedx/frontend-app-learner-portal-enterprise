import React from 'react';

import ProgramListing from './ProgramLisitng';
import AuthenticatedUserSubsidyPage from '../app/AuthenticatedUserSubsidyPage';

const ProgramListingPage = () => (
  <AuthenticatedUserSubsidyPage>
    <ProgramListing />
  </AuthenticatedUserSubsidyPage>
);

export default ProgramListingPage;
