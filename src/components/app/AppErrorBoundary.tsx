import {
  Component, ErrorInfo, ReactNode, Suspense,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { defineMessages, IntlShape, injectIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { ErrorPage } from '../error-page';
import RouterFallback from './routes/RouterFallback';

interface AppErrorBoundaryProps {
  children: ReactNode;
  intl: IntlShape;
  title?: string;
  subtitle?: string;
  includeHelmet?: boolean;
  showSiteHeader?: boolean;
  showSiteFooter?: boolean;
}
const defaultProps = {
  title: '',
  subtitle: '',
  includeHelmet: true,
  showSiteHeader: true,
  showSiteFooter: true,
} as const;

interface AppErrorBoundaryState {
  hasError: boolean;
  hasSuspenseError: boolean;
  error: Error | null;
}

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

function checkForSuspenseError(error: Error) {
  const isSuspenseError = ['suspended while rendering', 'no fallback UI was specified'].every(
    (str) => error.message.includes(str),
  );
  return isSuspenseError;
}

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps: Partial<AppErrorBoundaryProps>;

  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      hasSuspenseError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      hasSuspenseError: checkForSuspenseError(error),
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const isSuspenseError = checkForSuspenseError(error);
    if (isSuspenseError) {
      logError(
        '[AppErrorBoundary]: A component/hook suspended unexpectedly. Please verify that query data is pre-fetched via route loaders, where applicable.',
        {
          message: error.message,
          componentStack: errorInfo.componentStack,
        },
      );
    }
    logError(
      '[AppErrorBoundary]: A component/hook threw the following error.',
      {
        message: error.message,
        componentStack: errorInfo.componentStack,
      },
    );
  }

  render() {
    if (!this.state.hasError || !this.state.error) {
      // If there is no error, render the children.
      return this.props.children;
    }
    if (this.state.hasSuspenseError) {
      // If there is a suspense error, wrap the children in
      // a Suspense component with a fallback UI.
      return (
        <Suspense fallback={<RouterFallback />}>
          {this.props.children}
        </Suspense>
      );
    }

    // If there is a non-suspense error, render an error page.
    const {
      title,
      subtitle,
      includeHelmet,
      showSiteHeader,
      showSiteFooter,
      intl,
    } = this.props;
    return (
      <ErrorPage
        errorPageContentClassName="py-5 text-center"
        title={title || intl.formatMessage(messages.errorTitle)}
        subtitle={subtitle || intl.formatMessage(messages.errorSubtitle)}
        includeHelmet={includeHelmet}
        showSiteHeader={showSiteHeader}
        showSiteFooter={showSiteFooter}
      >
        <pre className="py-4">{this.state.error.message}</pre>
        <Button
          href={global.location.href}
          variant="primary"
        >
          {intl.formatMessage(messages.tryAgainCTA)}
        </Button>
      </ErrorPage>
    );
  }
}

AppErrorBoundary.defaultProps = defaultProps;

export default injectIntl(AppErrorBoundary);
