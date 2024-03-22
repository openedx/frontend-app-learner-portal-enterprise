import { useContext } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { Helmet } from 'react-helmet';
import { Hyperlink } from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import NotFoundIcon from '../../../assets/icons/NotFound.svg';
import { ErrorPage } from '../../error-page';

const LicenseActivationRoute = () => {
  const { authenticatedUser } = useContext(AppContext);
  const { email } = authenticatedUser;

  return (
    <ErrorPage
      title="We're sorry."
      spannedTitle="We can't find a subscription license assigned to this account."
      showSiteHeader={false}
      showSiteFooter={false}
      errorPageContentClassName="text-center py-5"
      imageSrc={NotFoundIcon}
    >
      <Helmet title="No subscription license found" />
      <p>
        This may be because you are not signed in with an account that has been
        assigned a subscription license. The email address associated with this
        edX account is <span className="font-weight-bold">{email}</span>.
      </p>
      <p>You can try the following to resolve and access your subscription license:</p>
      <div className="d-flex align-items-center justify-content-center">
        <ul className="text-left w-75 small">
          <li>
            <Hyperlink destination={getConfig().LOGOUT_URL}>Sign out</Hyperlink> and sign in to the
            account connected to your subscription license.
          </li>
          <li>
            If you have an existing edX account that uses a different email address, you can{' '}
            <Hyperlink destination={`${getConfig().LMS_BASE_URL}/account/settings`}>
              change the registered email on the account
            </Hyperlink>{' '}
            to match the email address on the invite connected to the subscription license.
          </li>
        </ul>
      </div>
    </ErrorPage>
  );
};

export default LicenseActivationRoute;
