import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAsyncError, useRouteError } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { Button, Hyperlink } from '@openedx/paragon';

import { ErrorPage } from '../../error-page';

const retrieveErrorBoundaryErrorMessage = (error) => {
  if (!error) {
    return null;
  }
  if (error.customAttributes) {
    return error.customAttributes.httpErrorResponseData;
  }
  return error.message;
};

const messages = defineMessages({
  errorTitle: {
    id: 'errorBoundary.title',
    defaultMessage: 'An error occurred while processing your request',
    description: 'Title for the error boundary page',
  },
  errorSubtitle: {
    id: 'errorBoundary.subtitle',
    defaultMessage: 'We apologize for the inconvenience. Please try again later.',
    description: 'Subtitle for the error boundary page',
  },
  tryAgainCTA: {
    id: 'errorBoundary.tryAgainCTA',
    defaultMessage: 'Try again',
    description: 'CTA to try again by reloading the page',
  },
});

const RouteErrorBoundary = ({
  title,
  subtitle,
  includeHelmet,
  showSiteHeader,
  showSiteFooter,
}) => {
  // const intl = useIntl();
  const routeError = useRouteError();
  console.log(routeError);
  return null;

  const asyncError = useAsyncError();

  useEffect(() => {
    if (routeError) {
      logError(routeError);
    }
  }, [routeError]);

  useEffect(() => {
    if (asyncError) {
      logError(asyncError);
    }
  }, [asyncError]);

  const error = routeError || asyncError;

  const errorMessage = retrieveErrorBoundaryErrorMessage(error);

  return (
    <ErrorPage
      errorPageContentClassName="py-5 text-center"
      title={title || intl.formatMessage(messages.errorTitle)}
      subtitle={subtitle || intl.formatMessage(messages.errorSubtitle)}
      includeHelmet={includeHelmet}
      showSiteHeader={showSiteHeader}
      showSiteFooter={showSiteFooter}
    >
      <pre className="py-4">{errorMessage}</pre>
      <Button
        as={Hyperlink}
        destination={global.location.href}
        variant="primary"
      >
        {intl.formatMessage(messages.tryAgainCTA)}
      </Button>
    </ErrorPage>
  );
};

RouteErrorBoundary.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  includeHelmet: PropTypes.bool,
  showSiteHeader: PropTypes.bool,
  showSiteFooter: PropTypes.bool,
};

RouteErrorBoundary.defaultProps = {
  title: null,
  subtitle: null,
  includeHelmet: false,
  showSiteHeader: true,
  showSiteFooter: true,
};

export default RouteErrorBoundary;
