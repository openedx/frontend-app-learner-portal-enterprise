import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import moment from 'moment/moment';

import UserEnrollmentForm, { formValidationMessages } from './UserEnrollmentForm';
import { checkoutExecutiveEducation2U, toISOStringWithoutMilliseconds } from './data';

const termsLabelText = 'I agree to GetSmarter\'s Terms and Conditions for Students';
const dataSharingConsentLabelText = 'I have read and accepted GetSmarter\'s data sharing consent';

const mockEnterpriseId = 'test-enterprise-id';
const mockFirstName = 'John';
const mockLastName = 'Doe';
const mockDateOfBirth = '1993-06-10';
const mockProductSKU = 'ABC123';
const mockOnCheckoutSuccess = jest.fn();

jest.mock('@edx/frontend-enterprise-utils');
jest.mock('./data', () => ({
  ...jest.requireActual('./data'),
  checkoutExecutiveEducation2U: jest.fn(),
}));

const initialAppContextValue = {
  enterpriseConfig: {
    name: 'Test Enterprise',
    uuid: 'test-enterprise-uuid',
    enableExecutiveEducation2UFulfillment: true,
    enableDataSharingConsent: true,
  },
};

const UserEnrollmentFormWrapper = ({
  appContextValue = initialAppContextValue,
  enterpriseId = mockEnterpriseId,
  productSKU = mockProductSKU,
  onCheckoutSuccess = mockOnCheckoutSuccess,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={appContextValue}>
      <UserEnrollmentForm
        enterpriseId={enterpriseId}
        productSKU={productSKU}
        onCheckoutSuccess={onCheckoutSuccess}
      />
    </AppContext.Provider>
  </IntlProvider>
);

describe('UserEnrollmentForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
    };

    render(
      <UserEnrollmentFormWrapper appContextValue={appContext} />,
    );

    // form fields
    expect(await screen.queryByLabelText(dataSharingConsentLabelText)).not.toBeInTheDocument();

    // validation
    userEvent.click(screen.getByText('Confirm registration'));
    expect(await screen.queryByText(formValidationMessages.dataSharingConsentRequired)).not.toBeInTheDocument();
  });

  it('handles successful form submission', async () => {
    const mockCheckoutResponse = {
      receiptPageUrl: 'https://edx.org',
    };
    checkoutExecutiveEducation2U.mockResolvedValueOnce(mockCheckoutResponse);
    const mockTermsAcceptedAt = '2022-09-28T13:35:06Z';
    Date.now = jest.fn(() => new Date(mockTermsAcceptedAt).valueOf());

    render(<UserEnrollmentFormWrapper />);
    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    userEvent.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    userEvent.click(screen.getByLabelText(termsLabelText));
    userEvent.click(screen.getByLabelText(dataSharingConsentLabelText));
    userEvent.click(screen.getByText('Confirm registration'));

    // disabled while submitting
    expect(screen.getByText('Confirming registration...').closest('button')).toHaveAttribute('aria-disabled', 'true');

    await waitFor(() => {
      expect(checkoutExecutiveEducation2U).toHaveBeenCalledTimes(1);
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
    });
    expect(mockOnCheckoutSuccess).toHaveBeenCalledTimes(1);
    expect(mockOnCheckoutSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        receiptPageUrl: mockCheckoutResponse.receiptPageUrl,
      }),
    );

    // disabled after submitting
    expect(screen.getByText('Registration confirmed').closest('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('handles successful form submission with data sharing consent disabled', async () => {
    const mockCheckoutResponse = {
      receiptPageUrl: 'https://edx.org',
    };
    checkoutExecutiveEducation2U.mockResolvedValueOnce(mockCheckoutResponse);
    const mockTermsAcceptedAt = '2022-09-28T13:35:06Z';
    Date.now = jest.fn(() => new Date(mockTermsAcceptedAt).valueOf());
    const appContext = {
      enterpriseConfig: {
        ...initialAppContextValue.enterpriseConfig,
        enableDataSharingConsent: false,
      },
    };
    render(<UserEnrollmentFormWrapper appContextValue={appContext} />);

    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    userEvent.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    userEvent.click(screen.getByLabelText(termsLabelText));
    userEvent.click(screen.getByText('Confirm registration'));

    // disabled while submitting
    expect(screen.getByText('Confirming registration...').closest('button')).toHaveAttribute('aria-disabled', 'true');

    await waitFor(() => {
      expect(checkoutExecutiveEducation2U).toHaveBeenCalledTimes(1);
      expect(checkoutExecutiveEducation2U).toHaveBeenCalledWith(
        expect.objectContaining({
          sku: mockProductSKU,
          userDetails: {
            dateOfBirth: mockDateOfBirth,
            firstName: mockFirstName,
            lastName: mockLastName,
          },
          termsAcceptedAt: toISOStringWithoutMilliseconds(new Date(mockTermsAcceptedAt).toISOString()),
        }),
      );
    });
    expect(mockOnCheckoutSuccess).toHaveBeenCalledTimes(1);
    expect(mockOnCheckoutSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        receiptPageUrl: mockCheckoutResponse.receiptPageUrl,
      }),
    );

    // disabled after submitting
    expect(screen.getByText('Registration confirmed').closest('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('handles age related errors during form submission', async () => {
    const mockCheckoutResponse = {
      receiptPageUrl: 'https://edx.org',
    };
    checkoutExecutiveEducation2U.mockResolvedValueOnce(mockCheckoutResponse);
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

    await waitFor(() => {
      expect(screen.getByText(formValidationMessages.invalidDateOfBirth)).toBeInTheDocument();
      expect(checkoutExecutiveEducation2U).toHaveBeenCalledTimes(0);
    });
    expect(mockOnCheckoutSuccess).toHaveBeenCalledTimes(0);
  });

  it('handles network error with form submission', async () => {
    const mockError = new Error('oh noes');
    Date.now = jest.fn(() => new Date().valueOf());
    checkoutExecutiveEducation2U.mockRejectedValueOnce(mockError);
    render(<UserEnrollmentFormWrapper />);
    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    userEvent.type(screen.getByLabelText('Date of birth *'), mockDateOfBirth);
    userEvent.click(screen.getByLabelText(termsLabelText));
    userEvent.click(screen.getByLabelText(dataSharingConsentLabelText));
    userEvent.click(screen.getByText('Confirm registration'));

    // disabled while submitting
    expect(screen.getByText('Confirming registration...').closest('button')).toHaveAttribute('aria-disabled', 'true');

    await waitFor(() => {
      // no longer disabled after submitting
      expect(screen.getByText('Confirm registration').closest('button')).toHaveAttribute('aria-disabled', 'false');
    });

    // ensure error alert is visible
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('An error occurred while sharing your course enrollment information', { exact: false })).toBeInTheDocument();
  });
});
