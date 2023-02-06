import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Button, Container } from '@edx/paragon';
import { useEnterpriseCuration } from '../search/content-highlights/data';
import './styles/EnterpriseBanner.scss';

const EnterpriseBanner = () => {
  const location = useLocation();
  const { enterpriseConfig } = useContext(AppContext);
  const { enterpriseConfig: { uuid: enterpriseUUID } } = useContext(AppContext);
  const { enterpriseCuration: { canOnlyViewHighlightSets } } = useEnterpriseCuration(enterpriseUUID);
  const isSearchPage = `/${ enterpriseConfig.slug }/search` === location.pathname;

  return (
    <div className="enterprise-banner bg-brand-secondary border-brand-tertiary">
      <Container size="lg">
        <div className="row banner-content">
          <h1 className="h2 mb-0 py-3 pl-3 text-brand-secondary">
            {enterpriseConfig.name}
          </h1>
          {isSearchPage
          && (canOnlyViewHighlightSets === false) && (
            <Button
              as={Link}
              to={`/${ enterpriseConfig.slug }/skills-quiz`}
              variant="inverse-primary"
              className="skills-quiz-btn"
            > Recommend courses for me
            </Button>
          )}
        </div>
      </Container>
    </div>
  );
};

export default EnterpriseBanner;
