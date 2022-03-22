import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  breakpoints, Container, Row, MediaQuery,
} from '@edx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { LoadingSpinner } from '../loading-spinner';
import {
  ProgramProgressContextProvider,
} from './ProgramProgressContextProvider';
import ProgramProgressHeader from './ProgramProgressHeader';
import ProgramProgressSideBar from './ProgramProgressSidebar';

import { useLearnerProgramProgressData } from './data/hooks';

const ProgramProgressPage = () => {
  const { programUUID } = useParams();
  const [program, fetchError] = useLearnerProgramProgressData(programUUID);

  const initialState = useMemo(
    () => {
      if (!program) {
        return undefined;
      }

      return program.data;
    },
    [program],
  );

  if (fetchError) {
    return <ErrorPage message={fetchError.message} />;
  }

  if (!initialState) {
    return (
      <Container size="lg" className="py-5">
        <LoadingSpinner screenReaderText="loading program progress" />
      </Container>
    );
  }

  const PAGE_TITLE = `${initialState.programData.title}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <ProgramProgressContextProvider initialState={initialState}>
        <ProgramProgressHeader />
        <Container fluid={false} style={{ paddingLeft: 30, paddingRight: 30 }}>
          <Row>
            <article className="col-lg-8">
              <div>Program Courses Will go Here</div>
            </article>
            <MediaQuery minWidth={breakpoints.large.minWidth}>
              {matches => matches && (
                <ProgramProgressSideBar />
              )}
            </MediaQuery>
          </Row>
        </Container>
      </ProgramProgressContextProvider>
    </>
  );
};

export default ProgramProgressPage;
