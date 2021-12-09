import React from 'react';
import PropTypes from 'prop-types';
import {
  Col,
  Container,
} from '@edx/paragon';
import SiteFooter from '@edx/frontend-component-footer';

import ErrorPageHeader from './ErrorPageHeader';

/**
 * React component for the error case when attempting to link a user to a customer. Renders
 * a header, error alert, and a footer.
 */
const ErrorPage = ({
  title,
  subtitle,
  children,
}) => (
  <>
    <ErrorPageHeader />
    <main id="content" className="error-page-container">
      <Container>
        <Col xs={12} lg={{ span: 10, offset: 1 }}>
          <h1 className="error-page-title h2">{title}</h1>
          {subtitle && (
            <h2 className="error-page-subtitle h3">{subtitle}</h2>
          )}
          <div className="error-page-message">
            {children}
          </div>
        </Col>
      </Container>
    </main>
    <SiteFooter />
  </>
);

ErrorPage.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
};

ErrorPage.defaultProps = {
  title: 'Error occurred while processing your request',
  subtitle: null,
};

export default ErrorPage;
