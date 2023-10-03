import React, { useContext } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

const ProgramProgressRedirect = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const { programUUID } = useParams();

  return <Navigate to={`/${enterpriseConfig.slug}/program/${programUUID}/progress`} replace />;
};

export default ProgramProgressRedirect;
