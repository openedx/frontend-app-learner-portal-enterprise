import { QueryClient } from '@tanstack/react-query';
import { LoaderFunction } from 'react-router-dom';
import { inferQueryKeyStore } from '@lukemorales/query-key-factory';
import { CamelCasedPropertiesDeep } from 'type-fest';

import {
  queries,
  queryEnterpriseLearnerAcademyBFF,
  queryEnterpriseLearnerDashboardBFF,
  queryEnterpriseLearnerSearchBFF,
  queryEnterpriseLearnerSkillsQuizBFF,
} from '../components/app/data';
import { SUBSIDY_REQUEST_STATE } from '../constants';
import * as enterpriseAccessOpenApi from './enterprise-access.openapi';
import * as enterpriseSubsidyOpenApi from './enterprise-subsidy.openapi';

declare global {
  // Query Key Factory
  type QueryKeys = inferQueryKeyStore<typeof queries>;

  // Routes

  type MakeRouteLoaderFunction = (queryClient?: QueryClient) => LoaderFunction;
  type MakeRouteLoaderFunctionWithQueryClient = (queryClient: QueryClient) => LoaderFunction;

  // Application Data (general)

  type AuthenticatedUser = {
    userId: string;
    username: string;
    roles: string[];
    administrator: boolean;
    extendedProfile?: Record<string, any>;
  };
  type AppContextValue = {
    authenticatedUser: AuthenticatedUser;
  };

  // Application Data (enterprise)

  type EnterpriseCustomerRaw = enterpriseAccessOpenApi.components['schemas']['EnterpriseCustomer'];
  type EnterpriseCustomer = CamelCasedPropertiesDeep<EnterpriseCustomerRaw>;

  type EnterpriseFeatures = {
    enterpriseLearnerBffEnabled?: boolean;
    catalogQuerySearchFiltersEnabled?: boolean;
  };

  type EnterpriseCustomerUserRaw = enterpriseAccessOpenApi.components['schemas']['EnterpriseCustomerUser'];
  type EnterpriseCustomerUser = CamelCasedPropertiesDeep<EnterpriseCustomerUserRaw>;

  type EnterpriseLearnerData = {
    enterpriseCustomer: EnterpriseCustomer | null;
    activeEnterpriseCustomer: EnterpriseCustomer | null;
    allLinkedEnterpriseCustomerUsers: EnterpriseCustomerUser[];
    staffEnterpriseCustomer: EnterpriseCustomer | null;
    enterpriseFeatures: EnterpriseFeatures;
    shouldUpdateActiveEnterpriseCustomerUser: boolean;
  };

  type SecuredAlgoliaApiData = {
    securedAlgoliaApiKey: string | null;
    catalogUuidsToCatalogQueryUuids: Record<string, string>;
  };

  type EnterpriseCourseEnrollmentRaw = enterpriseAccessOpenApi.components['schemas']['EnterpriseCourseEnrollment'];
  type EnterpriseCourseEnrollment = CamelCasedPropertiesDeep<EnterpriseCourseEnrollmentRaw>;

  // Application Data (subsidy)

  type SubsidyRequestState = typeof SUBSIDY_REQUEST_STATE[keyof typeof SUBSIDY_REQUEST_STATE];

  type SubsidyAccessPolicyRaw = enterpriseAccessOpenApi.components['schemas']['SubsidyAccessPolicyCreditsAvailableResponse'];
  type SubsidyAccessPolicy = CamelCasedPropertiesDeep<SubsidyAccessPolicyRaw>;

  type SubsidyTransactionRaw = enterpriseSubsidyOpenApi.components['schemas']['Transaction'];
  type SubsidyTransaction = CamelCasedPropertiesDeep<SubsidyTransactionRaw>;

  // BFFs

  type BFFRequestOptions = { enterpriseSlug: string; };

  type DashboardBFFResponseRaw = enterpriseAccessOpenApi.components['schemas']['LearnerDashboardResponse'];
  type SearchBFFResponseRaw = enterpriseAccessOpenApi.components['schemas']['LearnerSearchResponse'];
  type AcademyBFFResponseRaw = enterpriseAccessOpenApi.components['schemas']['LearnerAcademyResponse'];
  type SkillsQuizBFFResponseRaw = enterpriseAccessOpenApi.components['schemas']['LearnerSkillsQuizResponse'];

  type BFFResponseRaw = (
    DashboardBFFResponseRaw |
    SearchBFFResponseRaw |
    AcademyBFFResponseRaw |
    SkillsQuizBFFResponseRaw
  );

  type DashboardBFFResponse = CamelCasedPropertiesDeep<DashboardBFFResponseRaw>;
  type SearchBFFResponse = CamelCasedPropertiesDeep<SearchBFFResponseRaw>;
  type AcademyBFFResponse = CamelCasedPropertiesDeep<AcademyBFFResponseRaw>;
  type SkillsQuizBFFResponse = CamelCasedPropertiesDeep<SkillsQuizBFFResponseRaw>;

  type BFFResponse = (
    DashboardBFFResponse |
    SearchBFFResponse |
    AcademyBFFResponse |
    SkillsQuizBFFResponse
  );

  type BFFQuery = (
    typeof queryEnterpriseLearnerDashboardBFF |
    typeof queryEnterpriseLearnerSearchBFF |
    typeof queryEnterpriseLearnerAcademyBFF |
    typeof queryEnterpriseLearnerSkillsQuizBFF
  );
}

export {};
