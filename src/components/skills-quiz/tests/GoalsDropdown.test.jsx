import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { GOAL_DROPDOWN_DEFAULT_OPTION } from '../constants';
import { renderWithRouter } from '../../../utils/tests';
import GoalDropdown from '../GoalDropdown';
import { SkillsContextProvider } from '../SkillsContextProvider';

const GoalDropdownWrapper = () => (
  <SkillsContextProvider>
    <GoalDropdown />
  </SkillsContextProvider>
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
    expect(screen.getByText(GOAL_DROPDOWN_DEFAULT_OPTION)).toBeTruthy();
  });
});
