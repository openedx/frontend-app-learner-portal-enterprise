import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';

import { AppContext } from '@edx/frontend-platform/react';

import { Container, Row } from '@edx/paragon';
import { hasFeatureFlagEnabled } from '@edx/frontend-enterprise-utils';

import { MainContent } from '../layout';
import SkillsQuizStepper from './SkillsQuizStepper';
import { SkillsContextProvider } from './SkillsContextProvider';
import SkillsQuizV2 from '../skills-quiz-v2/SkillsQuiz';

const SkillsQuiz = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const PAGE_TITLE = `Skills Quiz - ${enterpriseConfig.name}`;
  const v2 = hasFeatureFlagEnabled('ENABLE_SKILLS_QUIZ_V2'); // Enable the skills quiz v2 design only when enabled via query parameter.
  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Container size="lg" className="py-5">
        <Row>
          <MainContent>
            <SearchData>
              <SkillsContextProvider>
                {v2 ? (
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
