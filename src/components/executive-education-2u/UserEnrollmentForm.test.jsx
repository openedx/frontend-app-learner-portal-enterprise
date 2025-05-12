import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { snakeCaseObject } from '@edx/frontend-platform/utils';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import dayjs from 'dayjs';
import MockDate from 'mockdate';

import { QueryClientProvider } from '@tanstack/react-query';
import UserEnrollmentForm from './UserEnrollmentForm';
import { checkoutExecutiveEducation2U, toISOStringWithoutMilliseconds } from './data';
import { useStatefulEnroll } from '../stateful-enroll/data';
import { CourseContext } from '../course/CourseContextProvider';
import {
  LEARNER_CREDIT_SUBSIDY_TYPE,
  queryCanRedeemContextQueryKey,
  queryEnterpriseCourseEnrollments,
  queryEnterpriseLearnerDashboardBFF,
  queryRedeemablePolicies,
  useCourseMetadata,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useIsBFFEnabled,
} from '../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../app/data/services/data/__factories__';
import { queryClient, renderWithRouter, renderWithRouterProvider } from '../../utils/tests';
import { useUserSubsidyApplicableToCourse } from '../course/data';

const termsLabelText = "I agree to GetSmarter's Terms and Conditions for Students";
const termsAndConsitionCTA = 'Terms and Conditions';
const dataSharingConsentLabelText = 'I have read and accepted GetSmarter\'s data sharing consent';

const mockFirstName = 'John';
const mockLastName = 'Doe';
const mockDateOfBirth = '1993-06-10';
const mockProductSKU = 'ABC123';
const mockCourseKey = 'edX+DemoX';
const mockCourseRunKey = 'course-v1:edX+DemoX+Demo_Course';

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logInfo: jest.fn(),
  logError: jest.fn(),
}));
jest.mock('@edx/frontend-enterprise-utils');
jest.mock('./data', () => ({
  ...jest.requireActual('./data'),
  checkoutExecutiveEducation2U: jest.fn(),
}));

const mockRedeem = jest.fn();
jest.mock('../stateful-enroll/data', () => ({
  ...jest.requireActual('../stateful-enroll/data'),
  useStatefulEnroll: jest.fn(() => mockRedeem),
}));

jest.mock('../app/data', () => ({
  ...jest.requireActual('../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
  useCourseMetadata: jest.fn(),
  useIsBFFEnabled: jest.fn(),
}));

jest.mock('../course/data', () => ({
  ...jest.requireActual('../course/data'),
  useUserSubsidyApplicableToCourse: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory({
  enable_executive_education_2u_fulfillment: true,
  enable_data_sharing_consent: true,
});
const mockEnterpriseCustomerWithDisabledDataSharingConsent = enterpriseCustomerFactory({
  enable_executive_education_2u_fulfillment: true,
  enable_data_sharing_consent: false,
});

const mockEnterpriseCourseEnrollmentsState = {
  enterpriseCourseEnrollments: [],
  allEnrollmentsByStatus: {
    inProgress: [],
    upcoming: [],
    completed: [],
    savedForLater: [],
    requested: [],
    assigned: [],
  },
};

const mockAuthenticatedUser = authenticatedUserFactory();

const initialAppContextValue = {
  authenticatedUser: mockAuthenticatedUser,
};

let mockQueryClient;
let invalidateQueriesSpy;
const UserEnrollmentFormWrapper = ({
  appContextValue = initialAppContextValue,
  courseContextValue = {
    state: {
      userEnrollments: [],
    },
    setExternalFormSubmissionError: jest.fn(),
    formSubmissionError: {},
  },
}) => {
  mockQueryClient = queryClient();
  invalidateQueriesSpy = jest.spyOn(mockQueryClient, 'invalidateQueries');
  return (
    <IntlProvider locale="en">
      <QueryClientProvider client={mockQueryClient}>
        <AppContext.Provider value={appContextValue}>
          <CourseContext.Provider value={courseContextValue}>
            <UserEnrollmentForm />
          </CourseContext.Provider>
        </AppContext.Provider>
      </QueryClientProvider>
    </IntlProvider>
  );
};

describe('UserEnrollmentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useEnterpriseCourseEnrollments.mockReturnValue({
      data: mockEnterpriseCourseEnrollmentsState,
    });
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: {},
      missingUserSubsidyReason: undefined,
    });
    useCourseMetadata.mockReturnValue({ data: {} });
    useIsBFFEnabled.mockReturnValue(false);
  });

  afterEach(() => {
    MockDate.reset();
  });

  it('has course enrollment information section and handles validation', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UserEnrollmentFormWrapper />);
    expect(screen.getByText('Course enrollment information')).toBeInTheDocument();

    // form fields
    expect(screen.getByLabelText('First name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of birth *')).toBeInTheDocument();

    // validation
    await user.click(screen.getByText('Confirm registration'));

    expect(await screen.findByText('First name is required')).toBeInTheDocument();
    expect(await screen.findByText('Last name is required')).toBeInTheDocument();
    expect(await screen.findByText('Date of birth is required')).toBeInTheDocument();
    expect(await screen.findByText("Please agree to GetSmarter's data sharing consent")).toBeInTheDocument();
    expect(await screen.findByText('Please agree to Terms and Conditions for Students')).toBeInTheDocument();

    // typing in fields after form submission clears validation
    await user.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    await user.type(screen.getByLabelText('First name *'), mockFirstName);
    await user.type(screen.getByLabelText('Last name *'), mockLastName);
    await user.click(screen.getByLabelText(dataSharingConsentLabelText));
    await user.click(screen.getByLabelText(termsLabelText));
    await user.click(screen.getByText(termsAndConsitionCTA));

    await waitFor(() => {
      expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Last name is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Date of birth is required')).not.toBeInTheDocument();
      expect(screen.queryByText("Please agree to GetSmarter's data sharing consent")).not.toBeInTheDocument();
      expect(screen.queryByText('Please agree to Terms and Conditions for Students')).not.toBeInTheDocument();
    });
  });

  it('has terms and conditions checkbox', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UserEnrollmentFormWrapper />);

    // form fields
    expect(screen.getByLabelText(termsLabelText)).toBeInTheDocument();

    // validation
    await user.click(screen.getByText('Confirm registration'));
    expect(await screen.findByText('Please agree to Terms and Conditions for Students')).toBeInTheDocument();

    // checking the checkbox after form submission clears validation
    await user.click(screen.getByLabelText(termsLabelText));
    await waitFor(() => {
      expect(screen.queryByText('Please agree to Terms and Conditions for Students')).not.toBeInTheDocument();
    });
  });

  it('has data sharing consent checkbox', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UserEnrollmentFormWrapper />);

    // form fields
    expect(screen.getByLabelText(dataSharingConsentLabelText)).toBeInTheDocument();

    // validation
    await user.click(screen.getByText('Confirm registration'));
    expect(await screen.findByText("Please agree to GetSmarter's data sharing consent")).toBeInTheDocument();

    // checking the checkbox after form submission clears validation
    await user.click(screen.getByLabelText(dataSharingConsentLabelText));
    await waitFor(() => {
      expect(screen.queryByText("Please agree to GetSmarter's data sharing consent")).not.toBeInTheDocument();
    });
  });

  it('does not have data sharing consent checkbox if data sharing consent is disabled', async () => {
    const user = userEvent.setup();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithDisabledDataSharingConsent });
    renderWithRouter(<UserEnrollmentFormWrapper />);

    // form fields
    await waitFor(() => {
      expect(screen.getByLabelText(termsLabelText)).toBeInTheDocument();
      expect(screen.queryByLabelText(dataSharingConsentLabelText)).not.toBeInTheDocument();
    });

    // validation
    await user.click(screen.getByText('Confirm registration'));
    await waitFor(() => {
      expect(screen.queryByText("Please agree to GetSmarter's data sharing consent")).not.toBeInTheDocument();
    });
  });

  it.each([
    // BFF Disabled
    {
      isBFFEnabled: false,
      isDSCEnabled: false,
    },
    {
      isBFFEnabled: false,
      isDSCEnabled: true,
    },
    // BFF Enabled
    {
      isBFFEnabled: true,
      isDSCEnabled: false,
    },
    {
      isBFFEnabled: true,
      isDSCEnabled: true,
    },
  ])('handles successful form submission with subsidy access policy redemption (%s)', async ({
    isBFFEnabled,
    isDSCEnabled,
  }) => {
    const user = userEvent.setup();
    const mockTermsAcceptedAt = '2022-09-28T13:35:06Z';
    MockDate.set(mockTermsAcceptedAt);
    useIsBFFEnabled.mockReturnValue(isBFFEnabled);
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: {
        subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
      },
      isPending: false,
    });
    const expectedEnterpriseCustomer = isDSCEnabled
      ? mockEnterpriseCustomer
      : mockEnterpriseCustomerWithDisabledDataSharingConsent;
    if (!isDSCEnabled) {
      useEnterpriseCustomer.mockReturnValue({ data: expectedEnterpriseCustomer });
    }

    const mockExternalEnrollmentUrl = `/${mockEnterpriseCustomer.slug}/executive-education-2u/course/${mockCourseKey}/enroll/${mockCourseRunKey}`;
    renderWithRouterProvider(
      {
        path: '/:enterpriseSlug/:courseType/course/:courseKey/enroll/:courseRunKey',
        element: <UserEnrollmentFormWrapper />,
      },
      {
        initialEntries: [mockExternalEnrollmentUrl],
        routes: [
          {
            path: '/:enterpriseSlug/:courseType/course/:courseKey/enroll/:courseRunKey/complete',
            element: <div data-testid="enrollment-confirmation" />,
          },
        ],
      },
    );

    await user.type(screen.getByLabelText('First name *'), mockFirstName);
    await user.type(screen.getByLabelText('Last name *'), mockLastName);
    await user.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    await user.click(screen.getByLabelText(termsLabelText));
    if (isDSCEnabled) {
      await user.click(screen.getByLabelText(dataSharingConsentLabelText));
    }
    await user.click(screen.getByText('Confirm registration'));

    await waitFor(() => {
      expect(screen.getByText('Confirming registration...').closest('button')).toHaveAttribute('aria-disabled', 'true');
    });
    expect(mockRedeem).toHaveBeenCalledTimes(1);
    expect(mockRedeem).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: snakeCaseObject({
          geagFirstName: mockFirstName,
          geagLastName: mockLastName,
          geagEmail: mockAuthenticatedUser.email,
          geagDateOfBirth: mockDateOfBirth,
          geagTermsAcceptedAt: mockTermsAcceptedAt,
          geagDataShareConsent: isDSCEnabled ? true : undefined,
        }),
      }),
    );

    // Ensure the contentKey from the URL is passed along to the redeem endpoint via useStatefulEnroll.
    expect(useStatefulEnroll.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        contentKey: mockCourseRunKey,
      }),
    );

    // simulate `useStatefulEnroll` calling `onSuccess` arg
    const newTransaction = { state: 'committed' };
    act(() => {
      useStatefulEnroll.mock.calls[0][0].onSuccess(newTransaction);
    });

    const canRedeemQueryKey = queryCanRedeemContextQueryKey(expectedEnterpriseCustomer.uuid, mockCourseKey);
    const redeemablePoliciesQueryKey = queryRedeemablePolicies({
      enterpriseUuid: expectedEnterpriseCustomer.uuid,
      lmsUserId: mockAuthenticatedUser.userId,
    }).queryKey;
    const enterpriseCourseEnrollmentsQueryKey = queryEnterpriseCourseEnrollments(
      expectedEnterpriseCustomer.uuid,
    ).queryKey;
    const expectedQueriesToInvalidate = [
      canRedeemQueryKey,
      redeemablePoliciesQueryKey,
      enterpriseCourseEnrollmentsQueryKey,
    ];

    if (isBFFEnabled) {
      const dashboardBFFQueryKey = queryEnterpriseLearnerDashboardBFF({
        enterpriseSlug: expectedEnterpriseCustomer.slug,
      }).queryKey;
      const expectedBFFQueriesToInvalidate = [dashboardBFFQueryKey];
      expectedQueriesToInvalidate.push(...expectedBFFQueriesToInvalidate);
    }

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(expectedQueriesToInvalidate.length);
      expectedQueriesToInvalidate.forEach((queryKey) => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith(
          expect.objectContaining({ queryKey }),
        );
      });

      // Redirected to the enrollment confirmation page
      expect(screen.getByTestId('enrollment-confirmation')).toBeInTheDocument();
    });
  });

  it('handles age related errors during form submission', async () => {
    const user = userEvent.setup();
    const mockTermsAcceptedAt = '2022-09-28T13:35:06Z';
    MockDate.set(mockTermsAcceptedAt);

    renderWithRouter(<UserEnrollmentFormWrapper />);
    await user.type(screen.getByLabelText('First name *'), mockFirstName);
    await user.type(screen.getByLabelText('Last name *'), mockLastName);
    // Set this year as date of birthday, so user is marked as less than 18 years old.
    await user.type(screen.getByLabelText('Date of birth *'), `${dayjs().year()}-06-10`);
    await user.click(screen.getByLabelText(termsLabelText));
    await user.click(screen.getByLabelText(dataSharingConsentLabelText));
    await user.click(screen.getByText('Confirm registration'));

    const invalidAgeErrorMessage = 'The date of birth you entered indicates '
      + 'that you are under the age of 18, and we need your parent or legal '
      + 'guardian to consent to your registration and GetSmarter processing '
      + 'your personal information.';

    await waitFor(() => {
      expect(screen.getByText(invalidAgeErrorMessage, { exact: false })).toBeInTheDocument();
      expect(checkoutExecutiveEducation2U).toHaveBeenCalledTimes(0);
    });
  });

  it('handles network error with form submission', async () => {
    const user = userEvent.setup();
    const mockError = new Error('oh noes');
    MockDate.set(new Date());
    const mockFormSubmissionValue = { message: 'oh noes' };

    renderWithRouter(<UserEnrollmentFormWrapper
      courseContextValue={{
        state: {
          userEnrollments: [],
        },
        setExternalCourseFormSubmissionError: jest.fn(),
        externalCourseFormSubmissionError: mockFormSubmissionValue,
      }}
    />);
    await user.type(screen.getByLabelText('First name *'), mockFirstName);
    await user.type(screen.getByLabelText('Last name *'), mockLastName);
    await user.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    await user.click(screen.getByLabelText(termsLabelText));
    await user.click(screen.getByLabelText(dataSharingConsentLabelText));
    await user.click(screen.getByText('Confirm registration'));

    // simulate `useStatefulEnroll` calling `onError` arg
    act(() => {
      useStatefulEnroll.mock.calls[0][0].onError(mockError);
    });

    await waitFor(() => {
      // no longer disabled after submitting
      expect(screen.getByText('Try again').closest('button')).toHaveAttribute('aria-disabled', 'false');
    });

    await waitFor(() => {
      expect(logError).toHaveBeenCalledTimes(1);
      expect(logError).toHaveBeenCalledWith(mockError);
    });

    await waitFor(() => {
      // ensure error alert is visible
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('An error occurred while sharing your course enrollment information', { exact: false })).toBeInTheDocument();
    });
  });

  it('handle error 422 where course was already enrolled in with legacy enterprise offers', async () => {
    const user = userEvent.setup();
    const mockCheckoutAlreadyEnrolledResponse = {
      message: 'Axios Error: User has already purchased the product.',
      customAttributes: {
        httpErrorStatus: 422,
      },
    };
    checkoutExecutiveEducation2U.mockRejectedValueOnce(mockCheckoutAlreadyEnrolledResponse);
    const mockTermsAcceptedAt = '2022-09-28T13:35:06Z';
    MockDate.set(mockTermsAcceptedAt);

    useCourseMetadata.mockReturnValue({ data: { courseEntitlementProductSku: mockProductSKU } });
    renderWithRouter(<UserEnrollmentFormWrapper />);
    await user.type(screen.getByLabelText('First name *'), mockFirstName);
    await user.type(screen.getByLabelText('Last name *'), mockLastName);
    await user.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    await user.click(screen.getByLabelText(termsLabelText));
    await user.click(screen.getByLabelText(dataSharingConsentLabelText));
    await user.click(screen.getByText('Confirm registration'));
    await waitFor(() => {
      expect(checkoutExecutiveEducation2U).toHaveBeenCalledTimes(1);
    });
    expect(checkoutExecutiveEducation2U).toHaveBeenCalledWith(
      expect.objectContaining({
        sku: mockProductSKU,
        userDetails: {
          dateOfBirth: mockDateOfBirth,
          firstName: mockFirstName,
          lastName: mockLastName,
        },
        termsAcceptedAt: toISOStringWithoutMilliseconds(new Date(mockTermsAcceptedAt).toISOString()),
        dataShareConsent: true,
      }),
    );

    await waitFor(() => {
      expect(logInfo).toHaveBeenCalledTimes(1);
      expect(logInfo).toHaveBeenCalledWith(`${mockEnterpriseCustomer.uuid} user ${mockAuthenticatedUser.userId} has already purchased course ABC123.`);
    });

    // disabled after submitting
    expect(screen.getByText('Registration confirmed').closest('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('handles duplicate order with form submission', async () => {
    const user = userEvent.setup();
    const mockError = new Error('duplicate order');
    MockDate.set(new Date());
    const mockFormSubmissionValue = { message: 'duplicate order' };
    renderWithRouter(<UserEnrollmentFormWrapper
      courseContextValue={{
        state: {
          userEnrollments: [],
        },
        setExternalCourseFormSubmissionError: jest.fn(),
        externalCourseFormSubmissionError: mockFormSubmissionValue,
      }}
    />);
    await user.type(screen.getByLabelText('First name *'), mockFirstName);
    await user.type(screen.getByLabelText('Last name *'), mockLastName);
    await user.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    await user.click(screen.getByLabelText(termsLabelText));
    await user.click(screen.getByLabelText(dataSharingConsentLabelText));
    await user.click(screen.getByText('Confirm registration'));

    // simulate `useStatefulEnroll` calling `onError` arg
    act(() => {
      useStatefulEnroll.mock.calls[0][0].onError(mockError);
    });

    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(mockError);

    await waitFor(() => {
      // ensure regular error alert is not visible
      expect(screen.queryByText('An error occurred while sharing your course enrollment information')).not.toBeInTheDocument();
    });
  });
});
