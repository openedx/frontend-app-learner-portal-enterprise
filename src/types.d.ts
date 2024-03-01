import { queries } from './utils/queryKeyFactory'

export type UseQueryResult = import('@tanstack/react-query').UseQueryResult;
export type QueryKeys = import('@lukemorales/query-key-factory').inferQueryKeyStore<typeof queries>;

export as namespace Types;
