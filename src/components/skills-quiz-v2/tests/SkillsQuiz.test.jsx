import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SkillsContextProvider } from '../../skills-quiz/SkillsContextProvider';
import { renderWithRouter } from '../../../utils/tests';
import SkillsQuizV2 from '../SkillsQuiz';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

const defaultAppState = {
  enterpriseConfig: {
    name: 'test-enterprise',
    slug: 'test',
    uuid: '12345',
  },
  authenticatedUser: {
    userId: '123',
  },
};

const defaultUserSubsidyState = {
  couponCodes: [],
  loading: false,
  couponCodesCount: 0,
};

const defaultSubsidyRequestState = {
  catalogsForSubsidyRequests: [],
};

describe('<SkillsQuizV2 />', () => {
  it('renders SkillsQuizV2 component correctly', () => {
    renderWithRouter(
      <SearchData>
        <SkillsContextProvider>
          <IntlProvider locale="en">
            <AppContext.Provider value={defaultAppState}>
              <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
                <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
                  <SkillsQuizV2 />
                </SubsidyRequestsContext.Provider>
              </UserSubsidyContext.Provider>
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
