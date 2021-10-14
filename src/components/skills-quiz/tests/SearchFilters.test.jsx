import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContextProvider } from '../SkillsContextProvider';
import { JOBS_QUIZ_FACET_FILTERS, SKILLS_FACET, CURRENT_JOB_FACET } from '../constants';

import '../__mocks__/react-instantsearch-dom';
import SkillsQuizStepper from '../SkillsQuizStepper';

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ username: 'myspace-tom' }),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

const facetsToTest = [JOBS_QUIZ_FACET_FILTERS, SKILLS_FACET, CURRENT_JOB_FACET];
describe('<SkillsQuizStepper />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
    },
  };
  test('renders skills and jobs dropdown with a label', () => {
    renderWithRouter(
      <AppContext.Provider value={initialAppState}>
        <SearchData>
          <SkillsContextProvider>
            <SkillsQuizStepper />
          </SkillsContextProvider>
        </SearchData>
      </AppContext.Provider>,
    );
    facetsToTest.forEach((filter) => {
      expect(screen.getByText(filter.title)).toBeInTheDocument();
    });
    expect(screen.getByText(JOBS_QUIZ_FACET_FILTERS.title)).toBeInTheDocument();
  });
});
