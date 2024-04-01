import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Container, Hyperlink } from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import NotFoundIcon from '../../assets/icons/NotFound.svg';

const LicenseNotFound = ({ pageTitle }) => {
  const { authenticatedUser } = useContext(AppContext);
  const { email } = authenticatedUser;

  return (
    <Container size="lg" className="py-5" data-testid="license-not-found-page">
      <Helmet title={pageTitle} />
      <div className="text-center mt-6">
        <img
          src={NotFoundIcon}
          alt={pageTitle}
        />
        <h1 className="display-1 mt-4 mb-4">
          <span className="text-brand-500">Oops! </span>
          <span className="text-primary-700">We can&apos;t find a license assigned to this account.</span>
        </h1>
        <span> You are currently logged in as {' '}<span className="text-brand-500">{email}</span></span>
        <h4 className="mt-4 text-gray-700">
          You can try one of the following to resolve and access your subscription license:
        </h4>
        <div>
          <span className="d-block">
            • <Hyperlink isInline variant="muted" destination="https://courses.edx.org/logout">Log out,</Hyperlink> then sign back in with the email address connected to your subscription license.
          </span>
          <span className="d-block">
            • Create an account using the email address associated with your subscription license.
          </span>
          <span className="d-block">
            • <Hyperlink isInline variant="muted" destination="https://account.edx.org">Update the email address</Hyperlink> on your existing account to the email address associated with your subscription license.
          </span>
        </div>
      </div>
    </Container>
  );
};

LicenseNotFound.defaultProps = {
  pageTitle: 'License not found',
};

LicenseNotFound.propTypes = {
  pageTitle: PropTypes.string,
};

export default LicenseNotFound;
