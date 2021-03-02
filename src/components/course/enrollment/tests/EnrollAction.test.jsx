import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { AppContext } from '@edx/frontend-platform/react';

import { ENROLL_MODAL_TEXT_NO_OFFERS, createUseVoucherText } from '../../EnrollModal';
import {
  renderWithRouter,
  initialAppState,
  initialCourseState,
  A_100_PERCENT_OFFER,
} from '../../../../utils/tests';

import { createCourseInfoUrl } from '../../data/utils';
import { COURSE_MODES_MAP } from '../../data/constants';
import EnrollAction from '../EnrollAction';
import { enrollButtonTypes } from '../constants';
import { CourseContextProvider } from '../../CourseContextProvider';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';

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
  TO_VOUCHER_REDEEM,
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
  initialUserSubsidyState = {
    subscriptionLicense,
    offers: {
      offers: [],
      offersCount: 0,
    },
  },
}) => {
  // need to use router, to render component such as react-router's <Link>
  renderWithRouter(
    <AppContext.Provider value={INITIAL_APP_STATE}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <CourseContextProvider initialState={courseInitState}>
          {enrollAction}
        </CourseContextProvider>
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
      />
    );
    renderEnrollAction({ enrollAction });
    // check that enroll label provided, is rendered
    // check info url is rendered, instead of enrollment url (in this case)
    const actualUrl = screen.getByText(enrollLabelText).closest('a').href;
    expect(actualUrl)
      .toContain(createCourseInfoUrl({
        baseUrl: INITIAL_APP_STATE.config.LMS_BASE_URL,
        courseKey: selfPacedCourseWithLicenseSubsidy.activeCourseRun.key,
      }));
  });
  test('view_on_dashboard link is rendered with enterprise slug url as course has not started', () => {
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
});

describe('scenarios when use is not enrolled and is not eligible to', () => {
  test('disabled div rendered when enrollmentType is ENROLL_DISABLED', () => {
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
});

describe('scenarios user not yet enrolled, but eligible to enroll', () => {
  const A_COURSE_WITH_NO_SUBSCRIPTIONS = {
    ...selfPacedCourseWithLicenseSubsidy,
    catalog: {
      catalogList: ['a-catalog'],
    },
    userSubsidyApplicableToCourse: null,
  };
  const enrollmentUrl = 'http://test';
  const enrollLabelText = 'disabled text!';
  test('datasharing consent link rendered when enrollmentType is TO_DATASHARING_CONSENT', () => {
    const enrollAction = (
      <EnrollAction
        enrollmentType={TO_DATASHARING_CONSENT}
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
        enrollmentUrl={enrollmentUrl}
      />
    );
    renderEnrollAction({ enrollAction });

    // ensure link is rendered and label text too
    expect(screen.queryByText(enrollLabelText)).toBeInTheDocument();
    const actualUrl = screen.getByText(enrollLabelText).closest('a').href;
    expect(actualUrl).toContain(`${enrollmentUrl}`);
  });
  test('no vouchers text is rendered when enrollmentType is TO_ECOM_BASKET', () => {
    const enrollAction = (
      <EnrollAction
        enrollmentType={TO_ECOM_BASKET}
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
        enrollmentUrl={enrollmentUrl}
        subscriptionLicense={subscriptionLicense}
      />
    );
    // this initialUserSubsidyState is passed as a value to the UserSubsidyContext.provider
    // which is then used by a hook to check if the user has a license
    renderEnrollAction({
      enrollAction,
      initialUserSubsidyState: {
        subscriptionLicense,
        offers: { offers: [] },
      },
    });

    // ensure button is rendered with label text
    expect(screen.queryByText(enrollLabelText)).toBeInTheDocument();
    expect(screen.getByText(enrollLabelText).closest('button')).toBeInTheDocument();
    expect(screen.getByText(enrollLabelText).closest('a')).not.toBeInTheDocument();
    const regex = new RegExp().compile(ENROLL_MODAL_TEXT_NO_OFFERS);
    expect(screen.getByText(regex)).toBeInTheDocument();
  });
  test('ecom basket link rendered when enrollmentType is TO_ECOM_BASKET', () => {
    const enrollAction = (
      <EnrollAction
        enrollmentType={TO_ECOM_BASKET}
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
        enrollmentUrl={enrollmentUrl}
        subscriptionLicense={subscriptionLicense}
      />
    );
    // this initialUserSubsidyState is passed as a value to the UserSubsidyContext.provider
    // which is then used by a hook to check if the user has a license
    renderEnrollAction({
      enrollAction,
      initialUserSubsidyState: {
        subscriptionLicense,
        offers: { offers: [] },
      },
    });
    const PAYMENT_TEXT = 'Continue to payment';
    // also check url is rendered in the modal correctly
    expect(screen.queryByText(PAYMENT_TEXT)).toBeInTheDocument();
    expect(screen.getByText(PAYMENT_TEXT).closest('a')).toBeInTheDocument();
    const enrollmentUrlRendered = screen.getByText(PAYMENT_TEXT).closest('a').href;
    expect(enrollmentUrlRendered).toBe(`${ `${enrollmentUrl }/` }`); // don't see what adds the trailing slash
  });
  test('enroll text with voucher count is rendered when enrollmentType is TO_VOUCHER_REDEEM', () => {
    // offers must exist, subscriptionlicense must not, catalogs list must exist.
    // a catalog in the cataloglist must match the one in the offer (see `findOffersForCourse()`)
    const enrollAction = (
      <EnrollAction
        enrollmentType={TO_VOUCHER_REDEEM}
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
        enrollmentUrl={enrollmentUrl}
      />
    );
    // this initialUserSubsidyState is passed as a value to the UserSubsidyContext.provider
    // which is then used by a hook to check if the user has a license
    renderEnrollAction({
      enrollAction,
      courseInitState: A_COURSE_WITH_NO_SUBSCRIPTIONS,
      initialUserSubsidyState: {
        subscriptionLicense: null,
        offers: {
          offers: [A_100_PERCENT_OFFER],
          offersCount: 1,
        },
      },
    });

    // ensure button is rendered with label text indicating voucher count
    expect(screen.queryByText(enrollLabelText)).toBeInTheDocument();
    expect(screen.getByText(enrollLabelText).closest('button')).toBeInTheDocument();
    expect(screen.getByText(enrollLabelText).closest('a')).not.toBeInTheDocument();
    const regex = new RegExp().compile(createUseVoucherText(1));
    expect(screen.getByText(regex)).toBeInTheDocument();
  });
  test('ecom basket link rendered in modal when enrollmentType is TO_VOUCHER_REDEEM', () => {
    // offers must exist, subscriptionlicense must not, catalogs list must exist.
    // a catalog in the cataloglist must match the one in the offer (see `findOffersForCourse()`)
    const enrollAction = (
      <EnrollAction
        enrollmentType={TO_VOUCHER_REDEEM}
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
        enrollmentUrl={enrollmentUrl}
      />
    );
    // this initialUserSubsidyState is passed as a value to the UserSubsidyContext.provider
    // which is then used by a hook to check if the user has a license
    renderEnrollAction({
      enrollAction,
      courseInitState: A_COURSE_WITH_NO_SUBSCRIPTIONS,
      initialUserSubsidyState: {
        subscriptionLicense: null,
        offers: {
          offers: [A_100_PERCENT_OFFER],
          offersCount: 1,
        },
      },
    });

    // ensure button is rendered with label text indicating voucher count
    const PAYMENT_TEXT = 'Enroll in course';
    // also check url is rendered in the modal correctly
    expect(screen.queryByText(PAYMENT_TEXT)).toBeInTheDocument();
    expect(screen.getByText(PAYMENT_TEXT).closest('a')).toBeInTheDocument();
    const enrollmentUrlRendered = screen.getByText(PAYMENT_TEXT).closest('a').href;
    expect(enrollmentUrlRendered).toBe(`${ `${enrollmentUrl }/` }`); // don't see what adds the trailing slash
  });
});
