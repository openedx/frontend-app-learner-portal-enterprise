import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  StatefulButton, Form, Hyperlink, CheckboxControl, Row, Col, Alert,
} from '@edx/paragon';
import {
  Formik,
  Form as FormikForm,
} from 'formik';
import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { getConfig } from '@edx/frontend-platform/config';
import { sendEnterpriseTrackEvent, sendEnterpriseTrackEventWithDelay } from '@edx/frontend-enterprise-utils';

import { checkoutExecutiveEducation2U } from './data';
import FormSectionHeading from './FormSectionHeading';

export const formValidationMessages = {
  firstNameRequired: 'First name is required',
  lastNameRequired: 'Last name is required',
  dateOfBirthRequired: 'Date of birth is required',
  studentTermsAndConditionsRequired: 'Please agree to Terms and Conditions for Students',
};

function UserEnrollmentForm({
  className,
  productSKU,
  onCheckoutSuccess,
}) {
  const { enterpriseConfig: { uuid: enterpriseId } } = useContext(AppContext);

  const config = getConfig();
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [formSubmissionError, setFormSubmissionError] = useState();

  const handleFormValidation = (values) => {
    const errors = {};
    if (!values.firstName) {
      errors.firstName = formValidationMessages.firstNameRequired;
    }
    if (!values.lastName) {
      errors.lastName = formValidationMessages.lastNameRequired;
    }
    if (!values.dateOfBirth) {
      errors.dateOfBirth = formValidationMessages.dateOfBirthRequired;
    }
    if (!values.studentTermsAndConditions) {
      errors.studentTermsAndConditions = formValidationMessages.studentTermsAndConditionsRequired;
    }

    // Only track validation errors during the initial submit
    if (!isFormSubmitted && errors) {
      sendEnterpriseTrackEvent(
        enterpriseId,
        'edx.ui.enterprise.learner_portal.executive_education.checkout_form.validation.failed',
        { errors },
      );
    }
    return errors;
  };

  const handleFormSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await checkoutExecutiveEducation2U({
        sku: productSKU,
        userDetails: {
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: values.dateOfBirth,
        },
        termsAcceptedAt: new Date(Date.now()).toISOString(),
      });

      await sendEnterpriseTrackEventWithDelay(
        enterpriseId,
        'edx.ui.enterprise.learner_portal.executive_education.checkout_form.submitted',
      );
      onCheckoutSuccess(result);
    } catch (error) {
      setFormSubmissionError(error);
      logError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        studentTermsAndConditions: false,
      }}
      validateOnChange={isFormSubmitted}
      validateOnBlur={isFormSubmitted}
      validate={handleFormValidation}
      onSubmit={handleFormSubmit}
    >
      {({
        values,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
      }) => (
        <FormikForm
          className={className}
          onSubmit={(e) => {
            handleSubmit(e);
            setIsFormSubmitted(true);
          }}
        >
          <Alert
            variant="danger"
            className="mb-4.5"
            show={!!formSubmissionError}
            onClose={() => setFormSubmissionError(undefined)}
            dismissible
          >
            <p>
              An error occurred while sharing your course enrollment information. Please try again.
            </p>
          </Alert>
          <FormSectionHeading>Personal information</FormSectionHeading>
          <Row className="mb-4">
            <Col xs={12} lg={3}>
              <Form.Group
                isInvalid={!!errors.firstName}
                className="mb-4.5 mb-lg-0"
              >
                <Form.Control
                  value={values.firstName}
                  floatingLabel="First name *"
                  name="firstName"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.firstName && isFormSubmitted && (
                  <Form.Control.Feedback type="invalid">
                    {errors.firstName}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
            <Col xs={12} lg={3}>
              <Form.Group
                isInvalid={!!errors.lastName}
              >
                <Form.Control
                  value={values.lastName}
                  floatingLabel="Last name *"
                  name="lastName"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.lastName && isFormSubmitted && (
                  <Form.Control.Feedback type="invalid">
                    {errors.lastName}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col xs={12} lg={3}>
              <Form.Group
                isInvalid={!!errors.dateOfBirth}
              >
                <Form.Control
                  type="date"
                  value={values.dateOfBirth}
                  floatingLabel="Date of birth *"
                  name="dateOfBirth"
                  placeholder="mm/dd/yyyy"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.dateOfBirth && isFormSubmitted && (
                  <Form.Control.Feedback type="invalid">
                    {errors.dateOfBirth}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group>
                <div className="d-flex align-items-center">
                  <CheckboxControl
                    className="flex-shrink-0"
                    checked={values.studentTermsAndConditions}
                    name="studentTermsAndConditions"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-label="I agree to GetSmarter's Terms and Conditions for Students"
                  />
                  <span aria-hidden>
                    I agree to GetSmarter&apos;s{' '}
                    <Hyperlink
                      destination={config.GETSMARTER_STUDENT_TC_URL}
                      target="_blank"
                      onClick={() => {
                        sendEnterpriseTrackEvent(
                          enterpriseId,
                          'edx.ui.enterprise.learner_portal.executive_education.checkout_form.student_terms_conditions.clicked',
                        );
                      }}
                    >
                      Terms and Conditions for Students
                    </Hyperlink>
                  </span>
                </div>
                {errors.studentTermsAndConditions && (
                  <Form.Control.Feedback type="invalid">
                    {errors.studentTermsAndConditions}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col xs={12} lg={8}>
              <p className="small">
                By providing these details you agree to the use of your data as described in our{' '}
                <Hyperlink destination={config.GETSMARTER_PRIVACY_POLICY_URL} target="_blank">privacy policy</Hyperlink>. By
                using our services or registering for a course, you agree to be bound by these terms. If you do not
                agree to be bound by these terms, or are not able to enter into a binding agreement then you may not
                register for a course or use our services.
              </p>
            </Col>
          </Row>
          <Row>
            <Col>
              <StatefulButton
                type="submit"
                variant="primary"
                labels={{
                  default: 'Submit enrollment information',
                  pending: 'Submitting enrollment information...',
                }}
                state={isSubmitting ? 'pending' : 'default'}
              />
            </Col>
          </Row>
        </FormikForm>
      )}
    </Formik>
  );
}

UserEnrollmentForm.propTypes = {
  className: PropTypes.string,
  productSKU: PropTypes.string.isRequired,
  onCheckoutSuccess: PropTypes.func.isRequired,
};

UserEnrollmentForm.defaultProps = {
  className: undefined,
};

export default UserEnrollmentForm;
