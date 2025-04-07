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
  type QueryOptionsStruct = import('@lukemorales/query-key-factory').QueryOptionsStruct<
    typeof queries,
    QueryClient
  >;

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

  type SubsidyAccessPolicy = {
    uuid: string;
    policyRedemptionUrl: string;
  };

  type SubsidyTransactionState = 'created' | 'pending' | 'committed' | 'failed';

  interface SubsidyTransaction {
    uuid: string;
    state: SubsidyTransactionState;
    lmsUserId: number;
    lmsUserEmail?: string;
    contentKey: string;
    parentContentKey: string;
    contentTitle: string;
    quantity: number;
    unit: any;
    fulfillmentIdentifier?: string;
    subsidyAccessPolicyUuid: string;
    metadata: Record<string, any>;
    created: string;
    modified: string;
    reversal?: any;
    externalReference?: any;
    transactionStatusApiUrl: string;
    coursewareUrl: string;
  }
}

export {};
