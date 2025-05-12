import { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAsyncError, useRouteError } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { defineMessages, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, AlertModal, Button, Collapsible, useToggle,
} from '@openedx/paragon';

import { ErrorPage } from '../error-page';
import { retrieveErrorMessageForDisplay, retrieveErrorStackForDisplay } from './data';

interface AppErrorBoundaryProps {
  error?: Error | null;
  title?: React.ReactNode | null;
  subtitle?: React.ReactNode | null;
  includeHelmet?: boolean;
  showSiteHeader?: boolean;
  showSiteFooter?: boolean;
}

const messages = defineMessages({
  errorTitle: {
    id: 'enterprise.learner_portal.error_boundary.title',
    defaultMessage: 'An error occurred while processing your request',
    description: 'Title for the error boundary page',
  },
  errorSubtitle: {
    id: 'enterprise.learner_portal.error_boundary.subtitle',
    defaultMessage: 'We apologize for the inconvenience. Please try again later.',
    description: 'Subtitle for the error boundary page',
  },
  errorBody: {
    id: 'enterprise.learner_portal.error_boundary.body',
    defaultMessage: 'This may be caused by a problem with your internet connection or a temporary issue on our end. Please check your connection and try again, or return later if the issue persists.',
    description: 'Body for the error boundary page',
  },
  viewErrorDetails: {
    id: 'enterprise.learner_portal.error_boundary.view_error_details',
    defaultMessage: 'View error details',
    description: 'Label for the button to view error details',
  },
  tryAgainCTA: {
    id: 'enterprise.learner_portal.error_boundary.try_again',
    defaultMessage: 'Try again',
    description: 'CTA to try again by reloading the page',
  },
  updateAvailableModalHeading: {
    id: 'enterprise.learner_portal.update_available_modal.heading',
    defaultMessage: 'Update: New Version Available',
    description: 'Heading for the update available modal',
  },
  updateAvailableModalContent: {
    id: 'enterprise.learner_portal.update_available_modal.content',
    defaultMessage: 'Attention: A new version of the website was released. To leverage the latest features and improvements, please perform a page refresh.',
    description: 'Content for the update available modal',
  },
  updateAvailableModalRefreshButtonText: {
    id: 'enterprise.learner_portal.update_available_modal.refresh_button_text',
    defaultMessage: 'Refresh',
    description: 'Button text to refresh the page',
  },
});

type RouteError = Error;
type AsyncError = Error;

type UseRouteErrorResult = RouteError | undefined;
type UseAsyncErrorResult = AsyncError | undefined;

function useHandleRouteError() {
  const routeError = useRouteError() as UseRouteErrorResult;
  const [isAppUpdateAvailable, openAppUpdateAvailableModal] = useToggle(false);

  useEffect(() => {
    if (!routeError) {
      return;
    }
    if (routeError.name === 'ChunkLoadError') {
      logInfo(`[AppErrorBoundary] routeError (ChunkLoadError): ${routeError}`);
      openAppUpdateAvailableModal();
      return;
    }
    logError(`[AppErrorBoundary] routeError: ${routeError.message}`);
  }, [routeError, openAppUpdateAvailableModal]);

  return useMemo(() => ({
    error: routeError,
    isAppUpdateAvailable,
  }), [routeError, isAppUpdateAvailable]);
}

function useHandleAsyncError() {
  const asyncError = useAsyncError() as UseAsyncErrorResult;

  useEffect(() => {
    if (!asyncError) {
      return;
    }
    logError(`[AppErrorBoundary] asyncError: ${asyncError.message}`);
  }, [asyncError]);

  return asyncError;
}

function useHandleErrorsOrAppUpdate(sourceError: Error | null = null) {
  const {
    error: routeError,
    isAppUpdateAvailable,
  } = useHandleRouteError();
  const asyncError = useHandleAsyncError();

  const error = sourceError || routeError || asyncError;
  const errorMessageForDisplay = retrieveErrorMessageForDisplay(error);
  const errorStackForDisplay = retrieveErrorStackForDisplay(error);

  return useMemo(() => ({
    error,
    errorMessageForDisplay,
    errorStackForDisplay,
    isAppUpdateAvailable,
  }), [error, errorMessageForDisplay, errorStackForDisplay, isAppUpdateAvailable]);
}

const AppErrorBoundary = ({
  error = null,
  title = null,
  subtitle = null,
  includeHelmet = false,
  showSiteHeader = true,
  showSiteFooter = true,
}: AppErrorBoundaryProps) => {
  const intl = useIntl();
  const {
    errorMessageForDisplay,
    errorStackForDisplay,
    isAppUpdateAvailable,
  } = useHandleErrorsOrAppUpdate(error);
  const { authenticatedUser }: AppContextValue = useContext(AppContext);

  if (isAppUpdateAvailable) {
    return (
      <AlertModal
        title={intl.formatMessage(messages.updateAvailableModalHeading)}
        variant="danger"
        isOpen={isAppUpdateAvailable}
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
        isOverflowVisible={false}
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
      <p className="mb-4.5">
        <FormattedMessage {...messages.errorBody} />
      </p>
      <Button
        href={global.location.href}
        variant="primary"
      >
        <FormattedMessage {...messages.tryAgainCTA} />
      </Button>
      {errorMessageForDisplay && (
        <>
          <hr className="mt-5 mb-3" />
          <Collapsible
            styling="basic"
            className="small"
            title={intl.formatMessage(messages.viewErrorDetails)}
            defaultOpen={authenticatedUser.administrator}
          >
            <pre>{errorMessageForDisplay}</pre>
            {errorStackForDisplay && <pre>{errorStackForDisplay}</pre>}
          </Collapsible>
        </>
      )}
    </ErrorPage>
  );
};

AppErrorBoundary.propTypes = {
  error: PropTypes.instanceOf(Error),
  title: PropTypes.node,
  subtitle: PropTypes.node,
  includeHelmet: PropTypes.bool,
  showSiteHeader: PropTypes.bool,
  showSiteFooter: PropTypes.bool,
};

export default AppErrorBoundary;
