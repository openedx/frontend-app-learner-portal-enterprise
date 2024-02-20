import { redirect } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import {
  AxiosJwtAuthService,
  configure as configureAuth,
  fetchAuthenticatedUser,
  getLoginRedirectUrl,
} from '@edx/frontend-platform/auth';
import {
  configure as configureLogging,
  getLoggingService,
  NewRelicLoggingService,
} from '@edx/frontend-platform/logging';

configureLogging(NewRelicLoggingService, {
  config: getConfig(),
});

configureAuth(AxiosJwtAuthService, {
  loggingService: getLoggingService(),
  config: getConfig(),
});

const ensureAuthenticatedUser = async (requestUrl) => {
  const authenticatedUser = await fetchAuthenticatedUser();
  if (!authenticatedUser) {
    // TODO: why is this no longer seeming to work?
    throw redirect(getLoginRedirectUrl(requestUrl.href));
  }
  return authenticatedUser;
};

export default ensureAuthenticatedUser;
