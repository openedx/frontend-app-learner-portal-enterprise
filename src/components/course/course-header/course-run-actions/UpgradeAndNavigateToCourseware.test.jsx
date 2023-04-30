import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import StatefulEnroll from '../../../stateful-enroll';
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
jest.mock('../../../stateful-enroll', () => jest.fn(() => <div data-testid="stateful-enroll" />));

const UpgradeAndNavigateToCoursewareWrapper = (props) => (
  <IntlProvider locale="en">
    <UpgradeAndNavigateToCourseware
      contentKey={MOCK_COURSE_RUN_KEY}
      courseRunUrl={MOCK_COURSE_RUN_URL}
      subsidyAccessPolicy={MOCK_SUBSIDY_LEARNER_CREDIT}
      {...mockUpgradeCallbacks}
      {...props}
    />
  </IntlProvider>
);

describe('UpgradeAndNavigateToCourseware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render stateful enroll', () => {
    render(
      <UpgradeAndNavigateToCoursewareWrapper
        subsidyAccessPolicy={MOCK_SUBSIDY_LEARNER_CREDIT}
      />,
    );
    expect(screen.getByTestId('stateful-enroll')).toBeInTheDocument();
    expect(StatefulEnroll.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        labels: {
          default: 'View course',
          pending: 'Upgrading...',
          complete: 'Upgraded',
        },
        contentKey: MOCK_COURSE_RUN_KEY,
        onClick: mockUpgradeCallbacks.onUpgradeClick,
        onSuccess: mockUpgradeCallbacks.onUpgradeSuccess,
        onError: mockUpgradeCallbacks.onUpgradeError,
      }),
    );
  });
});
