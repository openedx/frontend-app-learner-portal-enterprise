import { useEffect } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { useLocation, useParams } from 'react-router-dom';
import { updateUserCsodParams } from '../services';
import useEnterpriseCustomer from './useEnterpriseCustomer';

const usePassLearnerCsodParams = () => {
  const location = useLocation();
  const { courseKey } = useParams();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const userGuid = queryParams.get('userGuid');
    const sessionToken = queryParams.get('sessionToken');
    if (!userGuid || !sessionToken || !courseKey) {
      return;
    }
    const callbackUrl = queryParams.get('callbackUrl');
    const subdomain = queryParams.get('subdomain');
    const data = {
      userGuid,
      sessionToken,
      callbackUrl,
      subdomain,
      courseKey,
      enterpriseUUID: enterpriseCustomer.uuid,
    };
    const performCsodParamsUpdate = async () => {
      try {
        await updateUserCsodParams({ data });
      } catch (error) {
        logError(error);
      }
    };
    performCsodParamsUpdate();
  }, [location.search, courseKey, enterpriseCustomer.uuid]);
};

export default usePassLearnerCsodParams;
