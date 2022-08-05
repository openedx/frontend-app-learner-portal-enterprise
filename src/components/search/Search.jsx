import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';
import { HEADER_TITLE } from './constants';
import SearchCourseCard from './SearchCourseCard';

import { IntegrationWarningModal } from '../integration-warning-modal';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import CatalogNoResults from './CatalogNoResults';

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
    height: '300px',
  };

  if (!catalogData.courses_metadata) {
    return <CatalogNoResults />;
  }

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Container size="lg" className="search-results my-5">
        <div style={parentStyle}>
          {catalogData.courses_metadata?.map(
            (courseMetadata) => (
              <div className="mt-4" style={childStyle}>
                <SearchCourseCard hit={courseMetadata} />
              </div>
            ),
          )}
        </div>
      </Container>
      <IntegrationWarningModal isOpen={enterpriseConfig.showIntegrationWarning} />
    </>
  );
};

export default Search;
