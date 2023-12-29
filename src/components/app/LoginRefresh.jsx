import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@openedx/paragon';

import { LoadingSpinner } from '../loading-spinner';
import { loginRefresh } from '../../utils/common';

const LoginRefresh = ({ children }) => {
  const { authenticatedUser } = useContext(AppContext);
  const { roles } = authenticatedUser;

  // If the user has not refreshed their JWT since they created their account,
  // we should refresh it so that they'll have appropriate roles (if available),
  // and thus, have any appropriate permissions when making downstream requests.
  const [isRefreshingJWT, setIsRefreshingJWT] = useState(roles.length === 0);

  useEffect(() => {
    const refreshJWT = async () => {
      await loginRefresh();
      setIsRefreshingJWT(false);
    };
    if (isRefreshingJWT) {
      refreshJWT();
    }
  }, [isRefreshingJWT]);

  if (isRefreshingJWT) {
    return (
      <Container size="lg" className="py-5">
        <LoadingSpinner screenReaderText="loading user details" />
      </Container>
    );
  }

  return children;
};

LoginRefresh.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LoginRefresh;
