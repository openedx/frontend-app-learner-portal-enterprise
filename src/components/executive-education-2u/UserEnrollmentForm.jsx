import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  StatefulButton, Form, Hyperlink, CheckboxControl, Row, Col, Alert, Card, MailtoLink,
} from '@edx/paragon';
import {
  Formik,
  Form as FormikForm,
} from 'formik';
import isNil from 'lodash.isnil';
import { AppContext } from '@edx/frontend-platform/react';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { snakeCaseObject } from '@edx/frontend-platform/utils';
import { sendEnterpriseTrackEvent, sendEnterpriseTrackEventWithDelay } from '@edx/frontend-enterprise-utils';
import moment from 'moment/moment';
import reactStringReplace from 'react-string-replace';

import { checkoutExecutiveEducation2U, isDuplicateExternalCourseOrder, toISOStringWithoutMilliseconds } from './data';
import { useStatefulEnroll } from '../stateful-enroll/data';
import { LEARNER_CREDIT_SUBSIDY_TYPE } from '../course/data/constants';
import { CourseContext } from '../course/CourseContextProvider';

export const formValidationMessages = {
  firstNameRequired: 'First name is required',
  lastNameRequired: 'Last name is required',
  dateOfBirthRequired: 'Date of birth is required',
  invalidDateOfBirth:
    'The date of birth you entered indicates that you are under the age of 18, and we need your parent or legal '
    + 'guardian to consent to your registration and GetSmarter processing your personal information. '
    + 'Please reach out to privacy@getsmarter.com to proceed with your registration.',
  studentTermsAndConditionsRequired: 'Please agree to Terms and Conditions for Students',
  dataSharingConsentRequired: "Please agree to GetSmarter's data sharing consent",
};

const UserEnrollmentForm = ({
  className,
  productSKU,
  onCheckoutSuccess,
  activeCourseRun,
  userSubsidyApplicableToCourse,
}) => {
  const config = getConfig();
  const {
    enterpriseConfig: { uuid: enterpriseId, enableDataSharingConsent },
    authenticatedUser: { id: userId },
  } = useContext(AppContext);
  const {
    state: {
      userEnrollments,
    },
    externalCourseFormSubmissionError,
    setExternalCourseFormSubmissionError,
  } = useContext(CourseContext);

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [enrollButtonState, setEnrollButtonState] = useState('default');

  const handleFormSubmissionSuccess = async (newTransaction) => {
    // If a transaction is passed, it must be in the 'committed' state to proceed
    if (!isNil(newTransaction) && newTransaction.state !== 'committed') {
      return;
    }
    setEnrollButtonState('complete');
    await sendEnterpriseTrackEventWithDelay(
      enterpriseId,
      'edx.ui.enterprise.learner_portal.executive_education.checkout_form.submitted',
    );
    onCheckoutSuccess(newTransaction);
  };

  const { redeem } = useStatefulEnroll({
    contentKey: activeCourseRun.key,
    subsidyAccessPolicy: userSubsidyApplicableToCourse,
    onSuccess: handleFormSubmissionSuccess,
    onError: (error) => {
      setExternalCourseFormSubmissionError(error);
      setEnrollButtonState('error');
      logError(error);
    },
    userEnrollments,
  });

  const handleFormValidation = (values) => {
    if (!isFormSubmitted) {
      setIsFormSubmitted(true);
    }

    const errors = {};
    const is18YearsOld = moment().diff(moment(values.dateOfBirth), 'years') >= 18;

    if (!values.firstName) {
      errors.firstName = formValidationMessages.firstNameRequired;
    }
    if (!values.lastName) {
      errors.lastName = formValidationMessages.lastNameRequired;
    }
    if (!values.dateOfBirth) {
      errors.dateOfBirth = formValidationMessages.dateOfBirthRequired;
    } else if (!is18YearsOld) {
      errors.dateOfBirth = formValidationMessages.invalidDateOfBirth;
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

  const handleLearnerCreditFormSubmit = async (values) => {
    const userDetails = snakeCaseObject({
      geagFirstName: values.firstName,
      geagLastName: values.lastName,
      geagEmail: getAuthenticatedUser().email,
      geagDateOfBirth: values.dateOfBirth,
      geagTermsAcceptedAt: toISOStringWithoutMilliseconds(new Date(Date.now()).toISOString()),
      geagDataShareConsent: enableDataSharingConsent ? !!values.dataSharingConsent : undefined,
    });
    try {
      await redeem({ metadata: userDetails });
    } catch (error) {
      setExternalCourseFormSubmissionError(error);
      logError(error);
    }
  };

  const handleLegacyFormSubmit = async (values) => {
    try {
      await checkoutExecutiveEducation2U({
        sku: productSKU,
        userDetails: {
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: values.dateOfBirth,
        },
        termsAcceptedAt: toISOStringWithoutMilliseconds(new Date(Date.now()).toISOString()),
        dataShareConsent: enableDataSharingConsent ? !!values.dataSharingConsent : undefined,
      });
      await handleFormSubmissionSuccess();
    } catch (error) {
      const httpErrorStatus = error?.customAttributes?.httpErrorStatus;
      if (httpErrorStatus === 422 && error?.message?.includes('User has already purchased the product.')) {
        logInfo(`${enterpriseId} user ${userId} has already purchased course ${productSKU}.`);
        await handleFormSubmissionSuccess();
      } else {
        setExternalCourseFormSubmissionError(error);
        logError(error);
      }
    }
  };

  const handleFormSubmit = async (values) => {
    setEnrollButtonState('pending');
    if (userSubsidyApplicableToCourse.subsidyType === LEARNER_CREDIT_SUBSIDY_TYPE) {
      await handleLearnerCreditFormSubmit(values);
    } else {
      await handleLegacyFormSubmit(values);
    }
  };

  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
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
      }) => (
        <FormikForm className={className}>
          <Card
            className="mb-4 registration-summary"
            orientation="horizontal"
          >
            <Card.Body>
              <Card.Section>
                <h3 className="mb-2">Course enrollment information</h3>
                <Alert
                  variant="danger"
                  className="mb-4.5"
                  show={
                    externalCourseFormSubmissionError
                    && !isDuplicateExternalCourseOrder(externalCourseFormSubmissionError)
                  }
                  onClose={() => setExternalCourseFormSubmissionError(undefined)}
                  dismissible
                >
                  <p>
                    An error occurred while sharing your course enrollment information. Please try again.
                  </p>
                </Alert>
                <Row className="mb-4">
                  <Col xs={12} lg={6}>
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
                  <Col xs={12} lg={6}>
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
                        max={new Date().toISOString().split('T')[0]} // only allow before or on today's date
                      />
                      {errors.dateOfBirth && isFormSubmitted && (
                        <Form.Control.Feedback type="invalid">
                          {
                            reactStringReplace(
                              errors.dateOfBirth,
                              'privacy@getsmarter.com',
                              (match) => (
                                <MailtoLink to={match}>{match}</MailtoLink>
                              ),
                            )
                          }
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
                        <div className="small font-italic">
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
              </Card.Section>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-end">
            <StatefulButton
              type="submit"
              variant="primary"
              labels={{
                default: 'Confirm registration',
                pending: 'Confirming registration...',
                complete: 'Registration confirmed',
                error: externalCourseFormSubmissionError
                  && isDuplicateExternalCourseOrder(externalCourseFormSubmissionError)
                  ? 'Confirm registration'
                  : 'Try again',
              }}
              state={enrollButtonState}
              disabled={
                externalCourseFormSubmissionError
                && isDuplicateExternalCourseOrder(externalCourseFormSubmissionError)
              }
            />
          </div>
        </FormikForm>
      )}
    </Formik>
  );
};

UserEnrollmentForm.propTypes = {
  className: PropTypes.string,
  productSKU: PropTypes.string.isRequired,
  onCheckoutSuccess: PropTypes.func.isRequired,
  activeCourseRun: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
  userSubsidyApplicableToCourse: PropTypes.shape({
    subsidyType: PropTypes.string,
  }),
};

UserEnrollmentForm.defaultProps = {
  className: undefined,
  userSubsidyApplicableToCourse: undefined,
};

export default UserEnrollmentForm;
