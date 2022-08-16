import React, { useContext } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

function ProgramProgressRedirect() {
  const { enterpriseConfig } = useContext(AppContext);
  const { programUUID } = useParams();

  return <Redirect to={`/${enterpriseConfig.slug}/program/${programUUID}/progress`} />;
}

export default ProgramProgressRedirect;
