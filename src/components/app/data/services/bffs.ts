import type { AxiosResponse } from 'axios';
import { CamelCasedPropertiesDeep } from 'type-fest';
import { getConfig } from '@edx/frontend-platform/config';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';

type MakeBFFRequestArgs<TData = unknown> = {
  url: string;
  defaultResponse: CamelCasedPropertiesDeep<TData>;
  options: BFFRequestOptions;
};

type LogErrorsAndWarningsArgs<TData = unknown> = {
  url: string;
  response: TData;
};

export const baseLearnerBFFResponse: BFFResponse = {
  enterpriseCustomer: null,
  enterpriseFeatures: {},
  activeEnterpriseCustomer: null,
  allLinkedEnterpriseCustomerUsers: [],
  staffEnterpriseCustomer: null,
  shouldUpdateActiveEnterpriseCustomerUser: false,
  securedAlgoliaApiKey: null,
  catalogUuidsToCatalogQueryUuids: {},
  enterpriseCustomerUserSubsidies: {
    subscriptions: {
      customerAgreement: null,
      subscriptionLicenses: [],
      subscriptionLicensesByStatus: {
        activated: [],
        assigned: [],
        revoked: [],
      },
    },
  },
  errors: [],
  warnings: [],
};

export const learnerDashboardBFFResponse: DashboardBFFResponse = {
  ...baseLearnerBFFResponse,
  enterpriseCourseEnrollments: [],
  allEnrollmentsByStatus: {
    inProgress: [],
    upcoming: [],
    completed: [],
    savedForLater: [],
  },
};

export const learnerSearchBFFResponse: SearchBFFResponse = {
  ...baseLearnerBFFResponse,
};

export const learnerAcademyBFFResponse: AcademyBFFResponse = {
  ...baseLearnerBFFResponse,
};

export const learnerSkillsQuizBFFResponse: SkillsQuizBFFResponse = {
  ...baseLearnerBFFResponse,
};

/**
 * Log any errors and warnings from the BFF response.
 */
export function logErrorsAndWarningsFromBFFResponse<TData extends BFFResponse>({
  url,
  response,
}: LogErrorsAndWarningsArgs<TData>) {
  response.errors?.forEach((error) => {
    logError(`BFF Error (${url}): ${error.developerMessage}`);
  });
  response.warnings?.forEach((warning) => {
    logInfo(`BFF Warning (${url}): ${warning.developerMessage}`);
  });
}

/**
 * Make a request to the specified BFF API endpoint.
 *
 * @returns - The response from the BFF.
 */
export async function makeBFFRequest<TData extends BFFResponseRaw>({
  url,
  defaultResponse,
  options,
}: MakeBFFRequestArgs<TData>) {
  const { enterpriseSlug, ...optionsRest } = options;
  const snakeCaseOptionsRest = optionsRest ? snakeCaseObject(optionsRest) : {};

  try {
    const params = {
      enterprise_customer_slug: enterpriseSlug,
      ...snakeCaseOptionsRest,
    };
    type TDataWithCamelCase = CamelCasedPropertiesDeep<TData>;

    const result: AxiosResponse<TData> = await getAuthenticatedHttpClient()
      .post(url, params);
    const {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      catalog_uuids_to_catalog_query_uuids: catalogUuidsToCatalogQueryUuids,
      ...originalResponseData
    } = result.data;
    const response = {
      ...camelCaseObject(originalResponseData),
      catalogUuidsToCatalogQueryUuids,
    } as TDataWithCamelCase & {
      catalogUuidsToCatalogQueryUuids: Pick<TData, 'catalog_uuids_to_catalog_query_uuids'>
    };

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
export async function fetchEnterpriseLearnerDashboard(options: BFFRequestOptions) {
  return makeBFFRequest<DashboardBFFResponseRaw>({
    url: `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/learner/dashboard/`,
    defaultResponse: learnerDashboardBFFResponse,
    options,
  });
}

/**
 * Fetch the learner search BFF API for the specified enterprise customer.
 */
export async function fetchEnterpriseLearnerSearch(options: BFFRequestOptions) {
  return makeBFFRequest<SearchBFFResponseRaw>({
    url: `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/learner/search/`,
    defaultResponse: learnerSearchBFFResponse,
    options,
  });
}

/**
 * Fetch the learner academy BFF API for the specified enterprise customer.
 */
export async function fetchEnterpriseLearnerAcademy(options: BFFRequestOptions) {
  return makeBFFRequest<AcademyBFFResponseRaw>({
    url: `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/learner/academy/`,
    defaultResponse: learnerAcademyBFFResponse,
    options,
  });
}

/**
 * Fetch the learner skills quiz BFF API for the specified enterprise customer.
 */
export async function fetchEnterpriseLearnerSkillsQuiz(options: BFFRequestOptions) {
  return makeBFFRequest<SkillsQuizBFFResponseRaw>({
    url: `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/learner/skills-quiz/`,
    defaultResponse: learnerSkillsQuizBFFResponse,
    options,
  });
}
