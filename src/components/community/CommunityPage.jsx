import React from 'react';

import Community from './Community';
import AuthenticatedUserSubsidyPage from '../app/AuthenticatedUserSubsidyPage';

export default function CommunityPage() {
  return (
    <AuthenticatedUserSubsidyPage>
      <Community />
    </AuthenticatedUserSubsidyPage>
  );
}
