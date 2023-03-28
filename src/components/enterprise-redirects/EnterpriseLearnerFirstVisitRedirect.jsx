import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { getConfig } from '@edx/frontend-platform/config';

import { isExperimentVariant } from '../../utils/optimizely';

const EnterpriseLearnerFirstVisitRedirect = () => {
  const cookies = new Cookies();
  const config = getConfig();

  const isFirstVisit = () => {
    const hasUserVisitedDashboard = cookies.get('has-user-visited-learner-dashboard');
    return !hasUserVisitedDashboard;
  };

  const isExperimentVariationA = isExperimentVariant(
    config.EXPERIMENT_4_ID,
    config.EXPERIMENT_4_VARIANT_1_ID,
  );

  useEffect(() => {
    if (isFirstVisit() && isExperimentVariationA) {
      cookies.set('has-user-visited-learner-dashboard', true, { path: '/' });
    }
  });

  if (isFirstVisit() && isExperimentVariationA) {
    return <Redirect to="/r/search" />;
  }

  return null;
};

export default EnterpriseLearnerFirstVisitRedirect;
