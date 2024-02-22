import { Container } from '@edx/paragon';
import { useEnterpriseLearner } from '../app/data';

const EnterpriseBanner = () => {
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();

  return (
    <div className="enterprise-banner bg-brand-secondary border-brand-tertiary">
      <Container size="lg">
        <div className="row banner-content">
          <h1 className="h2 mb-0 py-3 pl-3 text-brand-secondary">
            {enterpriseCustomer.name}
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
