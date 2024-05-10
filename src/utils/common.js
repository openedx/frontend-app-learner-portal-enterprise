import Cookies from 'universal-cookie';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';
import dayjs from './dayjs';

export const isCourseEnded = endDate => dayjs(endDate) < dayjs();

export const createArrayFromValue = (value) => {
  const values = [];

  if (Array.isArray(value)) {
    return value;
  }

  values.push(value);
  return values;
};

export const isDefined = (value) => {
  const values = createArrayFromValue(value);
  return values.every(item => item !== undefined);
};

export const isNull = (value) => {
  const values = createArrayFromValue(value);
  return values.every(item => item === null);
};

export const isDefinedAndNotNull = (value) => {
  const values = createArrayFromValue(value);
  return values.every(item => isDefined(item) && !isNull(item));
};

export const isDefinedAndNull = (value) => {
  const values = createArrayFromValue(value);
  return values.every(item => isDefined(item) && isNull(item));
};

export const hasTruthyValue = (value) => {
  const values = createArrayFromValue(value);
  return values.every(item => !!item);
};

export const hasValidStartExpirationDates = ({
  startDate, expirationDate, endDate, subsidyExpirationDate,
}) => {
  const now = dayjs();
  // Subscriptions use "expirationDate" while Codes use "endDate"
  const realEndDate = expirationDate || endDate || subsidyExpirationDate;
  return now.isBetween(startDate, realEndDate);
};

export const loginRefresh = async () => {
  const config = getConfig();
  const loginRefreshUrl = `${config.LMS_BASE_URL}/login_refresh`;

  try {
    return await getAuthenticatedHttpClient().post(loginRefreshUrl);
  } catch (error) {
    const isUserUnauthenticated = error.response?.status === 401;
    if (isUserUnauthenticated) {
      // Clean up the cookie if it exists to eliminate any situation
      // where the cookie is not expired but the jwt is expired.
      const cookies = new Cookies();
      cookies.remove(config.ACCESS_TOKEN_COOKIE_NAME);
    }
    return Promise.resolve();
  }
};

export const fixedEncodeURIComponent = (str) => encodeURIComponent(str).replace(/[!()*]/g, (c) => `%${ c.charCodeAt(0).toString(16)}`);

export const formatStringAsNumber = (str, radix = 10) => {
  // converts a string into a number and format it with separated commas
  const num = parseInt(str, radix);
  return num.toLocaleString();
};

export const getPrimaryPartnerLogo = (partnerDetails) => {
  if (!partnerDetails.primaryPartner || !partnerDetails.showPartnerLogo) {
    return undefined;
  }
  return {
    src: partnerDetails.primaryPartner.logoImageUrl,
    alt: partnerDetails.primaryPartner.name,
  };
};

export const getContactEmail = (config) => {
  const adminEmails = config.adminUsers.map(user => user.email);
  if (config.contactEmail) { return config.contactEmail; }
  if (adminEmails.length >= 1) { return adminEmails; }
  return null;
};

/**
 * Given an error, returns the status code from the custom attributes (Axios error)
 * or the standard JS error response.
 * @param {Error} error An error object
 * @returns {number} The status code (e.g., 404)
 */
export function getErrorResponseStatusCode(error) {
  return error.customAttributes?.httpErrorStatus || error.response?.status;
}

/**
 * Logs a react-query query error message on failure, if present.
 * @param {Error} error An error object
 * @param {Query} query The query object
 * @returns {void}
 */
export function queryCacheOnErrorHandler(error, query) {
  if (query.meta?.errorMessage) {
    logError(query.meta?.errorMessage);
  }
}

/**
 * Determines whether a React Query query should be retried on failure.
 *
 * @param {number} failureCount The number of times the query has failed
 * @param {Error} error The error that caused the query to fail
 * @returns {boolean} Whether the query should be retried
 */
export function defaultQueryClientRetryHandler(failureCount, error) {
  if (failureCount >= 3 || getErrorResponseStatusCode(error) === 404) {
    return false;
  }
  return true;
}

/**
 * Given a CSS variable name, returns the computed value of the CSS variable.
 * @param {string} cssVariableName A string representing a CSS variable.
 * @returns {string} The computed value of the CSS variable.
 */
export function getComputedStylePropertyCSSVariable(cssVariableName) {
  return getComputedStyle(document.documentElement).getPropertyValue(cssVariableName);
}

/**
 * Returns the brand colors from the CSS variables.
 * @returns {Object} The brand colors from the CSS variables.
 */
export function getBrandColorsFromCSSVariables() {
  return {
    primary: getComputedStylePropertyCSSVariable('--pgn-color-primary'),
    info100: getComputedStylePropertyCSSVariable('--pgn-color-info-100'),
    info500: getComputedStylePropertyCSSVariable('--pgn-color-info-500'),
    white: getComputedStylePropertyCSSVariable('--pgn-color-white'),
    dark: getComputedStylePropertyCSSVariable('--pgn-color-dark'),
  };
}
