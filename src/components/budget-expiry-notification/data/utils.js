import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {
  SEEN_ENTERPRISE_EXPIRATION_ALERT_COOKIE_PREFIX,
  SEEN_ENTERPRISE_EXPIRATION_MODAL_COOKIE_PREFIX,
} from './constants';

dayjs.extend(duration);

export const getEnterpriseBudgetExpiringModalCookieName = ({
  expirationThreshold, enterpriseId,
}) => `${SEEN_ENTERPRISE_EXPIRATION_MODAL_COOKIE_PREFIX}${expirationThreshold}-${enterpriseId}`;

export const getEnterpriseBudgetExpiringAlertCookieName = ({
  expirationThreshold, enterpriseId,
}) => `${SEEN_ENTERPRISE_EXPIRATION_ALERT_COOKIE_PREFIX}${expirationThreshold}-${enterpriseId}`;
