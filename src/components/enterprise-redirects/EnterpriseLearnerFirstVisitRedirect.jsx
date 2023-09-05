import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

const EnterpriseLearnerFirstVisitRedirect = () => {
  const cookies = new Cookies();

  const isFirstVisit = () => {
    const hasUserVisitedDashboard = cookies.get('has-user-visited-learner-dashboard');
    return !hasUserVisitedDashboard;
  };

  useEffect(() => {
    if (isFirstVisit()) {
      cookies.set('has-user-visited-learner-dashboard', true, { path: '/' });
    }
  });

  if (isFirstVisit()) {
    return <Navigate to="/r/search" replace />;
  }

  return null;
};

export default EnterpriseLearnerFirstVisitRedirect;
