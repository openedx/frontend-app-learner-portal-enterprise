import { QueryClient } from '@tanstack/react-query';
import { LoaderFunction } from 'react-router-dom';
import { SUBSIDY_REQUEST_STATE } from './constants';

declare global {
  // Routes
  type MakeRouteLoaderFunction = (queryClient?: QueryClient) => LoaderFunction;
  type MakeRouteLoaderFunctionWithQueryClient = (queryClient: QueryClient) => LoaderFunction;
  type RouteObject = import('react-router-dom').RouteObject;
  type Router = import('@remix-run/router').Router;

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

  type BFFRequestOptions = { enterpriseSlug: string; };

  type EnterpriseCustomer = {
    uuid: string;
    slug: string;
    name: string;
    enableOneAcademy: boolean;
  };

  type EnterpriseFeatures = {
    enterpriseLearnerBffEnabled?: boolean;
    catalogQuerySearchFiltersEnabled?: boolean;
  };

  type EnterpriseCustomerUser = {
    id: number,
    enterpriseCustomer: EnterpriseCustomer,
    active: boolean,
  };

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

  type EnrollmentDueDate = {
    name: string;
    date: string;
    url: string;
  };

  type EnterpriseCourseEnrollment = {
    courseRunId: string;
    courseKey: string;
    courseType: string;
    orgName: string;
    courseRunStatus: string;
    displayName: string;
    emailsEnabled?: boolean;
    certificateDownloadUurl?: string;
    created: string;
    startDate?: string;
    endDate?: string;
    mode: string;
    isEnrollmentActive: boolean;
    productSource: string;
    enrollBy?: string;
    pacing: boolean;
    courseRunUrl: string;
    resumeCourseRunUrl?: string;
    isRevoked: boolean;
    dueDates: EnrollmentDueDate[];
  };

  // Application Data (subsidy)

  type SubsidyRequestState = typeof SUBSIDY_REQUEST_STATE[keyof typeof SUBSIDY_REQUEST_STATE];

  type SubsidyAccessPolicy = {
    uuid: string;
    policyRedemptionUrl: string;
  };

  type SubsidyTransactionState = 'created' | 'pending' | 'committed' | 'failed';

  type SubsidyTransaction = {
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
  };
}

export {};
