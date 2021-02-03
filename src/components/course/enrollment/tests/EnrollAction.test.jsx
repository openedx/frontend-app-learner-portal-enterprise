import React from 'react';
import { screen } from '@testing-library/react';
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
} = enrollButtonTypes;

const INITIAL_APP_STATE = initialAppState({});
const selfPacedCourseWithLicenseSubsidy = initialCourseState({});
const verifiedTrackEnrollment = {
  mode: COURSE_MODES_MAP.VERIFIED,
  isActive: true,
  courseDetails: {
    courseId: selfPacedCourseWithLicenseSubsidy.activeCourseRun.key,
  },
};
const subscriptionLicense = { uuid: 'a-license' };

describe('Enroll action rendering for cases where user is enrolled in course', () => {
  /**
   * @param {object} args Arguments.
   * @param {string} args.enrollAction
   */
  const EnrollLabel = (props) => (
    // eslint-disable-next-line react/prop-types
    <div>{props.enrollLabelText}</div>
  );
  const renderEnrollAction = ({
    enrollAction,
    courseInitState = selfPacedCourseWithLicenseSubsidy,
  }) => {
    // need to use router, to render component such as react-router's <Link>
    renderWithRouter(
      <AppContext.Provider value={INITIAL_APP_STATE}>
        <CourseContextProvider initialState={courseInitState}>
          {enrollAction}
        </CourseContextProvider>
      </AppContext.Provider>,
    );
  };

  test(`to_courseware_page rendered with course info url for self paced course,
      scenario 1`, () => {
    const enrollLabelText = 'hello enrollee!';
    const enrollAction = (
      <EnrollAction
        enrollmentType={TO_COURSEWARE_PAGE}
        enrollmentUrl="http://test"
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
        userEnrollment={verifiedTrackEnrollment}
        subscriptionLicense={subscriptionLicense}
      />
    );
    renderEnrollAction({ enrollAction });
    // check that enroll label provided, is rendered
    // check info url is rendered, instead of enrollment url (in this case)
    const actualUrl = screen.getByText(enrollLabelText).closest('a').href;
    expect(actualUrl)
      .toContain(`courses/${selfPacedCourseWithLicenseSubsidy.activeCourseRun.key}/info`);
  });
  test(`view_on_dashboard link is rendered with enterprise slug url as course has not started,
     scenario 2`, () => {
    const enrollLabelText = 'hello enrollee!';
    const enrollAction = (
      <EnrollAction
        enrollmentType={VIEW_ON_DASHBOARD}
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
      />
    );
    renderEnrollAction({ enrollAction });

    // the slug in the url comes from the appcontext passed when rendering.
    const actualUrl = screen.getByText(enrollLabelText).closest('a').href;
    expect(actualUrl).toContain(`${INITIAL_APP_STATE.enterpriseConfig.slug}`);
  });
  test(`disabled div rendered when enrollmentType is ENROLL_DISABLED,
     scenario 2`, () => {
    const enrollLabelText = 'disabled text!';
    const enrollAction = (
      <EnrollAction
        enrollmentType={ENROLL_DISABLED}
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
      />
    );
    renderEnrollAction({ enrollAction });

    // ensure no link is rendered but label text is
    expect(screen.queryByText(enrollLabelText)).toBeInTheDocument();
    expect(screen.queryByText(enrollLabelText).closest('a')).not.toBeInTheDocument();
  });
  test(`datasharing consent link rendered when enrollmentType is TO_DATASHARING_CONSENT,
     scenario 2`, () => {
    const enrollLabelText = 'disabled text!';
    const enrollmentUrl = 'http://test';
    const enrollAction = (
      <EnrollAction
        enrollmentType={TO_DATASHARING_CONSENT}
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
        enrollmentUrl={enrollmentUrl}
      />
    );
    renderEnrollAction({ enrollAction });

    // ensure no link is rendered but label text is
    expect(screen.queryByText(enrollLabelText)).toBeInTheDocument();
    const actualUrl = screen.getByText(enrollLabelText).closest('a').href;
    expect(actualUrl).toContain(`${enrollmentUrl}`);
  });
});
