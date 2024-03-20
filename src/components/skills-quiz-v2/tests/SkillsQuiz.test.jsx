import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContextProvider } from '../../skills-quiz/SkillsContextProvider';
import { renderWithRouter } from '../../../utils/tests';
import SkillsQuizV2 from '../SkillsQuiz';
import { useEnterpriseCustomer } from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

const defaultAppState = {
  authenticatedUser: {
    userId: '123',
  },
};

const mockEnterpriseCustomer = {
  name: 'test-enterprise',
  slug: 'test-enterprise-slug',
  uuid: 'test-enterprise-uuid',
};

useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });

describe('<SkillsQuizV2 />', () => {
  it('renders SkillsQuizV2 component correctly', () => {
    renderWithRouter(
      <SearchData>
        <SkillsContextProvider>
          <IntlProvider locale="en">
            <AppContext.Provider value={defaultAppState}>
              <SkillsQuizV2 />
            </AppContext.Provider>
          </IntlProvider>,
        </SkillsContextProvider>
      </SearchData>,
      { route: '/test/skills-quiz/' },
    );

    expect(screen.getByText('Skills Builder')).toBeInTheDocument();
    expect(screen.getByText('Let edX be your guide')).toBeInTheDocument();
    expect(screen.getByText('What roles are you interested in ?')).toBeInTheDocument();
    expect(screen.getByText('Show advanced options')).toBeInTheDocument();
  });
});
