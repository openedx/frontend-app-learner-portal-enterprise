import {
  Button,
  Col,
  Container,
  Row,
} from '@openedx/paragon';
import { Link, generatePath } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { useEnterpriseLearner, useRecommendCoursesForMe } from '../app/data';

const EnterpriseBanner = () => {
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  const { shouldRecommendCourses } = useRecommendCoursesForMe();

  return (
    <div className="enterprise-banner bg-brand-secondary border-brand-tertiary">
      <Container size="lg">
        <Row>
          <Col className="d-flex align-items-center justify-content-between">
            <h1 className="h2 py-3 mb-0 text-brand-secondary">
              {enterpriseCustomer.name}
            </h1>
            {shouldRecommendCourses && (
              <Button
                as={Link}
                to={generatePath('/:enterpriseSlug/skills-quiz', { enterpriseSlug: enterpriseCustomer.slug })}
                variant="inverse-primary"
                className="flex-grow-0"
              >
                <FormattedMessage
                  id="enterprise.banner.recommend.courses"
                  defaultMessage="Recommend courses for me"
                  description="Recommend courses for me button label."
                />
              </Button>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EnterpriseBanner;
