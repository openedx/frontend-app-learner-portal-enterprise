import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';

import {
  renderWithRouter,
  initialAppState,
  initialCourseState,
} from '../../../../utils/tests';
import { COURSE_MODES_MAP } from '../../data/constants';
import EnrollAction from '../EnrollAction';
import { enrollButtonTypes } from '../constants';
import { CourseContextProvider } from '../../CourseContextProvider';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';
import { SubsidyRequestsContext } from '../../../enterprise-subsidy-requests';
import {
  CourseEnrollmentsContext,
} from '../../../dashboard/main-content/course-enrollments/CourseEnrollmentsContextProvider';

jest.mock('../components/ToEcomBasketPage', () => ({
  __esModule: true,
  default: () => '<ToEcomBasketPage />',
}));

/**
 * These tests verify that the correct enroll component is rendered.
 * They do not test the enroll label since that is tested separately.
 * We just pass a pre-rendered enroll label for these tests.
 * See this page for scenarios:
 * https://openedx.atlassian.net/wiki/spaces/SOL/pages/2178875970/Enroll+Button+logic+for+Enterprise+Learner+Portal
 */
const {
  TO_COURSEWARE_PAGE,
  VIEW_ON_DASHBOARD,
  ENROLL_DISABLED,
  TO_DATASHARING_CONSENT,
  TO_ECOM_BASKET,
} = enrollButtonTypes;

const INITIAL_APP_STATE = initialAppState({});
const selfPacedCourseWithLicenseSubsidy = initialCourseState({});
const verifiedTrackEnrollment = {
  mode: COURSE_MODES_MAP.VERIFIED,
  isActive: true,
  courseRunId: selfPacedCourseWithLicenseSubsidy.activeCourseRun.key,
  courseRunUrl: 'https://learning.edx.org',
};
const subscriptionLicense = { uuid: 'a-license' };

/**
   * @param {object} args Arguments.
   * @param {string} args.enrollAction
   */
const EnrollLabel = (props) => (
  <div>{props.enrollLabelText}</div>
);
const renderEnrollAction = ({
  enrollAction,
  courseInitState = selfPacedCourseWithLicenseSubsidy,
  initialUserSubsidyState = {
    subscriptionLicense,
    couponCodes: {
      couponCodes: [],
      couponCodesCount: 0,
    },
  },
  initialSubsidyRequestsState = {
    catalogsForSubsidyRequests: [],
  },
  initialCourseEnrollmentsRequestState = {
    courseEnrollmentsByStatus: {},
  },
}) => {
  // need to use router, to render component such as react-router's <Link>
  renderWithRouter(
    <AppContext.Provider value={INITIAL_APP_STATE}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
          <CourseEnrollmentsContext.Provider value={initialCourseEnrollmentsRequestState}>
            <CourseContextProvider initialState={courseInitState}>
              {enrollAction}
            </CourseContextProvider>
          </CourseEnrollmentsContext.Provider>
        </SubsidyRequestsContext.Provider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>,
  );
};

describe('Scenarios where user is enrolled in course', () => {
  test('to_courseware_page rendered with course info url for self paced course', () => {
    const enrollLabelText = 'hello enrollee!';
    const enrollAction = (
      <EnrollAction
        enrollmentType={TO_COURSEWARE_PAGE}
        enrollmentUrl="http://test"
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
        userEnrollment={verifiedTrackEnrollment}
        subscriptionLicense={subscriptionLicense}
        courseRunPrice={100}
      />
    );
    renderEnrollAction({ enrollAction });
    // check that enroll label provided, is rendered
    // check info url is rendered, instead of enrollment url (in this case)
    const actualUrl = screen.getByText(enrollLabelText).closest('a').href;
    expect(actualUrl)
      .toContain(verifiedTrackEnrollment.courseRunUrl);
  });
  test('view_on_dashboard link is rendered with enterprise slug url as course has not started', () => {
    const enrollLabelText = 'hello enrollee!';
    const enrollAction = (
      <EnrollAction
        enrollmentType={VIEW_ON_DASHBOARD}
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
        courseRunPrice={100}
      />
    );
    renderEnrollAction({ enrollAction });

    // the slug in the url comes from the appcontext passed when rendering.
    const actualUrl = screen.getByText(enrollLabelText).closest('a').href;
    expect(actualUrl).toContain(`${INITIAL_APP_STATE.enterpriseConfig.slug}`);
  });
});

describe('scenarios when use is not enrolled and is not eligible to', () => {
  test('disabled div rendered when enrollmentType is ENROLL_DISABLED', () => {
    const enrollLabelText = 'disabled text!';
    const enrollAction = (
      <EnrollAction
        enrollmentType={ENROLL_DISABLED}
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
        courseRunPrice={100}
      />
    );
    renderEnrollAction({ enrollAction });

    // ensure no link is rendered but label text is
    expect(screen.queryByText(enrollLabelText)).toBeInTheDocument();
    expect(screen.queryByText(enrollLabelText).closest('a')).not.toBeInTheDocument();
  });
});

describe('scenarios user not yet enrolled, but eligible to enroll', () => {
  const enrollmentUrl = 'http://test';
  const enrollLabelText = 'disabled text!';
  test('datasharing consent link rendered when enrollmentType is TO_DATASHARING_CONSENT', () => {
    const enrollAction = (
      <EnrollAction
        enrollmentType={TO_DATASHARING_CONSENT}
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
        enrollmentUrl={enrollmentUrl}
        courseRunPrice={100}
        triggerLicenseSubsidyEvent
      />
    );
    renderEnrollAction({ enrollAction });

    // ensure link is rendered and label text too
    expect(screen.queryByText(enrollLabelText)).toBeInTheDocument();
    const actualUrl = screen.getByText(enrollLabelText).closest('a').href;
    expect(actualUrl).toContain(`${enrollmentUrl}`);

    const enrollButton = screen.getByText(enrollLabelText);
    fireEvent.click(enrollButton);
  });
  test('<ToEcomBasketPage /> is rendered if enrollmentType is TO_ECOM_BASKET', () => {
    const enrollAction = (
      <EnrollAction
        enrollmentType={TO_ECOM_BASKET}
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
        enrollmentUrl={enrollmentUrl}
        courseRunPrice={100}
      />
    );
    // this initialUserSubsidyState is passed as a value to the UserSubsidyContext.provider
    // which is then used by a hook to check if the user has a license
    renderEnrollAction({
      enrollAction,
    });

    expect(screen.getByText('<ToEcomBasketPage />'));
  });
});
