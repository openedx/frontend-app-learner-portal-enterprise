import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import userEvent from '@testing-library/user-event';

import {
  initialAppState,
  mockCourseState,
  renderWithRouterProvider,
} from '../../../../utils/tests';
import EnrollAction from '../EnrollAction';
import { enrollButtonTypes } from '../constants';
import { CourseContext } from '../../CourseContextProvider';
import {
  COURSE_MODES_MAP,
  useCourseMetadata,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
} from '../../../app/data';
import { enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';

jest.mock('../components/ToEcomBasketPage', () => ({
  __esModule: true,
  default: () => '<ToEcomBasketPage />',
}));

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useCourseMetadata: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
}));

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  shouldUpgradeUserEnrollment: jest.fn().mockReturnValue(false),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();

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
  TO_EXECUTIVE_EDUCATION_2U_ENROLLMENT,
  HIDE_BUTTON,
} = enrollButtonTypes;

const INITIAL_APP_STATE = initialAppState({});
const mockCourseMetadata = mockCourseState({});
const verifiedTrackEnrollment = {
  mode: COURSE_MODES_MAP.VERIFIED,
  isActive: true,
  courseRunId: mockCourseMetadata.activeCourseRun.key,
  linkToCourse: 'https://learning.edx.org',
};
const subscriptionLicense = { uuid: 'a-license' };

const EnrollLabel = (props) => (
  <div>{props.enrollLabelText}</div>
);

const mockCourseContextValue = {
  algoliaSearchParams: {},
};

const renderEnrollAction = ({ enrollAction }) => {
  useCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
  // need to use router, to render component such as react-router's <Link>
  renderWithRouterProvider({
    path: '/:enterpriseSlug/course/:courseKey',
    element: (
      <AppContext.Provider value={INITIAL_APP_STATE}>
        <CourseContext.Provider value={mockCourseContextValue}>
          {enrollAction}
        </CourseContext.Provider>
      </AppContext.Provider>
    ),
  }, {
    initialEntries: [`/${mockEnterpriseCustomer.slug}/course/edX+DemoX`],
  });
};

describe('Scenarios where user is enrolled in course', () => {
  const enrollmentUrl = 'http://test';
  const enrollLabelText = 'hello enrollee!';

  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  test('to_courseware_page rendered with course info url for self paced course', () => {
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
      .toContain(verifiedTrackEnrollment.linkToCourse);
  });

  test('view_on_dashboard link is rendered with enterprise slug url as course has not started', () => {
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
    expect(actualUrl).toContain(`${mockEnterpriseCustomer.slug}`);
  });

  test('to_executive_education_2u_enrollment link rendered when enrollmentType is TO_EXECUTIVE_EDUCATION_2U_ENROLLMENT', () => {
    const execEdLabelText = 'Enroll';
    const enrollAction = (
      <EnrollAction
        enrollmentType={TO_EXECUTIVE_EDUCATION_2U_ENROLLMENT}
        enrollLabel={<EnrollLabel enrollLabelText={execEdLabelText} />}
        enrollmentUrl={enrollmentUrl}
        courseRunPrice={100}
      />
    );
    renderEnrollAction({ enrollAction });

    // ensure link is rendered and label text too
    expect(screen.queryByText(execEdLabelText)).toBeInTheDocument();
    const actualUrl = screen.getByText(execEdLabelText).closest('a').href;
    expect(actualUrl).toContain(`${enrollmentUrl}`);
  });
});

describe('scenarios when use is not enrolled and is not eligible to', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

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

  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useEnterpriseCourseEnrollments.mockReturnValue({ data: { enterpriseCourseEnrollments: [] } });
  });

  test('data sharing consent link rendered when enrollmentType is TO_DATASHARING_CONSENT', () => {
    const enrollAction = (
      <EnrollAction
        enrollmentType={TO_DATASHARING_CONSENT}
        enrollLabel={<EnrollLabel enrollLabelText={enrollLabelText} />}
        enrollmentUrl={enrollmentUrl}
        courseRunPrice={100}
      />
    );
    renderEnrollAction({ enrollAction });

    // ensure link is rendered and label text too
    expect(screen.queryByText(enrollLabelText)).toBeInTheDocument();
    const actualUrl = screen.getByText(enrollLabelText).closest('a').href;
    expect(actualUrl).toContain(`${enrollmentUrl}`);

    const enrollButton = screen.getByText(enrollLabelText);
    userEvent.click(enrollButton);
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
    renderEnrollAction({ enrollAction });
    expect(screen.getByText('<ToEcomBasketPage />'));
  });
});

describe('edge cases', () => {
  test('no button rendered when enrollmentType is HIDE_BUTTON', () => {
    const enrollAction = (
      <EnrollAction
        enrollmentType={HIDE_BUTTON}
        enrollLabel={<EnrollLabel enrollLabelText="hello" />}
        courseRunPrice={100}
      />
    );
    renderEnrollAction({ enrollAction });
    expect(screen.queryByText('hello')).not.toBeInTheDocument();
  });

  test('no button rendered when enrollmentType is not recognized', () => {
    const enrollAction = (
      <EnrollAction
        enrollmentType="NOT_RECOGNIZED"
        enrollLabel={<EnrollLabel enrollLabelText="hello" />}
        courseRunPrice={100}
      />
    );
    renderEnrollAction({ enrollAction });
    expect(screen.queryByText('hello')).not.toBeInTheDocument();
  });
});
