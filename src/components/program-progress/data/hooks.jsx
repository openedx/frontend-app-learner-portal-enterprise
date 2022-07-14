import { useContext, useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SUBSIDY_TYPE, SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { getLearnerProgramProgressDetail, getLearnerProgramsList } from './service';

export function useLearnerProgramProgressData(programUUID) {
  const [learnerProgramProgressData, setLearnerProgramProgressData] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      if (programUUID) {
        try {
          const data = await getLearnerProgramProgressDetail(programUUID);
          setLearnerProgramProgressData(data);
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
      return undefined;
    };
    fetchData();
  }, [programUUID]);
  return [camelCaseObject(learnerProgramProgressData), fetchError];
}

export function useLearnerProgramsListData(enterpriseId) {
  const [learnerProgramsListData, setLearnerProgramsListData] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      if (enterpriseId) {
        try {
          const { data } = await getLearnerProgramsList(enterpriseId);
          setLearnerProgramsListData(data);
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
      return undefined;
    };
    fetchData();
  }, [enterpriseId]);
  return [camelCaseObject(learnerProgramsListData), fetchError];
}

export function useHasLicenseOrCoupon() {
  const {
    subscriptionPlan,
    subscriptionLicense: userSubscriptionLicense,
    couponCodes: { couponCodesCount },
  } = useContext(UserSubsidyContext);

  const {
    requestsBySubsidyType,
  } = useContext(SubsidyRequestsContext);
  const licenseRequests = requestsBySubsidyType[SUBSIDY_TYPE.LICENSE];
  const couponCodeRequests = requestsBySubsidyType[SUBSIDY_TYPE.COUPON];

  const hasActiveLicenseOrLicenseRequest = (subscriptionPlan
    && userSubscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) || licenseRequests.length > 0;
  const hasAssignedCodesOrCodeRequests = couponCodesCount > 0 || couponCodeRequests.length > 0;

  return hasActiveLicenseOrLicenseRequest || hasAssignedCodesOrCodeRequests;
}
