import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';

import { AppContext } from '@edx/frontend-platform/react';

import { Container, Row } from '@edx/paragon';

import { MainContent } from '../layout';
import SkillsQuizStepper from './SkillsQuizStepper';
import { SkillsContextProvider } from './SkillsContextProvider';
import SkillsQuizV2 from '../skills-quiz-v2/SkillsQuiz';

const SkillsQuiz = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const PAGE_TITLE = `Skills Quiz - ${enterpriseConfig.name}`;
  const v1 = false;
  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Container size="lg" className="py-5">
        <Row>
          <MainContent>
            <SearchData>
              <SkillsContextProvider>
                {v1 ? (
                  <SkillsQuizStepper isStyleAutoSuggest={false} />
                ) : (
                  <SkillsQuizV2 isStyleAutoSuggest={true} />
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
