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

// Application Data (general)
export interface AuthenticatedUser {
  userId: string;
  username: string;
  roles: string[];
  administrator: boolean;
}

export interface EnterpriseCustomer {
  uuid: string;
  slug: string;
  name: string;
  enableOneAcademy: boolean;
}

export interface EnterpriseLearnerData {
  enterpriseCustomer: Types.EnterpriseCustomer;
  activeEnterpriseCustomer: Types.EnterpriseCustomer;
  allLinkedEnterpriseCustomerUsers: any[];
  staffEnterpriseCustomer: Types.EnterpriseCustomer;
}

// Application Data (subsidy)
export type SubsidyRequestState = typeof SUBSIDY_REQUEST_STATE[keyof typeof SUBSIDY_REQUEST_STATE];

export as namespace Types;
