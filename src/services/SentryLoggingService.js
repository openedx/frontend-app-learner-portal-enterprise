import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { subscribe } from '@edx/frontend-platform';
import { AUTHENTICATED_USER_CHANGED, getAuthenticatedUser } from '@edx/frontend-platform/auth';

function sendMessage(message, customAttributes) {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, customAttributes); // eslint-disable-line
  }

  Sentry.captureMessage(message, customAttributes);
}

function printBySeverity(error, customAttributes, severityLevel) {
  switch (severityLevel) {
    case Sentry.Severity.Info:
      console.info(error, customAttributes); // eslint-disable-line
      return;
    case Sentry.Severity.Warning:
      console.warn(error, customAttributes); // eslint-disable-line
      return;
    case Sentry.Severity.Error:
    case Sentry.Severity.Critical:
    case Sentry.Severity.Fatal:
      console.error(error, customAttributes); // eslint-disable-line 
      return;
    default:
      console.log(error, customAttributes); // eslint-disable-line
  }
}

function sendException(error, customAttributes, severityLevel = Sentry.Severity.Error) {
  if (process.env.NODE_ENV === 'development') {
    printBySeverity(error, customAttributes, severityLevel);
  }

  Sentry.withScope(scope => {
    scope.setLevel(severityLevel);
    scope.setExtra(customAttributes);

    Sentry.captureException(error);
  });
}

function getAuthUserForSentry() {
  const { userId, username } = getAuthenticatedUser();

  return { id: userId, username };
}

export default class SentryLoggingService {
  constructor(options) {
    const {
      SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_PROJECT_PREFIX, IGNORED_ERROR_REGEX,
    } = options?.config || {};

    Sentry.init({
      dsn: SENTRY_DSN,
      environment: [SENTRY_PROJECT_PREFIX, SENTRY_ENVIRONMENT].filter(value => Boolean(value)).join('_'),
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
    });

    subscribe(AUTHENTICATED_USER_CHANGED, () => {
      Sentry.setUser(getAuthUserForSentry());
    });
    /*
      String which is an explicit error message regex. If an error message matches the regex, the error
      is considered an *ignored* error and submitted to Sentry as a page action - not an error.

      Ignored error regexes are configured per frontend application (MFE).

      The regex for all ignored errors are represented in the .env files as a single string. If you need to
      ignore multiple errors, use the standard `|` regex syntax.

      For example, here's a .env line which ignores two specific errors:

      IGNORED_ERROR_REGEX='^\\[frontend-auth\\] Unimportant Error|Specific non-critical error #[\\d]+'

      This example would ignore errors with the following messages:

      [frontend-app-generic] - Specific non-critical error #45678 happened.
      [frontend-app-generic] - Specific non-critical error #93475 happened.
      [frontend-auth] Unimportant Error: Browser strangeness occurred.

      To test your regex additions, use a JS CLI environment (such as node) and run code like this:

      x = new RegExp('^\\[frontend-auth\\] Unimportant Error|Specific non-critical error #[\\d]+');
      '[frontend-app-generic] - Specific non-critical error #45678 happened.'.match(x);
      '[frontend-auth] Unimportant Error: Browser strangeness occurred.'.match(x);
      'This error should not match anything!'.match(x);

      For edx.org, add new error message regexes in edx-internal YAML as needed.
    */
    this.ignoredErrorRegexes = IGNORED_ERROR_REGEX;
  }

  logInfo(infoStringOrErrorObject, customAttributes = {}) {
    const message = infoStringOrErrorObject;
    if (typeof infoStringOrErrorObject === 'object') {
      sendException(infoStringOrErrorObject, customAttributes, Sentry.Severity.Info);
      return;
    }
    sendMessage(message, customAttributes);
  }

  logError(errorStringOrObject, customAttributes = {}) {
    const error = typeof errorStringOrObject === 'string' ? new Error(errorStringOrObject) : errorStringOrObject;

    const isIgnored = this.ignoredErrorRegexes && error.message.match(this.ignoredErrorRegexes);
    const severityLevel = isIgnored ? Sentry.Severity.Warning : Sentry.Severity.Error;

    sendException(error, customAttributes, severityLevel);
  }
}
