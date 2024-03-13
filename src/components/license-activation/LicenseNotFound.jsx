import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Container, Hyperlink } from '@openedx/paragon';
import NotFoundIcon from '../../assets/icons/NotFound.svg';

const LicenseNotFound = ({ pageTitle }) => (
  <Container size="lg" className="mt-3" data-testid="license-not-found-page">
    <Helmet title={pageTitle} />
    <div className="text-center py-5">
      <img
        src={NotFoundIcon}
        alt={pageTitle}
      />
      <h1 className="font-weight-bold mt-3">
        <span className="text-danger-500">We&apos;re sorry. </span>
        <span>We can&apos;t find a license assigned to this account.</span>
      </h1>
      <p>This may be because you have not yet{' '}
        <Hyperlink destination="https://authn.edx.org/register">
          registered for an account on edX.org
        </Hyperlink> or you are
        not signed in with an account that has been assigned a subscription license.
        The email address associated with this edX account is
        <span className="text-danger-500"> example_email@edx.org</span>
      </p>
      <h4>
        You can try the following to resolve and access your subscription license:
      </h4>
      <p>
        • <Hyperlink destination="https://courses.edx.org/logout">Sign out</Hyperlink> and sign in to the
        account connected to your subscription license.
      </p>
      <p>
        • If you have an existing edX account that uses a different email address, you can
        <Hyperlink destination="https://account.edx.org"> change the registered email on the account
        </Hyperlink> to match the one on the invite that is connected to the subscription license.
      </p>
    </div>
  </Container>
);

LicenseNotFound.defaultProps = {
  pageTitle: 'License not found',
};

LicenseNotFound.propTypes = {
  pageTitle: PropTypes.string,
};

export default LicenseNotFound;
