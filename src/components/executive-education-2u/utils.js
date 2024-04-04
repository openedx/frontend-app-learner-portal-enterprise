import { getActiveCourseRun } from '../app/data';
import { PAID_EXECUTIVE_EDUCATION } from '../course/data/constants';

const getCourseOrganizationDetails = (courseData) => {
  const organizationDetails = {};
  if (courseData?.organizationShortCodeOverride) {
    organizationDetails.organizationName = courseData.organizationShortCodeOverride;
  } else {
    organizationDetails.organizationName = courseData?.owners[0]?.name;
  }
  if (courseData?.organizationLogoOverrideUrl) {
    organizationDetails.organizationLogo = courseData.organizationLogoOverrideUrl;
  } else {
    organizationDetails.organizationLogo = courseData?.owners[0]?.logoImageUrl;
  }

  return organizationDetails;
};

const getExecutiveEducationCoursePrice = (courseData) => {
  if (courseData?.entitlements?.length > 0) {
    for (let i = 0; i < courseData.entitlements.length; i++) {
      const entitlement = courseData.entitlements[i];
      if (entitlement.mode === PAID_EXECUTIVE_EDUCATION) {
        return { price: parseFloat(entitlement.price), currency: entitlement.currency };
      }
    }
  }

  const activeCourseRun = getActiveCourseRun(courseData);
  if (courseData?.seats?.length > 0) {
    for (let i = 0; i < activeCourseRun.seats.length; i++) {
      const seat = courseData.seats[i];
      if (seat.type === PAID_EXECUTIVE_EDUCATION) {
        return { price: parseFloat(seat.price), currency: seat.currency };
      }
    }
  }

  return {};
};

export { getCourseOrganizationDetails, getExecutiveEducationCoursePrice };
