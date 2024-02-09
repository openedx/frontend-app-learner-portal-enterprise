import React, {
  useContext, useEffect, useState,
} from 'react';

import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { useLearnerProfileData } from './data/hooks';
import { LoadingSpinner } from '../loading-spinner';
import VisualizeCareer from './VisualizeCareer';
import { extractCurrentJobID } from './data/utils';
import AddJobRole from './AddJobRole';

const MyCareerTab = () => {
  const { authenticatedUser: { username } } = useContext(AppContext);

  const [learnerProfileData, learnerProfileDataFetchError, isLoadingData] = useLearnerProfileData(
    username,
  );
  const [learnerProfileState, setLearnerProfileState] = useState();

  useEffect(() => {
    if (learnerProfileData) {
      setLearnerProfileState(learnerProfileData);
    }
  }, [learnerProfileData]);

  if (learnerProfileDataFetchError) {
    return <ErrorPage status={learnerProfileDataFetchError.status} />;
  }

  if (isLoadingData && !learnerProfileState) {
    return (
      <div className="py-5">
        <LoadingSpinner screenReaderText="loading my career data" />
      </div>
    );
  }

  const learnerCurrentJobID = extractCurrentJobID(learnerProfileState);

  return (
    <div>
      <SearchData>
        { !learnerCurrentJobID ? (
          <AddJobRole submitClickHandler={setLearnerProfileState} />
        ) : (
          <VisualizeCareer jobId={learnerCurrentJobID} submitClickHandler={setLearnerProfileState} />
        )}
      </SearchData>
    </div>
  );
};

export default MyCareerTab;
