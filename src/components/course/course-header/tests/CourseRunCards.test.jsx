import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import CourseRunCards from '../CourseRunCards';
import { CourseContext } from '../../CourseContextProvider';

jest.mock('../CourseRunCard', () => jest.fn((props) => {
  const MockName = 'course-run-card';
  return <MockName data-testid={MockName} {...props} />;
}));
jest.mock('../deprecated/CourseRunCard', () => jest.fn((props) => {
  const MockName = 'deprecated-course-run-card';
  return <MockName data-testid={MockName} {...props} />;
}));

const mockCourseRunKey = 'course-run-key';
const mockCourseRun = {
  key: mockCourseRunKey,
  uuid: 'course-run-uuid',
};
const mockCourseKey = 'course-key';
const defaultCourseContext = {
  state: {
    availableCourseRuns: [mockCourseRun],
    userEntitlements: [],
    userEnrollments: [],
    course: { key: mockCourseKey, entitlements: [] },
    catalog: { catalogList: [] },
  },
  subsidyRequestCatalogsApplicableToCourse: [],
  missingUserSubsidyReason: undefined,
  redeemabilityPerContentKey: [],
};

const CourseRunCardsWrapper = ({ courseContexValue = defaultCourseContext }) => (
  <CourseContext.Provider value={courseContexValue}>
    <CourseRunCards />
  </CourseContext.Provider>
);

describe('<CourseRunCardStatus />', () => {
  test('renders deprecated course run card', () => {
    render(<CourseRunCardsWrapper />);
    expect(screen.getByTestId('deprecated-course-run-card')).toBeInTheDocument();
  });

  test('renders non-deprecated course run card', () => {
    render(<CourseRunCardsWrapper
      courseContexValue={{
        ...defaultCourseContext,
        redeemabilityPerContentKey: [{
          contentKey: mockCourseRunKey,
          redeemableSubsidyAccessPolicy: {
            uuid: 'subsidy-access-policy-uuid',
            canRedeem: true,
            policyRedemptionUrl: 'http://redeem.url',
          },
        }],
      }}
    />);
    expect(screen.getByTestId('course-run-card')).toBeInTheDocument();
  });
});
