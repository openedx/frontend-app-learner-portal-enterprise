import React from 'react';
import {
  screen, render, waitFor, act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { snakeCaseObject } from '@edx/frontend-platform/utils';
import moment from 'moment/moment';

import UserEnrollmentForm, { formValidationMessages } from './UserEnrollmentForm';
import { checkoutExecutiveEducation2U, toISOStringWithoutMilliseconds } from './data';
import { ENTERPRISE_OFFER_SUBSIDY_TYPE, LEARNER_CREDIT_SUBSIDY_TYPE } from '../course/data/constants';
import { useStatefulEnroll } from '../stateful-enroll/data';
import { CourseContext } from '../course/CourseContextProvider';

const termsLabelText = 'I agree to GetSmarter\'s Terms and Conditions for Students';
const dataSharingConsentLabelText = 'I have read and accepted GetSmarter\'s data sharing consent';

const mockEnterpriseId = 'test-enterprise-id';
const mockFirstName = 'John';
const mockLastName = 'Doe';
const mockDateOfBirth = '1993-06-10';
const mockProductSKU = 'ABC123';
const mockEmail = 'edx@example.com';
const mockOnCheckoutSuccess = jest.fn();

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ id: 1, email: mockEmail }),
}));

const mockLogInfo = jest.fn();
const mockLogError = jest.fn();
jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logInfo: (msg) => mockLogInfo(msg),
  logError: (msg) => mockLogError(msg),
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

const initialAppContextValue = {
  enterpriseConfig: {
    name: 'Test Enterprise',
    uuid: 'test-enterprise-uuid',
    enableExecutiveEducation2UFulfillment: true,
    enableDataSharingConsent: true,
  },
  authenticatedUser: { id: 1 },
};

const mockActiveCourseRun = {
  key: 'course-v1:edX+DemoX+Demo_Course',
};
const mockUserSubsidyApplicableToCourse = {
  subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
};

const UserEnrollmentFormWrapper = ({
  appContextValue = initialAppContextValue,
  enterpriseId = mockEnterpriseId,
  productSKU = mockProductSKU,
  onCheckoutSuccess = mockOnCheckoutSuccess,
  activeCourseRun = mockActiveCourseRun,
  userSubsidyApplicableToCourse = mockUserSubsidyApplicableToCourse,
  courseContextValue = {
    state: {
      userEnrollments: [],
    },
    setFormSubmissionError: jest.fn(),
    formSubmissionError: {},
  },
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={appContextValue}>
      <CourseContext.Provider value={courseContextValue}>
        <UserEnrollmentForm
          enterpriseId={enterpriseId}
          productSKU={productSKU}
          onCheckoutSuccess={onCheckoutSuccess}
          activeCourseRun={activeCourseRun}
          userSubsidyApplicableToCourse={userSubsidyApplicableToCourse}
        />
      </CourseContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('UserEnrollmentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has course enrollment information section and handles validation', async () => {
    render(<UserEnrollmentFormWrapper />);
    expect(screen.getByText('Course enrollment information')).toBeInTheDocument();

    // form fields
    expect(screen.getByLabelText('First name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of birth *')).toBeInTheDocument();

    // validation
    userEvent.click(screen.getByText('Confirm registration'));

    expect(await screen.findByText(formValidationMessages.firstNameRequired)).toBeInTheDocument();
    expect(await screen.findByText(formValidationMessages.lastNameRequired)).toBeInTheDocument();
    expect(await screen.findByText(formValidationMessages.dateOfBirthRequired)).toBeInTheDocument();
    expect(await screen.findByText(formValidationMessages.dataSharingConsentRequired)).toBeInTheDocument();
    expect(await screen.findByText(formValidationMessages.studentTermsAndConditionsRequired)).toBeInTheDocument();

    // typing in fields after form submission clears validation
    userEvent.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    userEvent.click(screen.getByLabelText(dataSharingConsentLabelText));
    userEvent.click(screen.getByLabelText(termsLabelText));

    await waitFor(() => {
      expect(screen.queryByText(formValidationMessages.firstNameRequired)).not.toBeInTheDocument();
      expect(screen.queryByText(formValidationMessages.lastNameRequired)).not.toBeInTheDocument();
      expect(screen.queryByText(formValidationMessages.dateOfBirthRequired)).not.toBeInTheDocument();
      expect(screen.queryByText(formValidationMessages.dataSharingConsentRequired)).not.toBeInTheDocument();
      expect(screen.queryByText(formValidationMessages.studentTermsAndConditionsRequired)).not.toBeInTheDocument();
    });
  });

  it('has terms and conditions checkbox', async () => {
    render(<UserEnrollmentFormWrapper />);

    // form fields
    expect(screen.getByLabelText(termsLabelText)).toBeInTheDocument();

    // validation
    userEvent.click(screen.getByText('Confirm registration'));
    expect(await screen.findByText(formValidationMessages.studentTermsAndConditionsRequired)).toBeInTheDocument();

    // checking the checkbox after form submission clears validation
    userEvent.click(screen.getByLabelText(termsLabelText));
    await waitFor(() => {
      expect(screen.queryByText(formValidationMessages.studentTermsAndConditionsRequired)).not.toBeInTheDocument();
    });
  });

  it('has data sharing consent checkbox', async () => {
    render(<UserEnrollmentFormWrapper />);

    // form fields
    expect(screen.getByLabelText(dataSharingConsentLabelText)).toBeInTheDocument();

    // validation
    userEvent.click(screen.getByText('Confirm registration'));
    expect(await screen.findByText(formValidationMessages.dataSharingConsentRequired)).toBeInTheDocument();

    // checking the checkbox after form submission clears validation
    userEvent.click(screen.getByLabelText(dataSharingConsentLabelText));
    await waitFor(() => {
      expect(screen.queryByText(formValidationMessages.dataSharingConsentRequired)).not.toBeInTheDocument();
    });
  });

  it('does not have data sharing consent checkbox if data sharing consent is disabled', async () => {
    const appContext = {
      enterpriseConfig: {
        ...initialAppContextValue.enterpriseConfig,
        enableDataSharingConsent: false,
      },
      authenticatedUser: {
        ...initialAppContextValue.authenticatedUser,
      },
    };

    render(
      <UserEnrollmentFormWrapper appContextValue={appContext} />,
    );

    // form fields
    await waitFor(() => {
      expect(screen.queryByLabelText(dataSharingConsentLabelText)).not.toBeInTheDocument();
    });

    // validation
    userEvent.click(screen.getByText('Confirm registration'));
    await waitFor(() => {
      expect(screen.queryByText(formValidationMessages.dataSharingConsentRequired)).not.toBeInTheDocument();
    });
  });

  it('handles successful form submission with subsidy access policy redemption', async () => {
    const mockTermsAcceptedAt = '2022-09-28T13:35:06Z';
    Date.now = jest.fn(() => new Date(mockTermsAcceptedAt).valueOf());

    render(<UserEnrollmentFormWrapper />);
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
          geagEmail: mockEmail,
          geagDateOfBirth: mockDateOfBirth,
          geagTermsAcceptedAt: mockTermsAcceptedAt,
          geagDataShareConsent: true,
        }),
      }),
    );

    // simulate `useStatefulEnroll` calling `onSuccess` arg
    const newTransaction = { state: 'committed' };
    act(() => {
      useStatefulEnroll.mock.calls[0][0].onSuccess(newTransaction);
    });

    // disabled after submitting
    expect(screen.getByText('Registration confirmed').closest('button')).toHaveAttribute('aria-disabled', 'true');

    await waitFor(() => {
      expect(mockOnCheckoutSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnCheckoutSuccess).toHaveBeenCalledWith(newTransaction);
    });
  });

  it('handles successful form submission with data sharing consent disabled', async () => {
    const mockTermsAcceptedAt = '2022-09-28T13:35:06Z';
    Date.now = jest.fn(() => new Date(mockTermsAcceptedAt).valueOf());
    const appContext = {
      enterpriseConfig: {
        ...initialAppContextValue.enterpriseConfig,
        enableDataSharingConsent: false,
      },
      authenticatedUser: {
        ...initialAppContextValue.authenticatedUser,
      },
    };
    render(<UserEnrollmentFormWrapper appContextValue={appContext} />);

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
          geagEmail: mockEmail,
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

    await waitFor(() => {
      expect(mockOnCheckoutSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnCheckoutSuccess).toHaveBeenCalledWith(newTransaction);
    });
  });

  it('handles age related errors during form submission', async () => {
    const mockTermsAcceptedAt = '2022-09-28T13:35:06Z';
    Date.now = jest.fn(() => new Date(mockTermsAcceptedAt).valueOf());

    render(<UserEnrollmentFormWrapper />);
    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    // Set this year as date of birthday, so user is marked as less than 18 years old.
    userEvent.type(screen.getByLabelText('Date of birth *'), `${moment().year()}-06-10`);
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
    expect(mockOnCheckoutSuccess).toHaveBeenCalledTimes(0);
  });

  it('handles network error with form submission', async () => {
    const mockError = new Error('oh noes');
    Date.now = jest.fn(() => new Date().valueOf());
    const mockFormSubmissionValue = { message: 'oh noes' };

    render(<UserEnrollmentFormWrapper
      courseContextValue={{
        state: {
          userEnrollments: [],
        },
        setFormSubmissionError: jest.fn(),
        formSubmissionError: mockFormSubmissionValue,
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

    expect(mockLogError).toHaveBeenCalledTimes(1);
    expect(mockLogError).toHaveBeenCalledWith(mockError);

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
    Date.now = jest.fn(() => new Date(mockTermsAcceptedAt).valueOf());

    const userSubsidyApplicableToCourse = {
      subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
    };
    render(<UserEnrollmentFormWrapper userSubsidyApplicableToCourse={userSubsidyApplicableToCourse} />);
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
      expect(mockLogInfo).toHaveBeenCalledTimes(1);
      expect(mockLogInfo).toHaveBeenCalledWith('test-enterprise-uuid user 1 has already purchased course ABC123.');
      expect(mockOnCheckoutSuccess).toHaveBeenCalledTimes(1);
    });

    // disabled after submitting
    expect(screen.getByText('Registration confirmed').closest('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('handles duplicate order error form submission', async () => {
    const mockError = new Error('duplicate order');
    Date.now = jest.fn(() => new Date().valueOf());
    const mockFormSubmissionValue = { message: 'duplicate order' };

    render(<UserEnrollmentFormWrapper
      courseContextValue={{
        state: {
          userEnrollments: [],
        },
        setFormSubmissionError: jest.fn(),
        formSubmissionError: mockFormSubmissionValue,
      }}
    />);
    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    userEvent.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    userEvent.click(screen.getByLabelText(termsLabelText));
    userEvent.click(screen.getByLabelText(dataSharingConsentLabelText));
    userEvent.click(screen.getByText('Confirm registration'));

    // disabled while submitting
    // await waitFor(() => {
    //   expect(screen.getByText('Confirming registration...').closest('button')).toHaveAttribute('aria-disabled', 'true');
    // });

    // simulate `useStatefulEnroll` calling `onError` arg
    act(() => {
      useStatefulEnroll.mock.calls[0][0].onError(mockError);
    });

    // await waitFor(() => {
    //   // still disabled after submitting
    //   expect(screen.getByText('Try again').closest('button')).toHaveAttribute('aria-disabled', 'true');
    // });

    expect(mockLogError).toHaveBeenCalledTimes(1);
    expect(mockLogError).toHaveBeenCalledWith(mockError);

    await waitFor(() => {
      // ensure error alert is visible
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('You\'re already enrolled. Go to your GetSmarter dashboard to keep learning.', { exact: false })).toBeInTheDocument();
    });
  });
});
