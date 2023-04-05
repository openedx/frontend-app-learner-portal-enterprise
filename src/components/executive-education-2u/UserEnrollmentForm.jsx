import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  StatefulButton, Form, Hyperlink, CheckboxControl, Row, Col, Alert, Card,
} from '@edx/paragon';
import {
  Formik,
  Form as FormikForm,
} from 'formik';
import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { getConfig } from '@edx/frontend-platform/config';
import { sendEnterpriseTrackEvent, sendEnterpriseTrackEventWithDelay } from '@edx/frontend-enterprise-utils';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import moment from 'moment/moment';
import { checkoutExecutiveEducation2U, toISOStringWithoutMilliseconds } from './data';

export const formValidationMessages = {
  dateOfBirthRequired: 'Date of birth is required',
  studentTermsAndConditionsRequired: 'Please agree to Terms and Conditions for Students',
  dataSharingConsentRequired: 'Please agree to Terms and Conditions for Date Sharing Consent',
};

const UserEnrollmentForm = ({
  className,
  productSKU,
  onCheckoutSuccess,
}) => {
  const { enterpriseConfig: { uuid: enterpriseId, enableDataSharingConsent } } = useContext(AppContext);
  const config = getConfig();
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isEnrollmentSubmitted, setIsEnrollmentSubmitted] = useState(false);
  const [formSubmissionError, setFormSubmissionError] = useState();
  const [isAgeValid, setIsAgeValid] = useState(true);
  const { name } = getAuthenticatedUser();
  const [firstName, middleName, lastName] = name?.split(' ') || [];

  const handleFormValidation = (values) => {
    const errors = {};
    if (!values.dateOfBirth) {
      errors.dateOfBirth = formValidationMessages.dateOfBirthRequired;
    }
    if (!values.studentTermsAndConditions) {
      errors.studentTermsAndConditions = formValidationMessages.studentTermsAndConditionsRequired;
    }
    if (enableDataSharingConsent && !values.dataSharingConsent) {
      errors.dataSharingConsent = formValidationMessages.dataSharingConsentRequired;
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
    const is18YearsOld = moment().diff(moment(values.dateOfBirth), 'years') >= 18;
    if (!is18YearsOld) {
      setIsAgeValid(false);
      return;
    }

    try {
      const result = await checkoutExecutiveEducation2U({
        sku: productSKU,
        userDetails: {
          dateOfBirth: values.dateOfBirth,
          firstName,
          lastName: lastName || middleName,
        },
        termsAcceptedAt: toISOStringWithoutMilliseconds(new Date(Date.now()).toISOString()),
        ...(enableDataSharingConsent ? { dataShareConsent: true } : {}),
      });

      await sendEnterpriseTrackEventWithDelay(
        enterpriseId,
        'edx.ui.enterprise.learner_portal.executive_education.checkout_form.submitted',
      );

      setIsEnrollmentSubmitted(true);
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
        dateOfBirth: '',
        studentTermsAndConditions: false,
        dataSharingConsent: false,
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
      }) => {
        const getButtonState = () => {
          if (isEnrollmentSubmitted) {
            return 'complete';
          }
          return isSubmitting ? 'pending' : 'default';
        };

        return (
          <FormikForm
            className={className}
            onSubmit={(e) => {
              handleSubmit(e);
              setIsFormSubmitted(true);
            }}
          >
            <Card
              className="mb-4 registration-summary"
              orientation="horizontal"
            >
              <Card.Body>
                <Card.Section>
                  <h3>Course enrollment information</h3>
                  <br />
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

                  <Row className="mb-4">
                    <Col xs={12} lg={12}>
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

                  {enableDataSharingConsent && (
                    <Row>
                      <Col>
                        <Form.Group>
                          <div className="d-flex align-items-center">
                            <CheckboxControl
                              className="flex-shrink-0"
                              checked={values.dataSharingConsent}
                              name="dataSharingConsent"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              aria-label="I have read and accepted GetSmarter's data sharing consent"
                            />
                            <span aria-hidden>I have read and accepted GetSmarter&apos;s data sharing consent.</span>
                          </div>
                          <div className="small text-italic">
                            I acknowledge that information about my participation in the course will be shared with my
                            employer or funding entity, including my name, assessments of my performance such as grades,
                            and any perceived risk to my completion of the course.
                          </div>
                          {errors.dataSharingConsent && (
                            <Form.Control.Feedback type="invalid">
                              {errors.dataSharingConsent}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
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
                            I have read and accepted GetSmarter&apos;s{' '}
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
                              Terms and Conditions
                            </Hyperlink>
                            &nbsp;for Students
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
                        *Required
                      </p>
                    </Col>
                  </Row>
                  {!isAgeValid && (
                    <Row className="mb-4 age-error-message">
                      <Col xs={12} lg={12}>
                        <p className="text-italic">
                          Unfortunately you don&apos;t meet minimum age requirement and without any parent or guardian
                          consent you can not proceed with your registration.
                        </p>
                      </Col>
                    </Row>
                  )}
                </Card.Section>
              </Card.Body>
            </Card>

            <Row>
              <Col className="justify-content-end">
                <Row className="justify-content-end">
                  {
                    isAgeValid && (
                      <StatefulButton
                        type="submit"
                        variant="danger"
                        labels={{
                          default: 'Confirm Registration',
                          pending: 'Submitting enrollment information...',
                          complete: 'Registration Confirmed',
                        }}
                        state={getButtonState()}
                      />
                    )
                  }
                </Row>
              </Col>
            </Row>
          </FormikForm>
        );
      }}
    </Formik>
  );
};

UserEnrollmentForm.propTypes = {
  className: PropTypes.string,
  productSKU: PropTypes.string.isRequired,
  onCheckoutSuccess: PropTypes.func.isRequired,
};

UserEnrollmentForm.defaultProps = {
  className: undefined,
};

export default UserEnrollmentForm;
