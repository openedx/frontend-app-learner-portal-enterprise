import qs from 'query-string';
import { FEATURE_ENROLL_WITH_CODES, FEATURE_SKILLS_FILTER } from './constants';

const hasFeatureFlagEnabled = (featureFlag) => {
  const { features } = qs.parse(window.location.search);
  return features && features.split(',').includes(featureFlag);
};

const features = {
  ENROLL_WITH_CODES: process.env.FEATURE_ENROLL_WITH_CODES || hasFeatureFlagEnabled(FEATURE_ENROLL_WITH_CODES),
  SKILLS_FILTER: process.env.FEATURE_SKILLS_FILTER || hasFeatureFlagEnabled(FEATURE_SKILLS_FILTER),
};

export { features };
