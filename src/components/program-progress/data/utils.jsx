import dayjs from '../../../utils/dayjs';
import { PROGRAM_TYPE_MAP } from '../../program/data/constants';

import MicroMastersProgramDetailsSvgIcon from '../../../assets/icons/micromasters-program-details.svg';
import ProfCertProgramDetailsSvgIcon from '../../../assets/icons/professional-certificate-program-details.svg';
import XSeriesProgramDetailsSvgIcon from '../../../assets/icons/xseries-program-details.svg';
import progCertMicroMaster from '../images/program-certificate-micromasters.gif';
import progCertProfessionalCert from '../images/program-certificate-professional-certificate.gif';
import progCertXSeries from '../images/program-certificate-xseries.gif';
import { COURSE_MODES_MAP } from '../../app/data';

export function getProgramIcon(type) {
  switch (type) {
    case PROGRAM_TYPE_MAP.XSERIES:
      return XSeriesProgramDetailsSvgIcon;
    case PROGRAM_TYPE_MAP.PROFESSIONAL_CERTIFICATE:
      return ProfCertProgramDetailsSvgIcon;
    case PROGRAM_TYPE_MAP.MICROMASTERS:
      return MicroMastersProgramDetailsSvgIcon;
    default:
      return '';
  }
}

export function getProgramCertImage(type) {
  switch (type) {
    case PROGRAM_TYPE_MAP.XSERIES:
      return progCertXSeries;
    case PROGRAM_TYPE_MAP.PROFESSIONAL_CERTIFICATE:
      return progCertProfessionalCert;
    case PROGRAM_TYPE_MAP.MICROMASTERS:
      return progCertMicroMaster;
    default:
      return '';
  }
}

export function isCourseRunEnrollable(run) {
  return run.isEnrollmentOpen
    && !run.isEnrolled
    && !run.isCourseEnded
    && run.status === 'published';
}

export function getNotStartedEnrollableCourseRuns(courses) {
  const courseRuns = [];
  // eslint-disable-next-line no-unused-expressions
  courses?.map((course) => (
    course?.courseRuns.map((cRun) => (isCourseRunEnrollable(cRun) && (courseRuns.push({
      end: cRun.end,
    }))
    ))
  ));
  // combine all the course runs in the program which are not started by learner.
  return [].concat(...courseRuns);
}

export function getLastEndingCourseDate(courses) {
  return courses?.sort(
    (a, b) => (a.end < b.end ? 1 : -1),
  )[0]?.end;
}

export function isCourseRunEnded(run) {
  return !run.isEnrollmentOpen
    && run.isCourseEnded
    && run.status !== 'published';
}

export function getEnrolledCourseRunDetails(courses) {
  /**
   * returns the list of course runs for courses that are enrolled by user with only one run for each course.
   * if there are multiple enrolled course_runs then the most recent is selected.
   *
   * @param {Array} courses in progress or completed array of courses
   * @return {Array} array of course runs selected from course runs of each course
   */
  return courses?.map((course) => {
    const filteredRuns = course.courseRuns.filter(cRUn => cRUn.isEnrolled).sort(
      (a, b) => new Date(b.start) - new Date(a.start),
    );
    // there will be at least one course run for each in_progress and completed courses
    const cRun = filteredRuns[0];
    return {
      start: cRun.start ? cRun.start : cRun.advertisedStart,
      title: cRun.title,
      key: course?.key,
      pacingType: cRun?.pacingType,
      certificateUrl: cRun?.certificateUrl,
      upgradeUrl: cRun?.upgradeUrl,
      expired: cRun?.expired,
      seats: cRun.seats ? cRun?.seats : [],
      isEnded: isCourseRunEnded(cRun),
    };
  });
}

export function getNotStartedCourseDetails(courses) {
  const courseWithSingleCourseRun = [];
  const courseWithMultipleCourseRun = [];
  const multipleCourseRuns = [];

  courses.map((course) => (
    course?.courseRuns?.length && course?.courseRuns.length === 1 ? (courseWithSingleCourseRun.push({
      start: course.courseRuns[0].start ? course.courseRuns[0].start : course.courseRuns[0].advertisedStart,
      title: course.courseRuns[0].title,
      key: course?.key,
      pacingType: course.courseRuns[0]?.pacingType,
      isEnrollable: isCourseRunEnrollable(course.courseRuns[0]),
    })) : course?.courseRuns?.length && course?.courseRuns.length > 1
      // eslint-disable-next-line array-callback-return
      && course?.courseRuns.map((cRun) => {
        const startDate = cRun.start ? cRun.start : cRun.advertisedStart;
        let courseRunDate = `${dayjs(startDate).format('MMMM Do, YYYY')}`;
        courseRunDate = cRun?.end ? `${courseRunDate} - ${dayjs(cRun.end).format('MMMM Do, YYYY')}`
          : courseRunDate;
        const isEnrollable = isCourseRunEnrollable(cRun);
        multipleCourseRuns.push({
          courseRunDate: isEnrollable ? [courseRunDate] : [],
          title: course.title,
          pacingType: cRun.pacingType,
          key: course?.key,
          uuid: course.uuid,
          isEnrollable,
          start: startDate,
        });
      })
  ));

  // eslint-disable-next-line array-callback-return
  multipleCourseRuns.map((courseRun) => {
    const { uuid } = courseRun;
    const index = courseWithMultipleCourseRun.findIndex(r => r.uuid === uuid);
    if (index >= 0) {
      if (courseRun.isEnrollable) {
        courseWithMultipleCourseRun[index].courseRunDate.push(courseRun.courseRunDate[0]);
        courseWithMultipleCourseRun[index].isEnrollable = true;
        courseWithMultipleCourseRun[index].pacingType = courseRun.pacingType;
        courseWithMultipleCourseRun[index].start = courseRun.start;
      }
    } else {
      courseWithMultipleCourseRun.push(courseRun);
    }
  });
  return { courseWithSingleCourseRun, courseWithMultipleCourseRun };
}

export function getCertificatePriceString(run) {
  if ('seats' in run && run.seats.length) {
    // eslint-disable-next-line consistent-return
    const upgradeableSeats = run.seats.filter((seat) => {
      const { VERIFIED, PROFESSIONAL, NO_ID_PROFESSIONAL } = COURSE_MODES_MAP;
      const upgradeableSeatTypes = [VERIFIED, PROFESSIONAL, NO_ID_PROFESSIONAL, 'credit'];
      return upgradeableSeatTypes.indexOf(seat.type) >= 0;
    });
    if (upgradeableSeats.length > 0) {
      const upgradeableSeat = upgradeableSeats[0];
      if (upgradeableSeat) {
        const { currency } = upgradeableSeat;
        if (currency === 'USD') {
          return `$${upgradeableSeat.price}`;
        }
        return `${upgradeableSeat.price} ${currency}`;
      }
    }
  }
  return null;
}

export const courseUpgradeAvailable = (course) => course.upgradeUrl
  && !course.expired
  && getCertificatePriceString(course);

// return the end date for the course runs, enrolled in Audit Mode and can be upgraded to professional certificate.
export function getCoursesEnrolledInAuditMode(courses) {
  const courseRuns = [];
  // eslint-disable-next-line no-unused-expressions
  courses?.map((course) => (
    course?.courseRuns.map((cRun) => (cRun.isEnrolled
      && !cRun.certificateUrl
      && courseUpgradeAvailable(cRun)
      && (courseRuns.push({
        end: cRun?.end,
      }))
    ))
  ));
  return courseRuns;
}
