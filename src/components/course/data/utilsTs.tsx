import isNil from 'lodash.isnil';
import { EnterpriseOffer } from './types';

type CompareRedeemableOffersArgs = { firstOffer: EnterpriseOffer, secondOffer: EnterpriseOffer };
/**
 * Compares two redeemable enterprise offers, and makes a choice
 * about which one is preferred. Prefers offers without limits,
 * less spend (> $0), and less applications (> 0) remaining.
 *
 * @param {object} args
 * @param {object} args.firstOffer First redeemable offer to compare.
 * @param {object} args.secondOffer Second redeemable offer to compare.
 *
 * @returns A sort comparison value, e.g. -1, 0, or 1.
 */
export const compareRedeemableOffers = ({ firstOffer: a, secondOffer: b }:CompareRedeemableOffersArgs):number => {
  const aBalance = a.remainingBalanceForUser ?? a.remainingBalance ?? null;
  const bBalance = b.remainingBalanceForUser ?? b.remainingBalance ?? null;
  const bothHaveBalance = !isNil(aBalance) && !isNil(bBalance);

  const aApplications = a.remainingApplicationsForUser ?? a.remainingApplications ?? null;
  const bApplications = b.remainingApplicationsForUser ?? b.remainingApplications ?? null;
  const bothHaveApplications = !isNil(aApplications) && !isNil(bApplications);

  let priority = 0;

  // check balances
  if (isNil(aBalance) && !isNil(bBalance)) {
    priority -= 1;
  } else if (!isNil(aBalance) && isNil(bBalance)) {
    priority += 1;
  } else if (bothHaveBalance && (aBalance as number) < (bBalance as number)) {
    priority -= 1;
  } else if (bothHaveBalance && ((aBalance as number) > (bBalance as number))) {
    priority += 1;
  }

  // check applications
  if (isNil(aApplications) && !isNil(bApplications)) {
    priority -= 1;
  } else if (!isNil(aApplications) && isNil(bApplications)) {
    priority += 1;
  } else if (bothHaveApplications && (aApplications as number) < (bApplications as number)) {
    priority -= 1;
  } else if (bothHaveApplications && aApplications > bApplications) {
    priority += 1;
  }

  return priority; // default case: no changes in sorting order
};

export function hasCourseStarted(start: string):boolean {
  const today = new Date();
  const startDate = new Date(start);
  return startDate && today >= startDate;
}
