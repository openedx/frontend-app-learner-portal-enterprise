import React from 'react';
import PropTypes from 'prop-types';
import {
  Container,
} from '@openedx/paragon';
import classNames from 'classnames';

/**
 * Individual content component container of ErrorPage component parent.
 * Different components can be passed for a greater level of customization
 * for error pages.
 */
const ErrorPageContent = ({ children, className }) => (
  <Container size="lg" className={classNames('error-page-container', className)}>
    {children}
  </Container>
);

ErrorPageContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

ErrorPageContent.defaultProps = {
  className: null,
};

export default ErrorPageContent;
