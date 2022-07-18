import {
  useState, useEffect, useCallback,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import _camelCase from 'lodash.camelcase';
import _cloneDeep from 'lodash.clonedeep';
import * as service from './service';
import { groupCourseEnrollmentsByStatus, transformCourseEnrollment } from './utils';
import { COURSE_STATUSES } from './constants';
import CourseService from '../../../../course/data/service';
import { createEnrollWithLicenseUrl } from '../../../../course/data/utils';

export const useCourseEnrollments = ({
  enterpriseUUID,
  requestedCourseEnrollments,
}) => {
  const [courseEnrollmentsByStatus, setCourseEnrollmentsByStatus] = useState(groupCourseEnrollmentsByStatus([]));
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await service.fetchEnterpriseCourseEnrollments(enterpriseUUID);
        const enrollments = camelCaseObject(resp.data).map(transformCourseEnrollment);
        const enrollmentsByStatus = groupCourseEnrollmentsByStatus(enrollments);
        enrollmentsByStatus[COURSE_STATUSES.requested] = requestedCourseEnrollments;
        setCourseEnrollmentsByStatus(enrollmentsByStatus);
      } catch (error) {
        logError(error);
        setFetchError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [enterpriseUUID, requestedCourseEnrollments]);

  const updateCourseEnrollmentStatus = useCallback(({
    courseRunId,
    originalStatus,
    newStatus,
    savedForLater,
  }) => {
    const originalStatusCamelCased = _camelCase(originalStatus);
    const newStatusCamelCased = _camelCase(newStatus);

    const newCourseEnrollmentsByStatus = _cloneDeep(courseEnrollmentsByStatus);
    const courseEnrollmentToUpdate = newCourseEnrollmentsByStatus[originalStatusCamelCased].find(
      ce => ce.courseRunId === courseRunId,
    );
    newCourseEnrollmentsByStatus[
      originalStatusCamelCased
    ] = newCourseEnrollmentsByStatus[originalStatusCamelCased].filter(
      ce => ce.courseRunId !== courseRunId,
    );
    newCourseEnrollmentsByStatus[newStatusCamelCased].push({
      ...courseEnrollmentToUpdate,
      courseRunStatus: newStatus,
      savedForLater,
    });

    setCourseEnrollmentsByStatus(newCourseEnrollmentsByStatus);
  }, [courseEnrollmentsByStatus]);

  return {
    courseEnrollmentsByStatus,
    isLoading,
    fetchError,
    updateCourseEnrollmentStatus,
  };
};

/**
 * Return data for upgrading a course using the user's subsidies
 * @param {object} args Arguments.
 * @param {String} args.courseRunKey id of the course run
 * @param {String} args.enterpriseId UUID of the enterprise
 * @param {Object} args.subscriptionLicense the user's subscription license
 * @param {Object} args.location location object from useLocation()
 *
 * @returns {Object} { isLoading, upgradeUrl }
 */
export const useCourseUpgradeData = ({
  courseRunKey,
  enterpriseId,
  subscriptionLicense,
  location,
}) => {
  const [upgradeUrl, setUpgradeUrl] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const courseService = new CourseService({
      enterpriseUuid: enterpriseId,
      courseKey: null,
      courseRunKey,
    });

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const containsContentResponse = await courseService.fetchEnterpriseCustomerContainsContent([courseRunKey]);
        const { containsContentItems } = camelCaseObject(containsContentResponse.data);

        // Don't do anything if the course is not part of the enterprise's catalog
        if (containsContentItems) {
          let licenseSubsidy;

          if (subscriptionLicense) {
            // get subscription license with extra information (i.e. discount type, discount value, subsidy checksum)
            const fetchUserLicenseSubsidyResponse = await courseService.fetchUserLicenseSubsidy(courseRunKey);
            licenseSubsidy = camelCaseObject(fetchUserLicenseSubsidyResponse.data);
          }

          if (licenseSubsidy) {
            const url = createEnrollWithLicenseUrl({
              courseRunKey,
              enterpriseId,
              licenseUUID: subscriptionLicense.uuid,
              location,
            });

            setUpgradeUrl(url);
          }
        }
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    courseRunKey,
    enterpriseId,
    subscriptionLicense,
    location,
  ]);

  return {
    isLoading,
    upgradeUrl,
  };
};
