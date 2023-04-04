// TODO: Add definition to @edx/frontend-platform/auth
export interface HttpClient {
  get: (url: string) => any;
  post: (url: string, options: any) => any;
};

// TODO: Add definition to @edx/frontend-platform/config
export type FrontendPlatformConfig = {
  USE_API_CACHE: boolean;
  ENTERPRISE_CATALOG_API_BASE_URL: string;
  DISCOVERY_API_BASE_URL: string;
  LMS_BASE_URL: string;
  LICENSE_MANAGER_URL: string;
};

// TODO: Add definitions to @edx/frontend-platform/react
export type EnterpriseConfig = {
  uuid: string;
  name: string;
  slug: string;
  disableSearch: boolean;
  adminUsers: any[]
};

export type ReactAppContext = {
  enterpriseConfig: EnterpriseConfig;
};