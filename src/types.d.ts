import { queries } from './components/app/data';
import { SUBSIDY_REQUEST_STATE } from './constants';

declare global {
  // React Query
  type UseQueryResult = import('@tanstack/react-query').UseQueryResult;
  type UseQueryOptions = import('@tanstack/react-query').UseQueryOptions;
  type QueryObserverOptions = import('@tanstack/react-query').QueryObserverOptions;
  type QueryClient = import('@tanstack/react-query').QueryClient;
  type QueryObserverResult = import('@tanstack/react-query').QueryObserverResult;
  type Query = import('@tanstack/react-query').Query;
  type QueryOptions = import('@tanstack/react-query').QueryOptions;

  // Query Key Factory
  type QueryKeys = import('@lukemorales/query-key-factory').inferQueryKeyStore<typeof queries>;

  // Routes
  type RouteParams<Key extends string = string> = import('react-router-dom').Params<Key>;
  type RouteLoaderFunction = import('react-router-dom').LoaderFunction;
  type RouteLoaderFunctionArgs = import('react-router-dom').LoaderFunctionArgs;
  type MakeRouteLoaderFunction = (queryClient?: QueryClient) => RouteLoaderFunction;
  type MakeRouteLoaderFunctionWithQueryClient = (queryClient: QueryClient) => RouteLoaderFunction;
  type RouteObject = import('react-router-dom').RouteObject;
  type Router = import('@remix-run/router').Router;

  // Application Data (general)
  interface AuthenticatedUser {
    userId: string;
    username: string;
    roles: string[];
    administrator: boolean;
    extendedProfile?: Record<string, any>;
  }
  interface AppContextValue {
    authenticatedUser: AuthenticatedUser;
  }

  // Config data
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

  interface BFFRequestAdditionalOptions {
    [key: string]: any; // Allow any additional properties
  }

  type BFFRequestOptions = { enterpriseSlug: string; } & BFFRequestAdditionalOptions;

  interface EnterpriseCustomer {
    uuid: string;
    slug: string;
    name: string;
    enableOneAcademy: boolean;
  }

  interface EnterpriseFeatures {
    enterpriseLearnerBffEnabled?: boolean;
    catalogQuerySearchFiltersEnabled?: boolean;
    [key: string]: boolean;
  }

  interface EnterpriseCustomerUser {
    id: number,
    enterpriseCustomer: EnterpriseCustomer,
    active: boolean,
  }

  interface EnterpriseLearnerData {
    enterpriseCustomer: EnterpriseCustomer | null;
    activeEnterpriseCustomer: EnterpriseCustomer | null;
    allLinkedEnterpriseCustomerUsers: EnterpriseCustomerUser[];
    staffEnterpriseCustomer: EnterpriseCustomer | null;
    enterpriseFeatures: EnterpriseFeatures;
    shouldUpdateActiveEnterpriseCustomerUser: boolean;
  }

  interface SecuredAlgoliaApiData {
    securedAlgoliaApiKey: string | null;
    catalogUuidsToCatalogQueryUuids: Record<string, string>;
  }

  interface EnrollmentDueDate {
    name: string;
    date: string;
    url: string;
  }

  interface EnterpriseCourseEnrollment {
    course_run_id: string;
    course_key: string;
    course_type: string;
    org_name: string;
    course_run_status: string;
    display_name: string;
    emails_enabled?: boolean;
    certificate_download_url?: string;
    created: string;
    start_date?: string;
    end_date?: string;
    mode: string;
    is_enrollment_active: boolean;
    product_source: string;
    enroll_by?: string;
    pacing: boolean;
    course_run_url: string;
    resume_course_run_url?: string;
    is_revoked: boolean;
    due_dates: EnrollmentDueDate[];
  }

  // Application Data (subsidy)
  type SubsidyRequestState = typeof SUBSIDY_REQUEST_STATE[keyof typeof SUBSIDY_REQUEST_STATE];
}

export {};
