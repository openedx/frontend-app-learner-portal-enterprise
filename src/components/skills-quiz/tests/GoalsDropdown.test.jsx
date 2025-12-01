import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter } from '../../../utils/tests';
import GoalDropdown from '../GoalDropdown';
import { SkillsContextProvider } from '../SkillsContextProvider';

const GoalDropdownWrapper = () => (
  <IntlProvider locale="en">
    <SkillsContextProvider>
      <GoalDropdown />
    </SkillsContextProvider>
  </IntlProvider>
);

const mockLocation = {
  pathname: '/welcome',
  hash: '',
  search: '',
  state: { activationSuccess: true },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => (mockLocation),
}));

describe('<GoalDropdown />', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders goal dropdown successfully.', () => {
    renderWithRouter(
      <GoalDropdownWrapper />,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByTestId('skills-quiz-goal-dropdown-toggle')).toBeInTheDocument();
  });
});
