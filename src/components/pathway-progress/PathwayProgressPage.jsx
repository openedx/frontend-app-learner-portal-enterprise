import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { ErrorPage } from '@edx/frontend-platform/react';
import {
  Container,
} from '@openedx/paragon';

import { LoadingSpinner } from '../loading-spinner';
import { useLearnerPathwayProgressData } from './data/hooks';
import { PathwayProgressContextProvider } from './PathwayProgressContextProvider';
import { CourseEnrollmentsContextProvider } from '../dashboard/main-content/course-enrollments';
import PathwayProgressHeader from './PathwayProgressHeader';
import PathwayRequirements from './PathwayRequirements';
import './styles/index.scss';

const PathwayProgressPage = () => {
  const { pathwayUUID } = useParams();
  const [pathwayProgressDetails, fetchError] = useLearnerPathwayProgressData(pathwayUUID);

  const initialState = useMemo(
    () => {
      if (!pathwayProgressDetails) {
        return undefined;
      }
      return pathwayProgressDetails.data;
    },
    [pathwayProgressDetails],
  );

  if (fetchError) {
    return <ErrorPage message={fetchError.message} />;
  }

  if (!initialState) {
    return (
      <Container size="lg" className="py-5">
        <LoadingSpinner screenReaderText="loading pathway progress" />
      </Container>
    );
  }
  const PATHWAY_TITLE = `${initialState.learnerPathwayProgress.title}`;

  return (
    <>
      <Helmet title={PATHWAY_TITLE} />
      <CourseEnrollmentsContextProvider>
        <PathwayProgressContextProvider initialState={initialState}>
          <Container fluid={false}>
            <PathwayProgressHeader />
            <PathwayRequirements />
          </Container>
        </PathwayProgressContextProvider>
      </CourseEnrollmentsContextProvider>
    </>
  );
};

export default PathwayProgressPage;
