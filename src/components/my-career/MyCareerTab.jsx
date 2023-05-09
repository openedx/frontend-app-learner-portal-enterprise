import React, { useContext } from 'react';

import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { useLearnerSkillQuiz } from './data/hooks';
import { LoadingSpinner } from '../loading-spinner';
import AddJobRole from './AddJobRole';
import VisualizeCareer from './VisualizeCareer';
import { getSkillQuiz } from './data/utils';
import { SEARCH_FACET_FILTERS } from '../search/constants';

const MyCareerTab = () => {
  const { authenticatedUser } = useContext(AppContext);
  const { username } = authenticatedUser;

  const [learnerSkillQuiz, learnerSkillQuizFetchError] = useLearnerSkillQuiz(
    username,
  );

  if (learnerSkillQuizFetchError) {
    return <ErrorPage status={learnerSkillQuizFetchError.status} />;
  }

  if (!learnerSkillQuiz) {
    return (
      <div className="py-5">
        <LoadingSpinner screenReaderText="loading my career data" />
      </div>
    );
  }

  const skillQuiz = getSkillQuiz(learnerSkillQuiz);

  return (!skillQuiz) ? (
    <AddJobRole />
  ) : (
    <SearchData searchFacetFilters={SEARCH_FACET_FILTERS}>
      <VisualizeCareer jobId={skillQuiz.currentJob} />
    </SearchData>
  );
};

export default MyCareerTab;
