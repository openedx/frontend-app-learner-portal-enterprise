import React, { useContext } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button, Container } from '@edx/paragon';
import AuthenticatedPageContext from '../app/AuthenticatedPageContext';

import './styles/EnterpriseBanner.scss';

import { useEnterpriseLearner } from '../app/App';

const EnterpriseBanner = () => {
  const { data: { activeEnterpriseCustomer } } = useEnterpriseLearner();
  // const { shouldRecommendCourses } = useContext(AuthenticatedPageContext);

  return (
    <div className="enterprise-banner bg-brand-secondary border-brand-tertiary">
      <Container size="lg">
        <div className="row banner-content">
          <h1 className="h2 mb-0 py-3 pl-3 text-brand-secondary">
            {activeEnterpriseCustomer.name}
          </h1>
          {/* {shouldRecommendCourses && (
            <Button
              as={Link}
              to={generatePath('/:enterpriseSlug/skills-quiz', { enterpriseSlug: enterpriseConfig.slug })}
              variant="inverse-primary"
              className="skills-quiz-btn"
            >
              <FormattedMessage
                id="enterprise.banner.recommend.courses"
                defaultMessage="Recommend courses for me"
                description="Recommend courses for me button label."
              />
            </Button>
          )} */}
        </div>
      </Container>
    </div>
  );
};

export default EnterpriseBanner;
