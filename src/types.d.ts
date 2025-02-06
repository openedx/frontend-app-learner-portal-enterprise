import { queries } from './components/app/data';
import { SUBSIDY_REQUEST_STATE } from './constants';

// React Query
export type UseQueryResult = import('@tanstack/react-query').UseQueryResult;
export type UseQueryOptions = import('@tanstack/react-query').UseQueryOptions;
export type QueryObserverOptions = import('@tanstack/react-query').QueryObserverOptions;
export type QueryClient = import('@tanstack/react-query').QueryClient;
export type QueryObserverResult = import('@tanstack/react-query').QueryObserverResult;
export type Query = import('@tanstack/react-query').Query;
export type QueryOptions = import('@tanstack/react-query').QueryOptions;

// Query Key Factory
export type QueryKeys = import('@lukemorales/query-key-factory').inferQueryKeyStore<typeof queries>;

// Routes
export type RouteParams<Key extends string = string> = import('react-router-dom').Params<Key>;
export type RouteLoaderFunction = import('react-router-dom').LoaderFunction;
export type RouteLoaderFunctionArgs = import('react-router-dom').LoaderFunctionArgs;
export type MakeRouteLoaderFunction = (queryClient?: QueryClient) => RouteLoaderFunction;
export type MakeRouteLoaderFunctionWithQueryClient = (queryClient: QueryClient) => RouteLoaderFunction;
export type RouteObject = import('react-router-dom').RouteObject;
export type Router = import('@remix-run/router').Router;

// Application Data (general)
export interface AuthenticatedUser {
  userId: string;
  username: string;
  roles: string[];
  administrator: boolean;
  extendedProfile?: Record<string, any>;
}
export interface AppContextValue {
  authenticatedUser: AuthenticatedUser;
}

export interface BFFRequestAdditionalOptions {
  [key: string]: any; // Allow any additional properties
}

export type BFFRequestOptions =
  | ({ enterpriseId: string; enterpriseSlug?: string; } & BFFRequestAdditionalOptions)
  | ({ enterpriseId?: string; enterpriseSlug: string; } & BFFRequestAdditionalOptions);

export interface EnterpriseCustomer {
  uuid: string;
  slug: string;
  name: string;
  enableOneAcademy: boolean;
  identityProvider: string;
}

export interface EnterpriseFeatures {
  enterpriseLearnerBffEnabled?: boolean;
  [key: string]: boolean;
}

export interface EnterpriseCustomerUser {
  id: number;
  enterpriseCustomer: EnterpriseCustomer;
  active: boolean;
}

export interface EnterpriseLearnerData {
  enterpriseCustomer: Types.EnterpriseCustomer | null;
  activeEnterpriseCustomer: Types.EnterpriseCustomer | null;
  activeEnterpriseCustomerUserRoleAssignments: any[];
  allLinkedEnterpriseCustomerUsers: EnterpriseCustomerUser[];
  enterpriseCustomerUserRoleAssignments: any[];
  staffEnterpriseCustomer: Types.EnterpriseCustomer | null;
  enterpriseFeatures: Types.EnterpriseFeatures;
}

export interface EnrollmentDueDate {
  name: string;
  date: string;
  url: string;
}

export interface EnterpriseCourseEnrollment {
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
export type SubsidyRequestState = typeof SUBSIDY_REQUEST_STATE[keyof typeof SUBSIDY_REQUEST_STATE];

export interface SubsidyAccessPolicy {
  uuid: string;
  policyRedemptionUrl: string;
}
export interface SubsidyTransaction {
  uuid: string;
  state: 'created' | 'pending' | 'committed' | 'failed';
  lmsUserId: number;
  lmsUserEmail?: string;
  contentKey: string;
  parentContentKey: string;
  contentTitle: string;
  quantity: number;
  unit: any;
  fulfillmentIdentifier: string;
  subsidyAccessPolicyUuid: string;
  metadata: Record<string, any>;
  created: string;
  modified: string;
  reversal?: any;
  externalReference?: any;
  transactionStatusApiUrl: string;
  coursewareUrl: string;
}

export interface CustomerAgreement {
  uuid: string;
  netDaysUntilExpiration: number;
  disableExpirationNotifications: boolean;
  hasCustomLicenseExpirationMessagingV2: boolean;
  /* subscription plan UUID */
  subscriptionForAutoAppliedLicenses: string;
  enableAutoAppliedSubscriptionsWithUniversalLink: boolean;
}

export interface SubscriptionPlan {
  uuid: string;
  isCurrent: boolean;
}

export interface SubscriptionLicense {
  uuid: string;
  subscriptionPlan: SubscriptionPlan;
  status: 'activated' | 'assigned' | 'revoked' | 'unassigned';
  activationKey: string;
}

export interface SubscriptionsQueryData {
  subscriptionLicenses: Types.SubscriptionLicense[];
  customerAgreement: Types.CustomerAgreement | null;
  subscriptionLicense: Types.SubscriptionLicense | null;
  subscriptionPlan: Types.SubscriptionPlan | null;
  subscriptionLicensesByStatus: Record<LICENSE_STATUS, Types.SubscriptionLicense[]>;
  showExpirationNotifications: boolean;
}

// BFF Responses

export interface EnterpriseCustomerUserSubsidies {
  subscriptions: Types.SubscriptionsQueryData;
}

export interface BaseBFFResponse {
  enterpriseCustomerUserSubsidies: EnterpriseCustomerUserSubsidies;
}

export as namespace Types;
