import React, { createContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  COUPON_CODE_SUBSIDY_TYPE,
  DISABLED_ENROLL_REASON_TYPES,
  DISABLED_ENROLL_USER_MESSAGES,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  LEARNER_CREDIT_SUBSIDY_TYPE,
  LICENSE_SUBSIDY_TYPE,
} from './data/constants';

export const CourseContext = createContext();

export const CourseContextProvider = ({
  children,
  courseState,
  isPolicyRedemptionEnabled,
  missingUserSubsidyReason,
  userSubsidyApplicableToCourse,
  redeemabilityPerContentKey,
  hasSuccessfulRedemption,
  subsidyRequestCatalogsApplicableToCourse,
  userCanRequestSubsidyForCourse,
  coursePrice,
  currency,
  canOnlyViewHighlightSets,
}) => {
  const [formSubmissionError, setFormSubmissionError] = useState(null);

  const value = useMemo(() => ({
    state: courseState,
    userCanRequestSubsidyForCourse,
    subsidyRequestCatalogsApplicableToCourse,
    isPolicyRedemptionEnabled,
    missingUserSubsidyReason,
    userSubsidyApplicableToCourse,
    redeemabilityPerContentKey,
    hasSuccessfulRedemption,
    coursePrice,
    currency,
    canOnlyViewHighlightSets,
    formSubmissionError,
    setFormSubmissionError,
  }), [
    courseState,
    userCanRequestSubsidyForCourse,
    subsidyRequestCatalogsApplicableToCourse,
    isPolicyRedemptionEnabled,
    missingUserSubsidyReason,
    userSubsidyApplicableToCourse,
    redeemabilityPerContentKey,
    hasSuccessfulRedemption,
    coursePrice,
    currency,
    canOnlyViewHighlightSets,
    formSubmissionError,
    setFormSubmissionError,
  ]);

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

CourseContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  courseState: PropTypes.shape({
    course: PropTypes.shape({}).isRequired,
    activeCourseRun: PropTypes.shape(),
    userEnrollments: PropTypes.arrayOf(PropTypes.shape({
      isEnrollmentActive: PropTypes.bool.isRequired,
      isRevoked: PropTypes.bool.isRequired,
      courseRunId: PropTypes.string.isRequired,
      mode: PropTypes.string.isRequired,
    })).isRequired,
    userEntitlements: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    catalog: PropTypes.shape({}).isRequired,
    courseRecommendations: PropTypes.shape({}).isRequired,
    courseReviews: PropTypes.shape({}),
  }).isRequired,
  isPolicyRedemptionEnabled: PropTypes.bool,
  missingUserSubsidyReason: PropTypes.shape({
    reason: PropTypes.oneOf(Object.values(DISABLED_ENROLL_REASON_TYPES)),
    userMessage: PropTypes.oneOf(Object.values(DISABLED_ENROLL_USER_MESSAGES)),
    actions: PropTypes.node,
  }),
  userSubsidyApplicableToCourse: PropTypes.shape({
    subsidyType: PropTypes.oneOf([
      LEARNER_CREDIT_SUBSIDY_TYPE,
      LICENSE_SUBSIDY_TYPE,
      COUPON_CODE_SUBSIDY_TYPE,
      ENTERPRISE_OFFER_SUBSIDY_TYPE,
    ]),
  }),
  redeemabilityPerContentKey: PropTypes.arrayOf(PropTypes.shape({
    canRedeem: PropTypes.bool,
    contentKey: PropTypes.string,
    hasSuccessfulRedemption: PropTypes.bool,
    listPrice: PropTypes.shape({ usd: PropTypes.number, usdCents: PropTypes.number }),
    reasons: PropTypes.arrayOf(PropTypes.shape({
      reason: PropTypes.oneOf(Object.values(DISABLED_ENROLL_REASON_TYPES)),
      userMessage: PropTypes.oneOf(Object.values(DISABLED_ENROLL_USER_MESSAGES)),
      metadata: PropTypes.shape({
        enterpriseAdministrators: PropTypes.arrayOf(PropTypes.shape({
          email: PropTypes.string,
          lmsUserId: PropTypes.number,
        })),
      }),
    })),
  })),
  hasSuccessfulRedemption: PropTypes.bool,
  subsidyRequestCatalogsApplicableToCourse: PropTypes.instanceOf(Set),
  userCanRequestSubsidyForCourse: PropTypes.bool,
  coursePrice: PropTypes.shape({
    list: PropTypes.number,
    discounted: PropTypes.number,
  }),
  currency: PropTypes.string,
  canOnlyViewHighlightSets: PropTypes.bool,
  formSubmissionError: PropTypes.string,
  setFormSubmissionError: PropTypes.func.isRequired,
};

CourseContextProvider.defaultProps = {
  isPolicyRedemptionEnabled: false,
  missingUserSubsidyReason: undefined,
  userSubsidyApplicableToCourse: undefined,
  redeemabilityPerContentKey: undefined,
  hasSuccessfulRedemption: false,
  subsidyRequestCatalogsApplicableToCourse: undefined,
  userCanRequestSubsidyForCourse: false,
  coursePrice: undefined,
  currency: undefined,
  canOnlyViewHighlightSets: false,
  formSubmissionError: null,
};
