export type EnterpriseOffer = {
  id: number;
  enterpriseCatalogUuid: string;
  remainingBalance?: number;
  remainingBalanceForUser?: number;
  remainingApplications?: number;
  remainingApplicationsForUser?: number;
  startDatetime: string;
  endDatetime: string;
  offerType: string;
  usageType: string;
  discountType: string;
  discountValue: number;
};
