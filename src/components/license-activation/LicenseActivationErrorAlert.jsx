import React from 'react';
import PropTypes from 'prop-types';

import { Helmet } from 'react-helmet';
import { Alert, Container } from '@openedx/paragon';

const LicenseActivationErrorAlert = ({ title, contactHelpText }) => (
  <>
    <Helmet title={title} />
    <Container size="lg" className="mt-3">
      <Alert variant="danger">
        We were unable to activate a license for this user. Please double-check that you have an
        assigned license and verify the email to which it was sent. If you run into further issues,
        please {contactHelpText} for assistance.
      </Alert>
    </Container>
  </>
);

LicenseActivationErrorAlert.propTypes = {
  title: PropTypes.string.isRequired,
  contactHelpText: PropTypes.string.isRequired,
};

export default LicenseActivationErrorAlert;
