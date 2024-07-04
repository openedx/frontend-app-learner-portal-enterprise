import React, { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Alert, Card, CheckboxControl, Col, Form, Hyperlink, MailtoLink, Row, StatefulButton,
} from '@openedx/paragon';
import { Form as FormikForm, Formik } from 'formik';
import isNil from 'lodash.isnil';
import { AppContext } from '@edx/frontend-platform/react';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { getConfig } from '@edx/frontend-platform/config';
import { snakeCaseObject } from '@edx/frontend-platform/utils';
import { sendEnterpriseTrackEvent, sendEnterpriseTrackEventWithDelay } from '@edx/frontend-enterprise-utils';
import dayjs from 'dayjs';
import reactStringReplace from 'react-string-replace';

import { useQueryClient } from '@tanstack/react-query';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { checkoutExecutiveEducation2U, isDuplicateExternalCourseOrder, toISOStringWithoutMilliseconds } from './data';
import { useStatefulEnroll } from '../stateful-enroll/data';
import { CourseContext } from '../course/CourseContextProvider';
import {
  LEARNER_CREDIT_SUBSIDY_TYPE,
  queryCanRedeemContextQueryKey,
  queryEnterpriseCourseEnrollments,
  queryRedeemablePolicies,
  useCourseMetadata,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
} from '../app/data';
import { useUserSubsidyApplicableToCourse } from '../course/data';

const UserEnrollmentForm = ({ className }) => {
  const navigate = useNavigate();
  const config = getConfig();
  const queryClient = useQueryClient();
  const intl = useIntl();
  const {
    authenticatedUser: { userId, email: userEmail },
  } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: enterpriseCourseEnrollments } = useEnterpriseCourseEnrollments();
  const { userSubsidyApplicableToCourse } = useUserSubsidyApplicableToCourse();
  const { courseKey, courseRunKey } = useParams();
  const {
    externalCourseFormSubmissionError,
    setExternalCourseFormSubmissionError,
  } = useContext(CourseContext);
  const { data: { courseEntitlementProductSku } } = useCourseMetadata();

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [enrollButtonState, setEnrollButtonState] = useState('default');

  const handleFormSubmissionSuccess = async (newTransaction) => {
    // If a transaction is passed, it must be in the 'committed' state to proceed
    if (!isNil(newTransaction) && newTransaction.state !== 'committed') {
      return;
    }

    const canRedeemQueryKey = queryCanRedeemContextQueryKey(enterpriseCustomer.uuid, courseKey);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: canRedeemQueryKey }),
      queryClient.invalidateQueries({
        queryKey: queryRedeemablePolicies({
          enterpriseUuid: enterpriseCustomer.uuid,
          lmsUserId: userId,
        }),
      }),
      queryClient.invalidateQueries({ queryKey: queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid) }),
      sendEnterpriseTrackEventWithDelay(
        enterpriseCustomer.uuid,
        'edx.ui.enterprise.learner_portal.executive_education.checkout_form.submitted',
      ),
    ]);
    setEnrollButtonState('complete');
    navigate('complete');
  };

  const { redeem } = useStatefulEnroll({
    contentKey: courseRunKey,
    subsidyAccessPolicy: userSubsidyApplicableToCourse,
    onSuccess: handleFormSubmissionSuccess,
    onError: (error) => {
      setExternalCourseFormSubmissionError(error);
      setEnrollButtonState('error');
      logError(error);
    },
    userEnrollments: enterpriseCourseEnrollments,
  });

  const handleFormValidation = (values) => {
    if (!isFormSubmitted) {
      setIsFormSubmitted(true);
    }

    const errors = {};
    const is18YearsOld = dayjs().diff(dayjs(values.dateOfBirth), 'years') >= 18;

    if (!values.firstName) {
      errors.firstName = intl.formatMessage({
        id: 'executive.education.external.course.enrollment.page.first.name.required',
        defaultMessage: 'First name is required',
        description: 'Error message for when first name is not provided',
      });
    }
    if (!values.lastName) {
      errors.lastName = intl.formatMessage({
        id: 'executive.education.external.course.enrollment.page.last.name.required',
        defaultMessage: 'Last name is required',
        description: 'Error message for when last name is not provided',
      });
    }
    if (!values.dateOfBirth) {
      errors.dateOfBirth = intl.formatMessage({
        id: 'executive.education.external.course.enrollment.page.date.of.birth.required',
        defaultMessage: 'Date of birth is required',
        description: 'Error message for when date of birth is not provided',
      });
    } else if (!is18YearsOld) {
      errors.dateOfBirth = intl.formatMessage(
        {
          id: 'executive.education.external.course.enrollment.page.date.of.birth.invalid',
          defaultMessage: 'The date of birth you entered indicates that you are under the age of 18, and we need your parent or legal guardian to consent to your registration and GetSmarter processing your personal information. Please reach out to {privacyEmail} to proceed with your registration.',
          description: 'Error message for when date of birth indicates the user is under 18 years old',
        },
        { privacyEmail: 'privacy@getsmarter.com' },
      );
    }
    if (!values.studentTermsAndConditions) {
      errors.studentTermsAndConditions = intl.formatMessage({
        id: 'executive.education.external.course.enrollment.page.student.terms.conditions.required',
        defaultMessage: 'Please agree to Terms and Conditions for Students',
        description: 'Error message for when student terms and conditions are not agreed to',
      });
    }
    if (enterpriseCustomer.enableDataSharingConsent && !values.dataSharingConsent) {
      errors.dataSharingConsent = intl.formatMessage({
        id: 'executive.education.external.course.enrollment.page.data.sharing.consent.required',
        defaultMessage: "Please agree to GetSmarter's data sharing consent",
        description: 'Error message for when data sharing consent is not agreed to. And here GetSmarter is brand name',
      });
    }

    // Only track validation errors during the initial submit
    if (!isFormSubmitted && errors) {
      sendEnterpriseTrackEvent(
        enterpriseCustomer.uuid,
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
      geagEmail: userEmail,
      geagDateOfBirth: values.dateOfBirth,
      geagTermsAcceptedAt: toISOStringWithoutMilliseconds(dayjs().toISOString()),
      geagDataShareConsent: enterpriseCustomer.enableDataSharingConsent ? !!values.dataSharingConsent : undefined,
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
        sku: courseEntitlementProductSku,
        userDetails: {
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: values.dateOfBirth,
        },
        termsAcceptedAt: toISOStringWithoutMilliseconds(dayjs().toISOString()),
        dataShareConsent: enterpriseCustomer.enableDataSharingConsent ? !!values.dataSharingConsent : undefined,
      });
      await handleFormSubmissionSuccess();
    } catch (error) {
      const httpErrorStatus = error?.customAttributes?.httpErrorStatus;
      if (httpErrorStatus === 422 && error?.message?.includes('User has already purchased the product.')) {
        logInfo(`${enterpriseCustomer.uuid} user ${userId} has already purchased course ${courseEntitlementProductSku}.`);
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
                <h3 className="mb-2">
                  <FormattedMessage
                    id="executive.education.external.course.enrollment.page.information.title"
                    defaultMessage="Course enrollment information"
                    description="Title of the form for getting user information for enrolling in the executive education course"
                  />
                </h3>
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
                    <FormattedMessage
                      id="executive.education.external.course.enrollment.page.sharing.information.error.message"
                      defaultMessage="An error occurred while sharing your course enrollment information. Please try again."
                      description="Error message when sharing course enrollment information"
                    />
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
                        floatingLabel={intl.formatMessage({
                          id: 'executive.education.external.course.enrollment.page.first.name.label',
                          defaultMessage: 'First name *',
                          description: 'First name label for the executive education course enrollment page. The * here shows that this field is required',
                        })}
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
                        floatingLabel={intl.formatMessage({
                          id: 'executive.education.external.course.enrollment.page.last.name.label',
                          defaultMessage: 'Last name *',
                          description: 'Last name label for the executive education course enrollment page. The * here shows that this field is required',
                        })}
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
                        floatingLabel={intl.formatMessage({
                          id: 'executive.education.external.course.enrollment.page.date.of.birth.label',
                          defaultMessage: 'Date of birth *',
                          description: 'Date of birth label for the executive education course enrollment page. The * here shows that this field is required',
                        })}
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
                {enterpriseCustomer.enableDataSharingConsent && (
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
                          <span aria-hidden>
                            <FormattedMessage
                              id="executive.education.external.course.enrollment.page.data.sharing.consent.label"
                              defaultMessage="I have read and accepted GetSmarter's <a>data sharing consent.</a>"
                              description="Data sharing consent label for the executive education course enrollment page. And here GetSmarter is brand name"
                              values={{
                                // eslint-disable-next-line react/no-unstable-nested-components
                                a: (chunks) => (
                                  <Hyperlink
                                    destination={config.GETSMARTER_PRIVACY_POLICY_URL}
                                    target="_blank"
                                  >
                                    {chunks}
                                  </Hyperlink>
                                ),
                              }}
                            />
                          </span>
                        </div>
                        <div className="small font-italic">
                          <FormattedMessage
                            id="executive.education.external.course.enrollment.page.data.sharing.consent.message"
                            defaultMessage="I acknowledge that information about my participation in the course will be shared with my
                           employer or funding entity, including my name, assessments of my performance such as grades,
                           and any perceived risk to my completion of the course."
                            description="Data sharing consent message for the executive education course enrollment page"
                          />
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
                          <FormattedMessage
                            id="executive.education.external.course.enrollment.page.student.terms.conditions.label"
                            defaultMessage="I have read and accepted GetSmarter's <a>Terms and Conditions</a> for Students"
                            description="Student terms and conditions label for the executive education course enrollment page. And here GetSmarter is brand name"
                            /* eslint-disable react/no-unstable-nested-components */
                            values={{
                              a: (chunks) => (
                                <Hyperlink
                                  destination={config.GETSMARTER_STUDENT_TC_URL}
                                  target="_blank"
                                  onClick={() => {
                                    sendEnterpriseTrackEvent(
                                      enterpriseCustomer.uuid,
                                      'edx.ui.enterprise.learner_portal.executive_education.checkout_form.student_terms_conditions.clicked',
                                    );
                                  }}
                                >
                                  {chunks}
                                </Hyperlink>
                              ),
                            }}
                          />
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
                      <FormattedMessage
                        id="executive.education.external.course.enrollment.page.finalizeRegistration.reuired.message"
                        defaultMessage="*Required"
                        description="Required message for the executive education course enrollment page. The * here means that this field on a form is required to fill"
                      />
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
                default: intl.formatMessage({
                  id: 'executive.education.external.course.enrollment.page.confirm.registration.button',
                  defaultMessage: 'Confirm registration',
                  description: 'Label for the button to submit user information for enrolling in the executive education course.',
                }),
                pending: intl.formatMessage({
                  id: 'executive.education.external.course.enrollment.page.confirming.registration.pending.button',
                  defaultMessage: 'Confirming registration...',
                  description: 'Label for the button in pending state while submitting user information for enrolling in the executive education course.',
                }),
                complete: intl.formatMessage({
                  id: 'executive.education.external.course.enrollment.page.registration.confirmed.button',
                  defaultMessage: 'Registration confirmed',
                  description: 'Label for the button when the user information for enrolling in the executive education course is confirmed.',
                }),
                error: externalCourseFormSubmissionError
                  && isDuplicateExternalCourseOrder(externalCourseFormSubmissionError)
                  ? intl.formatMessage({
                    id: 'executive.education.external.course.enrollment.page.duplicated.course.order.button',
                    defaultMessage: 'Confirm registration',
                    description: 'if user try to enroll in the same course again then we will show confirm regisrtaion text while button is disabled',
                  })
                  : intl.formatMessage({
                    id: 'executive.education.external.course.enrollment.page.try.again.cta',
                    defaultMessage: 'Try again',
                    description: 'if user try to not enroll in the same course again then we will show try again text in case of any other error',
                  }),
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
};

UserEnrollmentForm.defaultProps = {
  className: undefined,
};

export default UserEnrollmentForm;
