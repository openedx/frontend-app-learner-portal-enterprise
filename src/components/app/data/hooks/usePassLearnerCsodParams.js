import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { updateUserCsodParams } from '../services';

const usePassLearnerCsodParams = (enterpriseUUID) => {
  const location = useLocation();
  const { courseKey } = useParams();

  useEffect(async () => {
    const queryParams = new URLSearchParams(location.search);
    const userGuid = queryParams.get('userGuid');
    const sessionToken = queryParams.get('sessionToken');

    if (userGuid && sessionToken && courseKey && enterpriseUUID) {
      const data = {
        userGuid,
        sessionToken,
        callbackUrl: queryParams.get('callbackUrl'),
        subdomain: queryParams.get('subdomain'),
        courseKey,
        enterpriseUUID,
      };
      try {
        await updateUserCsodParams({data}); // Call updateUserCsodParams function
        // Handle successful response if needed
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  }, [location.search, courseKey, enterpriseUUID]);
};

export default usePassLearnerCsodParams;
