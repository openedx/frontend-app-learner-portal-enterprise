import React from 'react';
import PropTypes from 'prop-types';
import {
  Col,
} from '@openedx/paragon';

import SiteFooter from '@edx/frontend-component-footer';
import ErrorPageHeader from './ErrorPageHeader';
import ErrorPageTitle from './ErrorPageTitle';
import ErrorPageSubtitle from './ErrorPageSubtitle';
import ErrorPageContent from './ErrorPageContent';

/**
 * React component for the error case when attempting to link a user to a customer. Renders
 * a header, error alert, and a footer.
 */

const ErrorPage = ({
  title,
  subtitle,
  showSiteHeader,
  showSiteFooter,
  children,
}) => (
  <>
    {showSiteHeader && <ErrorPageHeader />}
    <main id="content">
      <ErrorPageContent>
        <Col xs={12} lg={{ span: 10, offset: 1 }}>
          <ErrorPageTitle>{title}</ErrorPageTitle>
          {subtitle && (
            <ErrorPageSubtitle>{subtitle}</ErrorPageSubtitle>
          )}
          {children}
        </Col>
      </ErrorPageContent>
    </main>
    {showSiteFooter && <SiteFooter />}
  </>
);

ErrorPage.Content = ErrorPageContent;
ErrorPage.Title = ErrorPageTitle;
ErrorPage.Subtitle = ErrorPageSubtitle;

ErrorPage.propTypes = {
  showSiteHeader: PropTypes.bool,
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  showSiteFooter: PropTypes.bool,
};

ErrorPage.defaultProps = {
  title: 'Error occurred while processing your request',
  subtitle: null,
  showSiteHeader: true,
  showSiteFooter: true,
};

export default ErrorPage;
