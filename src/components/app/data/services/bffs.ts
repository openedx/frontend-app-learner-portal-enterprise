import { getConfig } from '@edx/frontend-platform/config';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';
import _cloneDeep from 'lodash.clonedeep';
import camelCase from 'lodash.camelcase';
import isPlainObject from 'lodash.isplainobject';
import { isObjEmpty } from '../utils';

export const baseLearnerBFFResponse = {
  enterpriseCustomerUserSubsidies: {
    subscriptions: {
      customerAgreement: {},
      subscriptionLicenses: [],
      subscriptionLicensesByStatus: {},
    },
  },
  errors: [],
  warnings: [],
};

export const learnerDashboardBFFResponse = {
  ...baseLearnerBFFResponse,
  enterpriseCourseEnrollments: [],
  allEnrollmentsByStatus: {
    inProgress: [],
    upcoming: [],
    completed: [],
    savedForLater: [],
  },
};

export const learnerSearchBFFResponse = {
  ...baseLearnerBFFResponse,
};

export const learnerAcademyBFFResponse = {
  ...baseLearnerBFFResponse,
};

export const learnerSkillsQuizBFFResponse = {
  ...baseLearnerBFFResponse,
};

/**
 * Log any errors and warnings from the BFF response.
 * @param {Object} args
 * @param {String} args.url - The URL of the BFF API endpoint.
 * @param {Object} args.response - The camelCased response from the BFF API endpoint.
 */
export function logErrorsAndWarningsFromBFFResponse({ url, response }) {
  response.errors.forEach((error) => {
    logError(`BFF Error (${url}): ${error.developerMessage}`);
  });
  response.warnings.forEach((warning) => {
    logInfo(`BFF Warning (${url}): ${warning.developerMessage}`);
  });
}

/**
 * Extracts and deep clones a set of specified keys from a structured API response object.
 *
 * This is useful for preserving specific metadata fields (like UUID mappings or subsidy info)
 * before applying transformations (e.g., camelCasing the rest of the response).
 *
 * The function:
 * - Deduplicates keys before processing
 * - Deep clones the selected values to avoid mutation side-effects
 * - Silently skips keys not found in the source `data` object
 *
 * @template T - The shape of the incoming `data` object (usually from an API response)
 *
 * @param {string[]} keys - Top-level keys in `data` that should be preserved as raw copies
 * @param {T} [data={}] - The source object from which to extract and clone values
 * @returns {Record<string, any>} An object containing deep-cloned values for the requested keys
 */
export function preserveRawMetadata<T extends object>(
  keys: (keyof T)[],
  data: T = {} as T,
): Partial<T> {
  if (!isPlainObject(data)) { return {}; }
  return [...new Set(keys)].reduce((acc, key) => {
    if (key in data) {
      acc[key] = _cloneDeep(data[key]);
    }
    return acc;
  }, {} as Partial<T>);
}

/**
 * Make a request to the specified BFF API endpoint.
 * @param {Object} args
 * @param {String} args.url - The URL of the BFF API endpoint.
 * @param {Object} args.defaultResponse - The default response to return if unable to resolve the request.
 * @param {Object} args.options - The options to pass to the BFF API endpoint.
 * @param {String} [args.options.enterpriseId] - The UUID of the enterprise customer.
 * @param {String} [args.options.enterpriseSlug] - The slug of the enterprise customer.
 * @returns {Promise<Object>} - The response from the BFF.
 */
export async function makeBFFRequest<T extends object>({
  url,
  defaultResponse,
  options = {} as BFFRequestOptions,
}: {
  url: string;
  defaultResponse: T;
  options?: BFFRequestOptions;
}): Promise<T> {
  const { enterpriseId, enterpriseSlug, ...optionsRest } = options;
  const snakeCaseOptionsRest = optionsRest ? snakeCaseObject(optionsRest) : {};

  // If neither enterpriseId nor enterpriseSlug is provided, return the default response.
  if (!enterpriseId && !enterpriseSlug) {
    logError('Enterprise ID or slug is required to make a BFF request.');
    return defaultResponse;
  }

  try {
    const params = {
      enterprise_customer_uuid: enterpriseId,
      enterprise_customer_slug: enterpriseSlug,
      ...snakeCaseOptionsRest,
    };

    // Make request to BFF.
    const result = await getAuthenticatedHttpClient().post(url, params);
    // Pull out raw values before camelCasing
    const preservedRawMetadata = preserveRawMetadata<typeof defaultResponse>(
      ['catalog_uuids_to_catalog_query_uuids'] as (keyof typeof defaultResponse)[],
      result.data,
    );
    const response = camelCaseObject(result.data);

    // Deep-cloned raw metadata is reapplied only to existing keys in the camelCased response object
    if (!isObjEmpty(preservedRawMetadata)) {
      for (const [key, value] of Object.entries(preservedRawMetadata)) {
        const camelCasedKey = camelCase(key);
        if (camelCasedKey in response) {
          response[camelCasedKey] = value;
        }
      }
    }

    // Log any errors and warnings from the BFF response.
    logErrorsAndWarningsFromBFFResponse({ url, response });

    // Return the response from the BFF.
    return response;
  } catch (error) {
    logError(error);
    return defaultResponse;
  }
}

/**
 * Fetch the learner dashboard BFF API for the specified enterprise customer.
 */
export async function fetchEnterpriseLearnerDashboard({ enterpriseSlug }: BFFRequestOptions) {
  const options = { enterpriseSlug } as BFFRequestOptions;
  return makeBFFRequest({
    url: `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/learner/dashboard/`,
    defaultResponse: learnerDashboardBFFResponse,
    options,
  });
}

/**
 * Fetch the learner search BFF API for the specified enterprise customer.
 */
export async function fetchEnterpriseLearnerSearch({ enterpriseSlug }: BFFRequestOptions) {
  const options = { enterpriseSlug } as BFFRequestOptions;
  return makeBFFRequest({
    url: `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/learner/search/`,
    defaultResponse: learnerSearchBFFResponse,
    options,
  });
}

/**
 * Fetch the learner academy BFF API for the specified enterprise customer.
 */
export async function fetchEnterpriseLearnerAcademy({ enterpriseSlug }: BFFRequestOptions) {
  const options = { enterpriseSlug } as BFFRequestOptions;
  return makeBFFRequest({
    url: `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/learner/academy/`,
    defaultResponse: learnerAcademyBFFResponse,
    options,
  });
}

/**
 * Fetch the learner skills quiz BFF API for the specified enterprise customer.
 */
export async function fetchEnterpriseLearnerSkillsQuiz({ enterpriseSlug }: BFFRequestOptions) {
  const options = { enterpriseSlug } as BFFRequestOptions;
  return makeBFFRequest({
    url: `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/learner/skills-quiz/`,
    defaultResponse: learnerSkillsQuizBFFResponse,
    options,
  });
}
