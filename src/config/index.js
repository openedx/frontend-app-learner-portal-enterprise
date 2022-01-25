import { hasFeatureFlagEnabled } from '@edx/frontend-enterprise-utils';

import {
  FEATURE_ENROLL_WITH_CODES,
  FEATURE_ENABLE_PROGRAMS,
  FEATURE_PROGRAM_TYPE_FACET,
  FEATURE_ENABLE_AUTO_APPLIED_LICENSES,
} from './constants';

const features = {
  ENABLE_AUTO_APPLIED_LICENSES: (
    process.env.ENABLE_AUTO_APPLIED_LICENSES || hasFeatureFlagEnabled(FEATURE_ENABLE_AUTO_APPLIED_LICENSES)
  ),
  ENROLL_WITH_CODES: process.env.FEATURE_ENROLL_WITH_CODES || hasFeatureFlagEnabled(FEATURE_ENROLL_WITH_CODES),
  ENABLE_PROGRAMS: process.env.FEATURE_ENABLE_PROGRAMS || hasFeatureFlagEnabled(FEATURE_ENABLE_PROGRAMS),
  PROGRAM_TYPE_FACET: process.env.FEATURE_PROGRAM_TYPE_FACET || hasFeatureFlagEnabled(FEATURE_PROGRAM_TYPE_FACET),
};

export { features };
