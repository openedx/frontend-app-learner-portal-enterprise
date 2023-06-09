import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import NavigateToCourseware from './NavigateToCourseware';
import BasicNavigateToCourseware from './BasicNavigateToCourseware';
import UpgradeAndNavigateToCourseware from './UpgradeAndNavigateToCourseware';

const MOCK_COURSE_RUN_URL = 'https://edx.org';
const MOCK_COURSE_RUN_KEY = 'course-v1:edX+DemoX+Demo_Course';
const MOCK_SUBSIDY_LEARNER_CREDIT = {
  subsidyType: 'learnerCredit',
};

const mockUpgradeCallbacks = {
  onUpgradeClick: jest.fn(),
  onUpgradeSuccess: jest.fn(),
  onUpgradeError: jest.fn(),
};

jest.mock('./BasicNavigateToCourseware', () => jest.fn(() => <div data-testid="basic-navigate-to-courseware" />));
jest.mock('./UpgradeAndNavigateToCourseware', () => jest.fn(() => <div data-testid="upgrade-navigate-to-courseware" />));

const NavigateToCoursewareWrapper = (props) => (
  <IntlProvider locale="en">
    <NavigateToCourseware
      contentKey={MOCK_COURSE_RUN_KEY}
      courseRunUrl={MOCK_COURSE_RUN_URL}
      shouldUpgradeUserEnrollment={false}
      userSubsidyApplicableToCourse={MOCK_SUBSIDY_LEARNER_CREDIT}
      {...mockUpgradeCallbacks}
      {...props}
    />
  </IntlProvider>
);

describe('NavigateToCourseware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render basic navigate to courseware CTA if no upgrade is needed', () => {
    render(<NavigateToCoursewareWrapper />);
    expect(screen.getByTestId('basic-navigate-to-courseware')).toBeInTheDocument();
    expect(BasicNavigateToCourseware.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        courseRunUrl: MOCK_COURSE_RUN_URL,
      }),
    );
  });

  it('should render stateful enroll with learner credit subsidy type', () => {
    render(
      <NavigateToCoursewareWrapper
        subsidyAccessPolicy={MOCK_SUBSIDY_LEARNER_CREDIT}
        shouldUpgradeUserEnrollment
      />,
    );
    expect(screen.getByTestId('upgrade-navigate-to-courseware')).toBeInTheDocument();
    expect(UpgradeAndNavigateToCourseware.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        subsidyAccessPolicy: MOCK_SUBSIDY_LEARNER_CREDIT,
        contentKey: MOCK_COURSE_RUN_KEY,
        onUpgradeClick: mockUpgradeCallbacks.onUpgradeClick,
        onUpgradeSuccess: mockUpgradeCallbacks.onUpgradeSuccess,
        onUpgradeError: mockUpgradeCallbacks.onUpgradeError,
      }),
    );
  });
});
