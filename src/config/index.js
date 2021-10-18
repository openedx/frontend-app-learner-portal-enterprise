import qs from 'query-string';
import { FEATURE_ENROLL_WITH_CODES, FEATURE_ENABLE_PROGRAMS } from './constants';

const hasFeatureFlagEnabled = (featureFlag) => {
  const { features } = qs.parse(window.location.search);
  return features && features.split(',').includes(featureFlag);
};

const features = {
  ENROLL_WITH_CODES: process.env.FEATURE_ENROLL_WITH_CODES || hasFeatureFlagEnabled(FEATURE_ENROLL_WITH_CODES),
  ENABLE_PROGRAMS: (process.env.FEATURE_ENABLE_PROGRAMS === 'true') || hasFeatureFlagEnabled(FEATURE_ENABLE_PROGRAMS),
};

export { features };
