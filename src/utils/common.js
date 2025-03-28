import { logError } from '@edx/frontend-platform/logging';
import dayjs from './dayjs';
import { COURSE_STATUSES } from '../constants';

export const isCourseEnded = endDate => dayjs(endDate).isBefore(dayjs());

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

export const sumOfArray = (values) => (values.every(item => typeof item === 'number' && !Number.isNaN(item))
  ? values.reduce((prev, next) => prev + next, 0)
  : null);

export const hasValidStartExpirationDates = ({ startDate, expirationDate, endDate }) => {
  const now = dayjs();
  // Subscriptions use "expirationDate" while Codes use "endDate"
  const realEndDate = expirationDate || endDate;
  return now.isBetween(startDate, realEndDate);
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

/**
 * Helper function utilizing dayjs's 'isBetween' function to determine
 * if the date passed is between today and an offset amount of days
 *
 * @param date
 * @param days
 * @returns {boolean}
 */
export function isTodayWithinDateThreshold({ date, days }) {
  const dateToCheck = dayjs(date);
  const today = dayjs();
  const offsetDays = dateToCheck.subtract(days, 'days');
  return today.isBetween(offsetDays, dateToCheck);
}

export function isTodayBetweenDates({ startDate, endDate }) {
  const today = dayjs();
  const formattedStartDate = dayjs(startDate);
  const formattedEndDate = dayjs(endDate);
  return today.isBetween(formattedStartDate, formattedEndDate);
}

/**
 * Returns a formatted date in the following format:
 *
 * Passed Date: 2024-07-18T16:00:00Z
 *
 * Formatted Date: July 18, 2024
 *
 * The following parameters can be overridden to modify the date:
 *  - year
 *  - month
 *  - day
 *
 *  See {@link https://formatjs.io/docs/react-intl/api/#formatdate} for information
 * @param intl
 * @param timestamp
 * @param formatOpts
 * @returns {String}
 */
export function i18nFormatTimestamp({ intl, timestamp, formatOpts = {} }) {
  return intl.formatDate(timestamp, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...formatOpts,
  });
}

export const formatPrice = (price, options = {}) => {
  const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
  return USDollar.format(Math.abs(price));
};

export function findCourseStatusKey(statusValue) {
  for (const key in COURSE_STATUSES) {
    if (COURSE_STATUSES[key] === statusValue) {
      return key;
    }
  }
  return undefined;
}
