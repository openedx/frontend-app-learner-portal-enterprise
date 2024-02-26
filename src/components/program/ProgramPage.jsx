import React, { useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  breakpoints, Container, Row, MediaQuery,
} from '@openedx/paragon';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';

import { MainContent, Sidebar } from '../layout';
import { LoadingSpinner } from '../loading-spinner';
import { ProgramContextProvider } from './ProgramContextProvider';
import ProgramHeader from './ProgramHeader';
import ProgramMainContent from './ProgramMainContent';
import ProgramSidebar from './ProgramSidebar';

import { useAllProgramData } from './data/hooks';
import ProgramEndorsements from './ProgramEndorsements';
import ProgramFAQ from './ProgramFAQ';
import ProgramCTA from './ProgramCTA';
import './styles/index.scss';
import NotFoundPage from '../NotFoundPage';
import { PROGRAM_NOT_FOUND_MESSAGE, PROGRAM_NOT_FOUND_TITLE } from './data/constants';
import ProgramDataBar from './ProgramDataBar';

const ProgramPage = () => {
  const { programUuid } = useParams();
  const { enterpriseConfig } = useContext(AppContext);

  const [programData, fetchError] = useAllProgramData({ enterpriseUuid: enterpriseConfig.uuid, programUuid });

  const initialState = useMemo(
    () => {
      if (!programData) {
        return undefined;
      }
      const { programDetails } = programData;

      return {
        program: programDetails,
      };
    },
    [programData],
  );

  if (fetchError) {
    return <ErrorPage message={fetchError.message} />;
  }

  if (!initialState) {
    return (
      <Container size="lg" className="py-5">
        <LoadingSpinner screenReaderText="loading program" />
      </Container>
    );
  }

  // if there is not even single course that does not belongs to the enterprise customer's catalog
  if (initialState && !initialState.program.catalogContainsProgram) {
    return (
      <NotFoundPage
        pageTitle={PROGRAM_NOT_FOUND_TITLE}
        errorHeading={PROGRAM_NOT_FOUND_TITLE}
        errorMessage={PROGRAM_NOT_FOUND_MESSAGE}
      />
    );
  }
  const PAGE_TITLE = `${initialState.program.title} - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <ProgramContextProvider initialState={initialState}>
        <ProgramHeader />
        <ProgramDataBar />
        <Container size="lg" className="py-5">
          <Row>
            <MainContent>
              <ProgramMainContent />
            </MainContent>
            <MediaQuery minWidth={breakpoints.large.minWidth}>
              {matches => matches && (
                <Sidebar>
                  <ProgramSidebar />
                </Sidebar>
              )}
            </MediaQuery>
          </Row>
          <Row>
            <ProgramEndorsements />
            <ProgramCTA />
            <ProgramFAQ />
          </Row>
        </Container>
      </ProgramContextProvider>
    </>
  );
};

export default ProgramPage;
