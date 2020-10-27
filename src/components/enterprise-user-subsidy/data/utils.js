/* eslint-disable import/prefer-default-export */
import { LICENSE_STATUS } from './constants';
import {
  isDefinedAndNotNull,
  isNull,
  hasValidStartExpirationDates,
} from '../../../utils/common';

export const hasValidSubscription = (plan, license) => (hasValidStartExpirationDates(plan) && !isNull(license)
    && isDefinedAndNotNull(license) && license.status === LICENSE_STATUS.ACTIVATED);
