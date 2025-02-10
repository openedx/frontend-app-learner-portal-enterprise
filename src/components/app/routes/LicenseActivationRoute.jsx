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
      title="Oops!"
      titleClassName="display-1 text-brand-500 mb-4.5"
      spannedTitle="We can't find a license assigned to this account."
      showSiteHeader={false}
      showSiteFooter={false}
      errorPageContentClassName="text-center py-5"
      imageSrc={NotFoundIcon}
    >
      <Helmet title="License not found" />
      <p>
        You are currently logged in as <span className="text-brand">{email}</span>.
      </p>
      <p className="font-weight-bold">You can try one of the following to resolve and access your subscription license:</p>
      <div className="d-flex align-items-center justify-content-center">
        <ul className="text-left w-75 small">
          <li>
            <Hyperlink
              destination={getConfig().LOGOUT_URL}
              variant="muted"
              isInline
            >
              Log out
            </Hyperlink>, then sign back in
            with the email address connected to your subscription license.
          </li>
          <li>
            Create an account using the email address associated with your subscription license.
          </li>
          <li>
            <Hyperlink
              destination={`${getConfig().ACCOUNT_SETTINGS_URL}`}
              variant="muted"
              isInline
            >
              Update the email address
            </Hyperlink>{' '}
            on your existing account to the email address associated with your subscription license.
          </li>
        </ul>
      </div>
    </ErrorPage>
  );
};

export default LicenseActivationRoute;
