import { createContext } from 'react';

export const INITIAL_CONTEXT = {
  subsidyRequestConfiguration: null,
  licenseRequests: [],
  couponCodeRequests: [],
  refreshSubsidyRequests() {},
  isLoading: false,
};

export default createContext(INITIAL_CONTEXT);
