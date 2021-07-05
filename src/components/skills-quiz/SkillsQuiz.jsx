import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';

import { AppContext } from '@edx/frontend-platform/react';

import {
  Container, Row,
} from '@edx/paragon';

import { MainContent } from '../layout';
import SkillsQuizStepper from './SkillsQuizStepper';

const SkillsQuiz = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const PAGE_TITLE = `Skills Quiz - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Container size="lg" className="py-5">
        <Row>
          <MainContent>
            <SkillsQuizStepper />
          </MainContent>
        </Row>

      </Container>
    </>
  );
};

export default SkillsQuiz;
