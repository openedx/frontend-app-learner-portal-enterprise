/* eslint-disable import/prefer-default-export */
import { LICENSE_STATUS } from './constants';
import {
  isDefinedAndNotNull,
  hasValidStartExpirationDates,
} from '../../../utils/common';

export const hasValidSubscription = (plan, license) => (
  isDefinedAndNotNull(plan)
  && hasValidStartExpirationDates(plan)
  && isDefinedAndNotNull(license)
  && license.status === LICENSE_STATUS.ACTIVATED
);
