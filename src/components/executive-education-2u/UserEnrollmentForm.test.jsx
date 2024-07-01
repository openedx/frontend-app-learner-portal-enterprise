import {
  act, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { snakeCaseObject } from '@edx/frontend-platform/utils';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import dayjs from 'dayjs';
import MockDate from 'mockdate';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import UserEnrollmentForm from './UserEnrollmentForm';
import { checkoutExecutiveEducation2U, toISOStringWithoutMilliseconds } from './data';
import { useStatefulEnroll } from '../stateful-enroll/data';
import { CourseContext } from '../course/CourseContextProvider';
import {
  LEARNER_CREDIT_SUBSIDY_TYPE,
  useCourseMetadata,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
} from '../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../app/data/services/data/__factories__';
import { renderWithRouter } from '../../utils/tests';
import { useUserSubsidyApplicableToCourse } from '../course/data';

const termsLabelText = "I agree to GetSmarter's Terms and Conditions for Students";
const termsAndConsitionCTA = 'Terms and Conditions';
const dataSharingConsentLabelText = 'I have read and accepted GetSmarter\'s data sharing consent';

const mockFirstName = 'John';
const mockLastName = 'Doe';
const mockDateOfBirth = '1993-06-10';
const mockProductSKU = 'ABC123';
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
  useStatefulEnroll: jest.fn(() => ({ redeem: mockRedeem })),
}));

jest.mock('../app/data', () => ({
  ...jest.requireActual('../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
  useCourseMetadata: jest.fn(),
}));

jest.mock('../course/data', () => ({
  ...jest.requireActual('../course/data'),
  useUserSubsidyApplicableToCourse: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
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

const queryClient = new QueryClient();

const UserEnrollmentFormWrapper = ({
  appContextValue = initialAppContextValue,
  courseContextValue = {
    state: {
      userEnrollments: [],
    },
    setExternalFormSubmissionError: jest.fn(),
    formSubmissionError: {},
  },
}) => (
  <IntlProvider locale="en">
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={appContextValue}>
        <CourseContext.Provider value={courseContextValue}>
          <UserEnrollmentForm />
        </CourseContext.Provider>
      </AppContext.Provider>
    </QueryClientProvider>
  </IntlProvider>
);

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
    useParams.mockReturnValue({ courseRunKey: mockCourseRunKey });
  });

  afterEach(() => {
    MockDate.reset();
  });

  it('has course enrollment information section and handles validation', async () => {
    renderWithRouter(<UserEnrollmentFormWrapper />);
    expect(screen.getByText('Course enrollment information')).toBeInTheDocument();

    // form fields
    expect(screen.getByLabelText('First name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of birth *')).toBeInTheDocument();

    // validation
    userEvent.click(screen.getByText('Confirm registration'));

    expect(await screen.findByText('First name is required')).toBeInTheDocument();
    expect(await screen.findByText('Last name is required')).toBeInTheDocument();
    expect(await screen.findByText('Date of birth is required')).toBeInTheDocument();
    expect(await screen.findByText("Please agree to GetSmarter's data sharing consent")).toBeInTheDocument();
    expect(await screen.findByText('Please agree to Terms and Conditions for Students')).toBeInTheDocument();

    // typing in fields after form submission clears validation
    userEvent.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    userEvent.click(screen.getByLabelText(dataSharingConsentLabelText));
    userEvent.click(screen.getByLabelText(termsLabelText));
    userEvent.click(screen.getByText(termsAndConsitionCTA));

    await waitFor(() => {
      expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Last name is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Date of birth is required')).not.toBeInTheDocument();
      expect(screen.queryByText("Please agree to GetSmarter's data sharing consent")).not.toBeInTheDocument();
      expect(screen.queryByText('Please agree to Terms and Conditions for Students')).not.toBeInTheDocument();
    });
  });

  it('has terms and conditions checkbox', async () => {
    renderWithRouter(<UserEnrollmentFormWrapper />);

    // form fields
    expect(screen.getByLabelText(termsLabelText)).toBeInTheDocument();

    // validation
    userEvent.click(screen.getByText('Confirm registration'));
    expect(await screen.findByText('Please agree to Terms and Conditions for Students')).toBeInTheDocument();

    // checking the checkbox after form submission clears validation
    userEvent.click(screen.getByLabelText(termsLabelText));
    await waitFor(() => {
      expect(screen.queryByText('Please agree to Terms and Conditions for Students')).not.toBeInTheDocument();
    });
  });

  it('has data sharing consent checkbox', async () => {
    renderWithRouter(<UserEnrollmentFormWrapper />);

    // form fields
    expect(screen.getByLabelText(dataSharingConsentLabelText)).toBeInTheDocument();

    // validation
    userEvent.click(screen.getByText('Confirm registration'));
    expect(await screen.findByText("Please agree to GetSmarter's data sharing consent")).toBeInTheDocument();

    // checking the checkbox after form submission clears validation
    userEvent.click(screen.getByLabelText(dataSharingConsentLabelText));
    await waitFor(() => {
      expect(screen.queryByText("Please agree to GetSmarter's data sharing consent")).not.toBeInTheDocument();
    });
  });

  it('does not have data sharing consent checkbox if data sharing consent is disabled', async () => {
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithDisabledDataSharingConsent });
    renderWithRouter(<UserEnrollmentFormWrapper />);

    // form fields
    await waitFor(() => {
      expect(screen.getByLabelText(termsLabelText)).toBeInTheDocument();
      expect(screen.queryByLabelText(dataSharingConsentLabelText)).not.toBeInTheDocument();
    });

    // validation
    userEvent.click(screen.getByText('Confirm registration'));
    await waitFor(() => {
      expect(screen.queryByText("Please agree to GetSmarter's data sharing consent")).not.toBeInTheDocument();
    });
  });

  it('handles successful form submission with subsidy access policy redemption', async () => {
    const mockTermsAcceptedAt = '2022-09-28T13:35:06Z';
    MockDate.set(mockTermsAcceptedAt);

    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: {
        subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
      },
    });
    renderWithRouter(<UserEnrollmentFormWrapper />);
    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    userEvent.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    userEvent.click(screen.getByLabelText(termsLabelText));
    userEvent.click(screen.getByLabelText(dataSharingConsentLabelText));
    userEvent.click(screen.getByText('Confirm registration'));

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
          geagDataShareConsent: true,
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

    // disabled after submitting
    await waitFor(() => expect(screen.getByText('Registration confirmed').closest('button')).toHaveAttribute('aria-disabled', 'true'));
  });

  it('handles successful form submission with data sharing consent disabled', async () => {
    const mockTermsAcceptedAt = '2022-09-28T13:35:06Z';
    MockDate.set(mockTermsAcceptedAt);

    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: {
        subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
      },
    });
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithDisabledDataSharingConsent });
    renderWithRouter(<UserEnrollmentFormWrapper />);

    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    userEvent.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    userEvent.click(screen.getByLabelText(termsLabelText));
    userEvent.click(screen.getByText('Confirm registration'));

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
          geagDataShareConsent: undefined,
        }),
      }),
    );

    // simulate `useStatefulEnroll` calling `onSuccess` arg
    const newTransaction = { state: 'committed' };
    act(() => {
      useStatefulEnroll.mock.calls[0][0].onSuccess(newTransaction);
    });
  });

  it('handles age related errors during form submission', async () => {
    const mockTermsAcceptedAt = '2022-09-28T13:35:06Z';
    MockDate.set(mockTermsAcceptedAt);

    renderWithRouter(<UserEnrollmentFormWrapper />);
    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    // Set this year as date of birthday, so user is marked as less than 18 years old.
    userEvent.type(screen.getByLabelText('Date of birth *'), `${dayjs().year()}-06-10`);
    userEvent.click(screen.getByLabelText(termsLabelText));
    userEvent.click(screen.getByLabelText(dataSharingConsentLabelText));
    userEvent.click(screen.getByText('Confirm registration'));

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
    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    userEvent.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    userEvent.click(screen.getByLabelText(termsLabelText));
    userEvent.click(screen.getByLabelText(dataSharingConsentLabelText));
    userEvent.click(screen.getByText('Confirm registration'));

    // disabled while submitting
    await waitFor(() => {
      expect(screen.getByText('Confirming registration...').closest('button')).toHaveAttribute('aria-disabled', 'true');
    });

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
    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    userEvent.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    userEvent.click(screen.getByLabelText(termsLabelText));
    userEvent.click(screen.getByLabelText(dataSharingConsentLabelText));
    userEvent.click(screen.getByText('Confirm registration'));

    // disabled while submitting
    await waitFor(() => {
      expect(screen.getByText('Confirming registration...').closest('button')).toHaveAttribute('aria-disabled', 'true');
    });

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
    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    userEvent.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    userEvent.click(screen.getByLabelText(termsLabelText));
    userEvent.click(screen.getByLabelText(dataSharingConsentLabelText));
    userEvent.click(screen.getByText('Confirm registration'));

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
