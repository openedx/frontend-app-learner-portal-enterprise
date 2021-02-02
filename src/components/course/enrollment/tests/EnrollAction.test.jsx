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
 * These tests verify that the correct enroll component is rendered. They do not test the enroll
 * label since that is tested separately. We just pass a pre-rendered enroll label for these tests.
 */
const {
  TO_COURSEWARE_PAGE,
  VIEW_ON_DASHBOARD,
} = enrollButtonTypes;

const INITIAL_APP_STATE = initialAppState({});

describe('Enroll action rendering for cases where user is enrolled in course', () => {
  const verifiedTrackEnrollment = {
    mode: COURSE_MODES_MAP.VERIFIED,
    isActive: true,
    courseDetails: {
      courseId: 'test-course-run-key',
    },
  };

  /**
   * Render EnrollAction which then renders correct component as per the enrollmentType param.
   *
   * @param {object} args Arguments.
   * @param {string} args.enrollmentType One of the enrollButtonTypes
   * @param {object} args.courseInitState initial course state to pass to CourseContext
   * @param {object} args.userEnrollment user Enrollment
   * @param {string} args.enrollLabelText optional, enroll label text
   */
  const renderEnrollAction = ({
    enrollmentType, courseInitState, userEnrollment, enrollLabelText = 'hello',
  }) => {
    const EnrollLabel = () => (
      <div>{enrollLabelText}</div>
    );

    // need to use router, to render component such as react-router's <Link>
    renderWithRouter(
      <AppContext.Provider value={INITIAL_APP_STATE}>
        <CourseContextProvider initialState={courseInitState}>
          <EnrollAction
            userEnrollment={userEnrollment}
            enrollmentType={enrollmentType}
            enrollmentUrl="http://test/url"
            enrollLabel={<EnrollLabel />}
          />
        </CourseContextProvider>
      </AppContext.Provider>,
    );
  };
  test(`to_courseware_page rendered with course info url for self paced course,
      scenario 1`, () => {
    const enrollLabelText = 'hello enrollee!';
    const selfPacedCourseWithLicenseSubsidy = initialCourseState({});
    renderEnrollAction({
      enrollmentType: TO_COURSEWARE_PAGE,
      courseInitState: selfPacedCourseWithLicenseSubsidy,
      userEnrollment: verifiedTrackEnrollment,
      enrollLabelText,
    });

    // check that enroll label provided, is rendered
    // check info url is rendered, instead of enrollment url (in this case)
    const actualUrl = screen.getByText(enrollLabelText).closest('a').href;
    expect(actualUrl)
      .toContain(`courses/${selfPacedCourseWithLicenseSubsidy.activeCourseRun.key}/info`);
  });
  test(`view_on_dashboard link is rendered with enterprise slug url as course has not started,
     scenario 2`, () => {
    const enrollLabelText = 'hello enrollee!';
    const selfPacedCourseWithLicenseSubsidy = initialCourseState({});
    renderEnrollAction({
      enrollmentType: VIEW_ON_DASHBOARD,
      courseInitState: selfPacedCourseWithLicenseSubsidy,
      userEnrollment: verifiedTrackEnrollment,
      enrollLabelText,
    });

    // the slug in the url comes from the appcontext passed when rendering.
    const actualUrl = screen.getByText(enrollLabelText).closest('a').href;
    expect(actualUrl).toContain(`${INITIAL_APP_STATE.enterpriseConfig.slug}`);
  });
});
