import React from 'react';
import PropTypes from 'prop-types';
import {
  Container,
} from '@edx/paragon';
import classNames from 'classnames';

/**
 * Individual content component container of ErrorPage component parent.
 * Different components can be passed for a greater level of customization
 * for error pages.
 */
function ErrorPageContent({ children, className }) {
  return (
    <Container size="lg" className={classNames('error-page-container', className)}>
      {children}
    </Container>
  );
}

ErrorPageContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

ErrorPageContent.defaultProps = {
  className: null,
};

export default ErrorPageContent;
