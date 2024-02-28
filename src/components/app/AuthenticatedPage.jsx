import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { EnterprisePage } from '../enterprise-page';
import AuthenticatedPageContext from './AuthenticatedPageContext';
import { useRecommendCoursesForMe } from './data';

const AuthenticatedPage = ({ children }) => {
  const recommendCoursesForMeContextValue = useRecommendCoursesForMe();
  const authenticatedPageContext = useMemo(() => ({
    ...recommendCoursesForMeContextValue,
  }), [recommendCoursesForMeContextValue]);

  return (
    <AuthenticatedPageContext.Provider value={authenticatedPageContext}>
      <EnterprisePage>
        {children}
      </EnterprisePage>
    </AuthenticatedPageContext.Provider>
  );
};

AuthenticatedPage.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthenticatedPage;
