import Cookies from 'universal-cookie';
import { isWithinInterval, parseISO, isBefore } from 'date-fns';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export const isCourseEnded = endDate => isBefore(parseISO(endDate), new Date());

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

export const hasValidStartExpirationDates = ({ startDate, expirationDate, endDate }) => {
  const now = new Date();
  // Subscriptions use "expirationDate" while Codes use "endDate"
  const actualEndDate = expirationDate || endDate;
  return isWithinInterval(now, { start: parseISO(startDate), end: parseISO(actualEndDate) });
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
