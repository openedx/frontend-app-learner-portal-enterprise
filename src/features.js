/**
 * This files adds support for enabling feature-specific code through
 * a `features` query parameter that allows the following:
 *   - work in smaller increments on a single feature, without exposing
 *     released code of said feature to users prematurely.
 *   - enable testing & dark launch of full feature on stage/production before
 *     released to users.
 *
 * To use features:
 *   1. Choose a name for the feature (e.g., "move_to_completed").
 *   2. In the code where you want to do something when a feature
 *      flag is truthy, use the function `isFeatureEnabled`, passing in
 *      the chosen name. Example: `isFeatureEnabled('move_to_completed')`.
 *   3. To see it in action, specify `?features=FEATURE_NAME` in the URL and refresh
 *      the page. Example: `?features=move_to_completed`.
 *   4. To enable multiple feature flags at once, use a comma-separated list of features
 *      in the query parameter. Example: `?features=move_to_completed,enterprise_offers`.
 */

import qs from 'query-string';

export const getFeaturesFromQueryParams = () => {
  const params = qs.parse(global.location.search);
  if (!params || typeof params !== 'object') {
    return null;
  }
  return params.features;
};

export const isFeatureEnabled = (feature) => {
  const features = getFeaturesFromQueryParams();
  return !!(features && features.indexOf(feature) !== -1);
};
