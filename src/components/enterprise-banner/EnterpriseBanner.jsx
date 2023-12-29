import React, { useContext } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Button, Container } from '@openedx/paragon';
import AuthenticatedPageContext from '../app/AuthenticatedPageContext';

import './styles/EnterpriseBanner.scss';

const EnterpriseBanner = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const { shouldRecommendCourses } = useContext(AuthenticatedPageContext);

  return (
    <div className="enterprise-banner bg-brand-secondary border-brand-tertiary">
      <Container size="lg">
        <div className="row banner-content">
          <h1 className="h2 mb-0 py-3 pl-3 text-brand-secondary">
            {enterpriseConfig.name}
          </h1>
          {shouldRecommendCourses && (
            <Button
              as={Link}
              to={generatePath('/:enterpriseSlug/skills-quiz', { enterpriseSlug: enterpriseConfig.slug })}
              variant="inverse-primary"
              className="skills-quiz-btn"
            >
              Recommend courses for me
            </Button>
          )}
        </div>
      </Container>
    </div>
  );
};

export default EnterpriseBanner;
