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

  type Paginated<ResultItem> = {
    next: string?,
    previous: string?,
    count: number,
    results: ResultItem[],
  };

  type PaginatedCurrentPage<ResultItem> = Paginated<ResultItem> & {
    currentPage: number,
    start: number,
  };

  type AuthenticatedUser = {
    userId: number;
    username: string;
    email: string;
    roles: string[];
    administrator: boolean;
    extendedProfile?: Record<string, any>;
  };
  type AppContextValue = {
    authenticatedUser: AuthenticatedUser;
  };

  type CourseRunMetadata = {
    key: string;
  };

  type CourseMetadata = {
    key: string;
    courseType: string;
    courseRuns: CourseRunMetadata[];
  };

  type CourseMetadataWithAvailableRuns = CourseMetadata & {
    availableCourseRuns: CourseRunMetadata[];
  };

  // Application Date (config)

  type AlgoliaConfiguration = {
    ALGOLIA_APP_ID: string | null;
    ALGOLIA_SEARCH_API_KEY: string | null;
    ALGOLIA_INDEX_NAME: string | null;
    ALGOLIA_INDEX_NAME_JOBS: string | null;
    ALGOLIA_REPLICA_INDEX_NAME: string | null;
  };

  type ServiceUrls = {
    ENTERPRISE_ACCESS_BASE_URL: string | null;
    ENTERPRISE_CATALOG_API_BASE_URL: string | null;
    LICENSE_MANAGER_URL: string | null;
    ENTERPRISE_SUBSIDY_BASE_URL: string | null;
  };

  type ExternalUrls = {
    GETSMARTER_STUDENT_TC_URL: string | null;
    GETSMARTER_PRIVACY_POLICY_URL: string | null;
    GETSMARTER_LEARNER_DASHBOARD_URL: string | null;
  };

  type SupportUrls = {
    LEARNER_SUPPORT_URL: string | null;
    LEARNER_SUPPORT_SPEND_ENROLLMENT_LIMITS_URL: string | null;
    LEARNER_SUPPORT_ABOUT_DEACTIVATION_URL: string | null;
    LEARNER_SUPPORT_PACED_COURSE_MODE_URL: string | null;
  };

  type MaintenanceConfiguration = {
    IS_MAINTENANCE_ALERT_ENABLED: boolean;
    MAINTENANCE_ALERT_MESSAGE: string | null;
    MAINTENANCE_ALERT_START_TIMESTAMP: string | null;
    MAINTENANCE_ALERT_END_TIMESTAMP: string | null;
  };

  type FeatureFlagConfiguration = {
    ENABLE_SKILLS_QUIZ: boolean;
    ENABLE_NOTICES: boolean;
    FEATURE_CONTENT_HIGHLIGHTS: boolean;
    FEATURE_ENABLE_EMET_REDEMPTION: boolean;
    FEATURE_ENABLE_RESTRICTED_RUNS: boolean;
  };

  type CookieConfiguration = {
    INTEGRATION_WARNING_DISMISSED_COOKIE_NAME: string | null;
  };

  type OptimizelyConfiguration = {
    EXPERIMENT_2_ID: string | null;
    EXPERIMENT_2_VARIANT_2_ID: string | null;
  };

  interface Configuration extends
    AlgoliaConfiguration,
    ServiceUrls,
    ExternalUrls,
    SupportUrls,
    MaintenanceConfiguration,
    FeatureFlagConfiguration,
    CookieConfiguration,
    OptimizelyConfiguration {}

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

  type CreditsAvailableResponseRaw = SubsidyAccessPolicyRaw[];
  type CreditsAvailableResponse = CamelCasedPropertiesDeep<CreditsAvailableResponseRaw>;

  type SubsidyTransactionRaw = enterpriseSubsidyOpenApi.components['schemas']['Transaction'];
  type SubsidyTransaction = CamelCasedPropertiesDeep<SubsidyTransactionRaw>;

  type CanRedeemResponseRaw = enterpriseAccessOpenApi.components['schemas']['SubsidyAccessPolicyCanRedeemElementResponse'][];
  type CanRedeemResponse = CamelCasedPropertiesDeep<CanRedeemResponseRaw>;

  type LearnerContentAssignmentRaw = enterpriseAccessOpenApi.components['schemas']['LearnerContentAssignmentWithLearnerAcknowledgedResponse'];
  type LearnerContentAssignment = CamelCasedPropertiesDeep<LearnerContentAssignmentRaw>;

  type CouponCodeAssignmentRaw = {
    coupon_start_date: string;
    coupon_end_date: string;
  };
  type CouponOverviewRaw = {};
  type CouponCodes = {
    couponsOverview: CamelCasedPropertiesDeep<CouponOverviewRaw[]>;
    couponCodeAssignments: CamelCasedPropertiesDeep<CouponCodeAssignmentRaw[]>;
    couponCodeRedemptionCount: number;
  };

  type BrowseAndRequestConfigurationResponseRaw = enterpriseAccessOpenApi.components['schemas']['SubsidyRequestCustomerConfiguration'];
  type BrowseAndRequestConfigurationResponse = CamelCasedPropertiesDeep<BrowseAndRequestConfigurationResponseRaw>;

  type LicenseRequestsResponseRaw = enterpriseAccessOpenApi.components['schemas']['PaginatedLicenseRequestList'];
  type LicenseRequestsResponse = CamelCasedPropertiesDeep<LicenseRequestsResponseRaw>;
  type LicenseRequestRaw = enterpriseAccessOpenApi.components['schemas']['LicenseRequest'];
  type LicenseRequest = CamelCasedPropertiesDeep<LicenseRequestRaw>;

  type CouponCodeRequestsResponseRaw = enterpriseAccessOpenApi.components['schemas']['PaginatedCouponCodeRequestList'];
  type CouponCodeRequestsResponse = CamelCasedPropertiesDeep<CouponCodeRequestsResponseRaw>;
  type CouponCodeRequestRaw = enterpriseAccessOpenApi.components['schemas']['CouponCodeRequest'];
  type CouponCodeRequest = CamelCasedPropertiesDeep<CouponCodeRequestRaw>;

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

  type BFFQueryDashboard = typeof queryEnterpriseLearnerDashboardBFF;
  type BFFQuerySearch = typeof queryEnterpriseLearnerSearchBFF;
  type BFFQueryAcademy = typeof queryEnterpriseLearnerAcademyBFF;
  type BFFQuerySkillsQuiz = typeof queryEnterpriseLearnerSkillsQuizBFF;

  type BFFQuery = (
    BFFQueryDashboard |
    BFFQuerySearch |
    BFFQueryAcademy |
    BFFQuerySkillsQuiz
  );
}

export {};
