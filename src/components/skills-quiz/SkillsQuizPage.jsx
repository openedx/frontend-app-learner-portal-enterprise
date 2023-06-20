import React from 'react';

import { getConfig } from '@edx/frontend-platform/config';
import { Navigate } from 'react-router-dom';

import SkillsQuiz from './SkillsQuiz';

const SkillsQuizPage = () => {
  const config = getConfig();
  if (!config.ENABLE_SKILLS_QUIZ) {
    return <Navigate to="/" />;
  }
  return <SkillsQuiz />;
};

export default SkillsQuizPage;
