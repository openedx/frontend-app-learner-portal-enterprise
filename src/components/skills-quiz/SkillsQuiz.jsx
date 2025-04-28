import { Helmet } from 'react-helmet';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';

import { Container, Row } from '@openedx/paragon';

import { getConfig } from '@edx/frontend-platform/config';
import { hasFeatureFlagEnabled } from '@edx/frontend-enterprise-utils';
import { MainContent } from '../layout';
import SkillsQuizStepper from './SkillsQuizStepper';
import { SkillsContextProvider } from './SkillsContextProvider';
import SkillsQuizV2 from '../skills-quiz-v2/SkillsQuiz';
import { isExperimentVariant } from '../../utils/optimizely';
import { useEnterpriseCustomer } from '../app/data';

const SkillsQuiz = () => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const PAGE_TITLE = `Skills Quiz - ${enterpriseCustomer.name}`;
  const config = getConfig();
  const isExperimentVariationB = isExperimentVariant(
    config.EXPERIMENT_2_ID,
    config.EXPERIMENT_2_VARIANT_2_ID,
  );
  const v2 = hasFeatureFlagEnabled('ENABLE_SKILLS_QUIZ_V2'); // Enable the skills quiz v2 design only when enabled via query parameter.
  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Container size="lg" className="py-5">
        <Row>
          <MainContent>
            <SearchData>
              <SkillsContextProvider>
                {/* {(isExperimentVariationB || v2) ? ( */}
                {true ? (
                  <SkillsQuizV2 isStyleAutoSuggest />
                ) : (
                  <SkillsQuizStepper isStyleAutoSuggest={false} />
                )}
              </SkillsContextProvider>
            </SearchData>
          </MainContent>
        </Row>
      </Container>
    </>
  );
};

export default SkillsQuiz;
