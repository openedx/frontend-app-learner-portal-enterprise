export const SUBSIDY_TYPE = {
  LICENSE: 'license',
  COUPON: 'coupon',
};
export const SUBSIDY_REQUEST_STATE = {
  REQUESTED: 'requested',
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined',
  ERROR: 'error',
} as const;
