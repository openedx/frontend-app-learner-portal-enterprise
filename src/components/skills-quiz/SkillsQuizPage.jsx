import React from 'react';

import { getConfig } from '@edx/frontend-platform/config';
import { Redirect } from 'react-router-dom';

import SkillsQuiz from './SkillsQuiz';

export default function SkillsQuizPage() {
  const config = getConfig();
  if (!config.ENABLE_SKILLS_QUIZ) {
    return <Redirect to="/" />;
  }
  return (
    <SkillsQuiz />
  );
}
