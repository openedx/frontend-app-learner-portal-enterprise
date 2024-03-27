import { Helmet } from 'react-helmet';
import {
  breakpoints, Container, Row, MediaQuery,
} from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';

import { MainContent, Sidebar } from '../layout';
import { LoadingSpinner } from '../loading-spinner';
import ProgramHeader from './ProgramHeader';
import ProgramMainContent from './ProgramMainContent';
import ProgramSidebar from './ProgramSidebar';

import ProgramEndorsements from './ProgramEndorsements';
import ProgramFAQ from './ProgramFAQ';
import ProgramCTA from './ProgramCTA';
import NotFoundPage from '../NotFoundPage';
import { PROGRAM_NOT_FOUND_MESSAGE, PROGRAM_NOT_FOUND_TITLE } from './data/constants';
import ProgramDataBar from './ProgramDataBar';
import { useEnterpriseCustomer, useProgramDetails } from '../app/data';

const ProgramPage = () => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: program, isError: fetchError, isLoading } = useProgramDetails();

  if (fetchError) {
    return <ErrorPage message={fetchError.message} />;
  }

  if (isLoading) {
    return (
      <Container size="lg" className="py-5">
        <LoadingSpinner screenReaderText="loading program" />
      </Container>
    );
  }

  // if there is not even single course that does not belongs to the enterprise customer's catalog
  if (!program.catalogContainsProgram) {
    return (
      <NotFoundPage
        pageTitle={PROGRAM_NOT_FOUND_TITLE}
        errorHeading={PROGRAM_NOT_FOUND_TITLE}
        errorMessage={PROGRAM_NOT_FOUND_MESSAGE}
      />
    );
  }
  const PAGE_TITLE = `${program.title} - ${enterpriseCustomer.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
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
    </>
  );
};

export default ProgramPage;
