import { queries } from './components/app/data';

export type UseQueryResult = import('@tanstack/react-query').UseQueryResult;
export type UseQueryOptions = import('@tanstack/react-query').UseQueryOptions;
export type QueryObserverOptions  = import('@tanstack/react-query').QueryObserverOptions;
export type QueryClient = import('@tanstack/react-query').QueryClient;
export type QueryObserverResult = import('@tanstack/react-query').QueryObserverResult;
export type Query = import('@tanstack/react-query').Query;
export type QueryOptions = import('@tanstack/react-query').QueryOptions

export type QueryKeys = import('@lukemorales/query-key-factory').inferQueryKeyStore<typeof queries>;

export as namespace Types;
