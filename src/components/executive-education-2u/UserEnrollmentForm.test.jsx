/* eslint-disable react/prop-types */
import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import UserEnrollmentForm, { formValidationMessages } from './UserEnrollmentForm';
import { checkoutExecutiveEducation2U } from './data';

const termsLabelText = 'I agree to GetSmarter\'s Terms and Conditions for Students';
const mockFirstName = 'John';
const mockLastName = 'Doe';

jest.mock('./data', () => ({
  ...jest.requireActual('./data'),
  checkoutExecutiveEducation2U: jest.fn(),
}));

describe('UserEnrollmentForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('has personal information section and handles validation', async () => {
    render(<UserEnrollmentForm />);
    expect(screen.getByText('Personal information')).toBeInTheDocument();

    // form fields
    expect(screen.getByLabelText('First name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name *')).toBeInTheDocument();

    // validation
    userEvent.click(screen.getByText('Submit enrollment information'));
    expect(await screen.findByText(formValidationMessages.firstNameRequired)).toBeInTheDocument();
    expect(await screen.findByText(formValidationMessages.lastNameRequired)).toBeInTheDocument();

    // typing in fields after form submission clears validation
    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    await waitFor(() => {
      expect(screen.queryByText(formValidationMessages.firstNameRequired)).not.toBeInTheDocument();
      expect(screen.queryByText(formValidationMessages.lastNameRequired)).not.toBeInTheDocument();
    });
  });

  it('has terms and conditions checkbox', async () => {
    render(<UserEnrollmentForm />);

    // form fields
    expect(screen.getByLabelText(termsLabelText)).toBeInTheDocument();

    // validation
    userEvent.click(screen.getByText('Submit enrollment information'));
    expect(await screen.findByText(formValidationMessages.studentTermsAndConditionsRequired)).toBeInTheDocument();

    // checking the checkbox after form submission clears validation
    userEvent.click(screen.getByLabelText(termsLabelText));
    await waitFor(() => {
      expect(screen.queryByText(formValidationMessages.studentTermsAndConditionsRequired)).not.toBeInTheDocument();
    });
  });

  it('handles successful form submission', async () => {
    checkoutExecutiveEducation2U.mockResolvedValueOnce();
    render(<UserEnrollmentForm />);
    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    userEvent.click(screen.getByLabelText(termsLabelText));
    userEvent.click(screen.getByText('Submit enrollment information'));

    // disabled while submitting
    expect(screen.getByText('Submit enrollment information')).toBeDisabled();

    await waitFor(() => {
      // no longer disabled after submitting
      expect(screen.getByText('Submit enrollment information')).not.toBeDisabled();
    });
  });

  it('handles network error with form submission', async () => {
    const mockError = new Error('oh noes');
    checkoutExecutiveEducation2U.mockRejectedValueOnce(mockError);
    render(<UserEnrollmentForm />);
    userEvent.type(screen.getByLabelText('First name *'), mockFirstName);
    userEvent.type(screen.getByLabelText('Last name *'), mockLastName);
    userEvent.click(screen.getByLabelText(termsLabelText));
    userEvent.click(screen.getByText('Submit enrollment information'));

    // disabled while submitting
    expect(screen.getByText('Submit enrollment information')).toBeDisabled();

    await waitFor(() => {
      // no longer disabled after submitting
      expect(screen.getByText('Submit enrollment information')).not.toBeDisabled();
    });
  });
});
