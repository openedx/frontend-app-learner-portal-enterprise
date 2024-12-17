import { Navigate } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform/config';

import SkillsQuiz from './SkillsQuiz';

const SkillsQuizPage = () => {
  const config = getConfig();
  if (!config.ENABLE_SKILLS_QUIZ) {
    return <Navigate to="/" replace />;
  }
  return <SkillsQuiz />;
};

export default SkillsQuizPage;
