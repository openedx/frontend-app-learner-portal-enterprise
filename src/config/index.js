import qs from 'query-string';
import {
  FEATURE_ENROLL_WITH_CODES,
  FEATURE_ENABLE_PROGRAMS,
  FEATURE_PROGRAM_TYPE_FACET,
  FEATURE_ENABLE_AUTO_APPLIED_LICENSES,
  FEATURE_BROWSE_AND_REQUEST,
} from './constants';

const hasFeatureFlagEnabled = (featureFlag) => {
  const { features } = qs.parse(window.location.search);
  return features && features.split(',').includes(featureFlag);
};

const features = {
  ENABLE_AUTO_APPLIED_LICENSES: (
    process.env.ENABLE_AUTO_APPLIED_LICENSES || hasFeatureFlagEnabled(FEATURE_ENABLE_AUTO_APPLIED_LICENSES)
  ),
  ENROLL_WITH_CODES: process.env.FEATURE_BROWSE_AND_REQUEST || hasFeatureFlagEnabled(FEATURE_ENROLL_WITH_CODES),
  ENABLE_PROGRAMS: (process.env.FEATURE_ENABLE_PROGRAMS === 'true') || hasFeatureFlagEnabled(FEATURE_ENABLE_PROGRAMS),
  PROGRAM_TYPE_FACET: (process.env.FEATURE_PROGRAM_TYPE_FACET === 'true') || hasFeatureFlagEnabled(FEATURE_PROGRAM_TYPE_FACET),
  FEATURE_BROWSE_AND_REQUEST: process.env.FEATURE_BROWSE_AND_REQUEST  || hasFeatureFlagEnabled(FEATURE_BROWSE_AND_REQUEST),
};

export { features };
