import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderHook } from '@testing-library/react-hooks';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import useCourseRunCardAction from '../useCourseRunCardAction';

import StatefulEnroll from '../../../../../stateful-enroll';
import RedemptionStatusText from '../../../RedemptionStatusText';

jest.mock('../../../../../stateful-enroll', () => jest.fn(() => ({
  ...jest.requireActual('../../../../../stateful-enroll'),
  default: jest.fn(() => <div data-testid="stateful-enroll" />),
})));

jest.mock('../../../RedemptionStatusText', () => jest.fn(() => ({
  ...jest.requireActual('../../../RedemptionStatusText'),
  default: jest.fn(() => <div data-testid="redemption-status-text" />),
})));

const wrapper = ({ children }) => (
  <IntlProvider locale="en">{children}</IntlProvider>
);

describe('useCourseRunCardHeading', () => {
  it('handles existing course enrollment', () => {
    const { result } = renderHook(
      () => useCourseRunCardAction({
        isUserEnrolled: false,
        userEnrollment: undefined,
        courseRunUrl: 'http://edx.org',
        contentKey: 'course-v1:edX+DemoX+Demo_Course',
        userSubsidyApplicableToCourse: undefined,
      }),
      { wrapper },
    );
    const { getByTestId } = render(result.current);
    expect(getByTestId('stateful-enroll-data')).toBeInTheDocument();
  });
});
