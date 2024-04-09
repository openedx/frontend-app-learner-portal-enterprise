import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { CourseContext } from './CourseContextProvider';
import { useExtractAndRemoveSearchParamsFromURL } from './data/hooks';
import NotFoundPage from '../NotFoundPage';
import {
  useCourseMetadata,
  useEnterpriseCustomer,
} from '../app/data';

const CoursePage = () => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: courseMetadata } = useCourseMetadata();
  const algoliaSearchParams = useExtractAndRemoveSearchParamsFromURL();
  const [externalCourseFormSubmissionError, setExternalCourseFormSubmissionError] = useState(null);

  const contextValue = useMemo(() => ({
    algoliaSearchParams,
    externalCourseFormSubmissionError,
    setExternalCourseFormSubmissionError,
  }), [
    algoliaSearchParams,
    externalCourseFormSubmissionError,
  ]);

  // If there isn't an active course run we don't show the course at all
  if (!courseMetadata?.activeCourseRun) {
    return <NotFoundPage />;
  }

  const PAGE_TITLE = `${courseMetadata.title} - ${enterpriseCustomer.name}`;

  return (
    <CourseContext.Provider value={contextValue}>
      <Helmet title={PAGE_TITLE} />
      <Outlet />
    </CourseContext.Provider>
  );
};

export default CoursePage;
