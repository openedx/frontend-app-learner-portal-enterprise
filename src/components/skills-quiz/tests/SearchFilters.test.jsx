import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { JOBS_QUIZ_FACET_FILTERS, SKILLS_FACET, CURRENT_JOB_FACET } from '../constants';

import { renderWithSearchContext } from './utils';

import '../__mocks__/react-instantsearch-dom';
import SkillsQuizStepper from '../SkillsQuizStepper';

const facetsToTest = [JOBS_QUIZ_FACET_FILTERS, SKILLS_FACET, CURRENT_JOB_FACET];
describe('<SkillsQuizStepper />', () => {
  test('renders skills and jobs dropdown with a label', () => {
    renderWithSearchContext(<SkillsQuizStepper />);
    facetsToTest.forEach((filter) => {
      expect(screen.getByText(filter.title)).toBeInTheDocument();
    });
    expect(screen.getByText(JOBS_QUIZ_FACET_FILTERS.title)).toBeInTheDocument();
  });
});
