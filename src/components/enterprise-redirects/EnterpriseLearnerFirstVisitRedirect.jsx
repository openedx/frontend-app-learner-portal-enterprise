import React, { useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';

export const isFirstDashboardPageVisit = () => {
  const cookies = new Cookies();

  const hasUserVisitedDashboard = cookies.get('has-user-visited-learner-dashboard');
  return !hasUserVisitedDashboard;
};

const EnterpriseLearnerFirstVisitRedirect = () => {
  const { enterpriseSlug } = useParams();
  const cookies = new Cookies();

  useEffect(() => {
    if (isFirstDashboardPageVisit()) {
      cookies.set('has-user-visited-learner-dashboard', true, { path: '/' });
    }
  });

  if (isFirstDashboardPageVisit()) {
    return <Redirect to={`/${enterpriseSlug}/search`} />;
  }

  return null;
};

export default EnterpriseLearnerFirstVisitRedirect;
