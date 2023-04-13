import React, { useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { getConfig } from '@edx/frontend-platform/config';

import { AppContext } from '@edx/frontend-platform/react';
import { EVENTS, isExperimentVariant, pushEvent } from '../../utils/optimizely';

const EnterpriseLearnerFirstVisitRedirect = () => {
  const cookies = new Cookies();
  const config = getConfig();

  const { authenticatedUser } = useContext(AppContext);
  const { username } = authenticatedUser;

  const isFirstVisit = () => {
    const hasUserVisitedDashboard = cookies.get('has-user-visited-learner-dashboard');
    return !hasUserVisitedDashboard;
  };

  const isExperimentVariationA = isExperimentVariant(
    config.EXPERIMENT_4_ID,
    config.EXPERIMENT_4_VARIANT_1_ID,
  );

  useEffect(() => {
    if (isFirstVisit()) {
      cookies.set('has-user-visited-learner-dashboard', true, { path: '/' });
      pushEvent(EVENTS.ENTERPRISE_LEARNER_FIRST_VISIT_TO_DASHBOARD, { username });
    }
  });

  if (isFirstVisit() && isExperimentVariationA) {
    return <Redirect to="/r/search" />;
  }

  return null;
};

export default EnterpriseLearnerFirstVisitRedirect;
