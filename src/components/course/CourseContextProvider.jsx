import React, {
  createContext, useReducer, useMemo, useContext,
} from 'react';
import PropTypes from 'prop-types';
import {
  COUPON_CODE_SUBSIDY_TYPE,
  DISABLED_ENROLL_REASON_TYPES,
  DISABLED_ENROLL_USER_MESSAGES,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  LEARNER_CREDIT_SUBSIDY_TYPE,
  LICENSE_SUBSIDY_TYPE,
  SET_COURSE_RUN,
} from './data/constants';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';

export const CourseContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case SET_COURSE_RUN:
      return { ...state, activeCourseRun: action.payload };
    default:
      return state;
  }
};

export const CourseContextProvider = ({
  children,
  initialCourseState,
  isPolicyRedemptionEnabled,
  missingUserSubsidyReason,
  userSubsidyApplicableToCourse,
  redeemabilityPerContentKey,
  coursePrice,
  currency,
}) => {
  const { catalogsForSubsidyRequests } = useContext(SubsidyRequestsContext);
  const [state, dispatch] = useReducer(reducer, initialCourseState);

  const { catalog } = state;

  const subsidyRequestCatalogsApplicableToCourse = useMemo(() => {
    const catalogsContainingCourse = new Set(catalog.catalogList);
    const subsidyRequestCatalogIntersection = new Set(
      catalogsForSubsidyRequests.filter(el => catalogsContainingCourse.has(el)),
    );
    return subsidyRequestCatalogIntersection;
  }, [catalog, catalogsForSubsidyRequests]);

  const value = useMemo(() => ({
    state,
    dispatch,
    subsidyRequestCatalogsApplicableToCourse,
    isPolicyRedemptionEnabled,
    missingUserSubsidyReason,
    userSubsidyApplicableToCourse,
    redeemabilityPerContentKey,
    coursePrice,
    currency,
  }), [
    state,
    subsidyRequestCatalogsApplicableToCourse,
    isPolicyRedemptionEnabled,
    missingUserSubsidyReason,
    userSubsidyApplicableToCourse,
    redeemabilityPerContentKey,
    coursePrice,
    currency,
  ]);

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

CourseContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialCourseState: PropTypes.shape({
    course: PropTypes.shape({}).isRequired,
    activeCourseRun: PropTypes.shape({}).isRequired,
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
  coursePrice: PropTypes.shape({
    list: PropTypes.number,
    discounted: PropTypes.number,
  }),
  currency: PropTypes.string,
};

CourseContextProvider.defaultProps = {
  isPolicyRedemptionEnabled: false,
  missingUserSubsidyReason: undefined,
  userSubsidyApplicableToCourse: undefined,
  redeemabilityPerContentKey: undefined,
  coursePrice: undefined,
  currency: undefined,
};
