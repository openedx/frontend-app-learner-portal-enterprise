import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAsyncError, useRouteError } from 'react-router-dom';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { defineMessages, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, AlertModal, Button, useToggle,
} from '@openedx/paragon';

import { ErrorPage } from '../../error-page';
import { retrieveErrorMessageForDisplay } from '../data';

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
  updateAvailableModalHeading: {
    id: 'updateAvailableModal.heading',
    defaultMessage: 'Update: New Version Available',
    description: 'Heading for the update available modal',
  },
  updateAvailableModalContent: {
    id: 'updateAvailableModal.content',
    defaultMessage: 'Attention: A new version of the website was released. To leverage the latest features and improvements, please perform a page refresh.',
    description: 'Content for the update available modal',
  },
  updateAvailableModalRefreshButtonText: {
    id: 'updateAvailableModal.refreshButtonText',
    defaultMessage: 'Refresh',
    description: 'Button text to refresh the page',
  },
});

function useHandleRouteError() {
  const routeError = useRouteError();
  const [isAppUpdateAvailable, openAppUpdateAvailableModal] = useToggle(false);

  useEffect(() => {
    if (!routeError) {
      return;
    }
    if (routeError.name === 'ChunkLoadError') {
      logInfo(`[RouteErrorBoundary] routeError (ChunkLoadError): ${routeError}`);
      openAppUpdateAvailableModal();
      return;
    }
    logError(`[RouteErrorBoundary] routeError: ${routeError.message}`);
  }, [routeError, openAppUpdateAvailableModal]);

  return useMemo(() => ({
    error: routeError,
    isAppUpdateAvailable,
  }), [routeError, isAppUpdateAvailable]);
}

function useHandleAsyncError() {
  const asyncError = useAsyncError();

  useEffect(() => {
    if (!asyncError) {
      return;
    }
    logError(`[RouteErrorBoundary] asyncError: ${asyncError}`);
  }, [asyncError]);

  return asyncError;
}

function useHandleErrorsOrAppUpdate() {
  const {
    error: routeError,
    isAppUpdateAvailable,
  } = useHandleRouteError();

  const asyncError = useHandleAsyncError();

  const error = routeError || asyncError;
  const errorMessageForDisplay = retrieveErrorMessageForDisplay(error);

  return useMemo(() => ({
    error,
    errorMessageForDisplay,
    isAppUpdateAvailable,
  }), [error, errorMessageForDisplay, isAppUpdateAvailable]);
}

const RouteErrorBoundary = ({
  title,
  subtitle,
  includeHelmet,
  showSiteHeader,
  showSiteFooter,
}) => {
  const intl = useIntl();
  const {
    errorMessageForDisplay,
    isAppUpdateAvailable,
  } = useHandleErrorsOrAppUpdate();

  if (isAppUpdateAvailable) {
    return (
      <AlertModal
        title={intl.formatMessage(messages.updateAvailableModalHeading)}
        variant="danger"
        isOpen={isAppUpdateAvailable}
        onClose={() => {}}
        footerNode={(
          <ActionRow>
            <Button
              variant="primary"
              href={global.location.href}
            >
              <FormattedMessage {...messages.updateAvailableModalRefreshButtonText} />
            </Button>
          </ActionRow>
        )}
        isBlocking
      >
        <p>
          <FormattedMessage {...messages.updateAvailableModalContent} />
        </p>
      </AlertModal>
    );
  }

  return (
    <ErrorPage
      errorPageContentClassName="py-5 text-center"
      title={title || intl.formatMessage(messages.errorTitle)}
      subtitle={subtitle || intl.formatMessage(messages.errorSubtitle)}
      includeHelmet={includeHelmet}
      showSiteHeader={showSiteHeader}
      showSiteFooter={showSiteFooter}
    >
      <pre className="py-4">{errorMessageForDisplay}</pre>
      <Button
        href={global.location.href}
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
