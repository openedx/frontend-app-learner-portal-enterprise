import React, { useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { breakpoints, Container, Row } from '@edx/paragon';
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

const Program = () => {
  const { programUuid } = useParams();
  const { enterpriseConfig } = useContext(AppContext);

  const [programData, fetchError] = useAllProgramData({ programUuid });

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

  const PAGE_TITLE = `${initialState.program.title} - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <ProgramContextProvider initialState={initialState}>
        <ProgramHeader />
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
            <ProgramFAQ />
          </Row>
        </Container>
      </ProgramContextProvider>
    </>
  );
};

export default Program;
