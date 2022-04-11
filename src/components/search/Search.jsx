import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';
import { HEADER_TITLE } from './constants';
import SearchCourseCard from './SearchCourseCard';
import SearchProgramCard from './SearchProgramCard';

import { IntegrationWarningModal } from '../integration-warning-modal';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import NotFoundPage from '../NotFoundPage';

const Search = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const { catalogData } = useContext(UserSubsidyContext);

  const PAGE_TITLE = `${HEADER_TITLE} - ${enterpriseConfig.name}`;
  const parentStyle = {
    display: 'flex',
    'flex-wrap': 'wrap',
  };
  const childStyle = {
    width: '23%',
    margin: '10px',
    height: '255px',
  };

  if (!catalogData.programs) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Container size="lg" className="search-results my-5">
        <div className="d-flex align-items-center mb-2">
          <h2 className="flex-grow-1 mb-2">
            Programs
          </h2>
        </div>
        <div style={parentStyle}>
          {catalogData.programs?.map(
            (program) => (
              <div className="mt-4" style={childStyle}>
                <SearchProgramCard hit={program} />
              </div>
            ),
          )}
        </div>
        <div className="d-flex align-items-center mb-2 pt-5">
          <h2 className="flex-grow-1 mb-2">
            Courses
          </h2>
        </div>
        <div style={parentStyle}>
          {catalogData.programs?.map(
            (program) => (
              program.courses?.map(
                (course) => (
                  <div className="mt-4" style={childStyle}>
                    <SearchCourseCard hit={course} />
                  </div>
                ),
              )
            ),
          )}
        </div>
      </Container>
      <IntegrationWarningModal isOpen={enterpriseConfig.showIntegrationWarning} />
    </>
  );
};

export default Search;
