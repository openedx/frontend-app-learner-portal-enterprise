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

export const hasValidStartExpirationDates = ({ startDate, expirationDate, endDate }) => {
  const now = dayjs();
  // Subscriptions use "expirationDate" while Codes use "endDate"
  const realEndDate = expirationDate || endDate;
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

export const fetchAlgoliaSecuredApiKey = async () => {
  const config = getConfig();
  const httpClient = getAuthenticatedHttpClient();

  try {
    const response = await httpClient.get(config.ALGOLIA_SECURED_KEY_ENDPOINT);
    if (response && response.data) {
      return response.data.key;
    }
    throw new Error('Response does not contain data');
  } catch (error) {
    logError(error);
    return null;
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
