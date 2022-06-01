import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  breakpoints, Container, Row, MediaQuery,
} from '@edx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { MainContent, Sidebar } from '../layout';
import { LoadingSpinner } from '../loading-spinner';
import {
  ProgramProgressContextProvider,
} from './ProgramProgressContextProvider';
import { useLearnerProgramProgressData } from './data/hooks';

const ProgramProgressPage = () => {
  const { programUUID } = useParams();
  const [programRequest, fetchError] = useLearnerProgramProgressData(programUUID);

  const initialState = programRequest ? programRequest.data : undefined;

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
        <div className="col-4 offset-4">Program Progress Header Will Go Here</div>
        <Container size="lg" className="py-5">
          <Row>
            <MainContent>
              <div>Program Courses Will go Here</div>
            </MainContent>
            <MediaQuery minWidth={breakpoints.large.minWidth}>
              {matches => matches && (
                <Sidebar>
                  <div>Program Sidebar Will go Here</div>
                </Sidebar>
              )}
            </MediaQuery>
          </Row>
        </Container>
      </ProgramProgressContextProvider>
    </>
  );
};

export default ProgramProgressPage;
