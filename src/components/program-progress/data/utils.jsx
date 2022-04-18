import moment from 'moment';
import MicroMastersProgramDetailsSvgIcon from '../../../assets/icons/micromasters-program-details.svg';
import ProfCertProgramDetailsSvgIcon from '../../../assets/icons/professional-certificate-program-details.svg';
import XSeriesProgramDetailsSvgIcon from '../../../assets/icons/xseries-program-details.svg';
import progCertMicroMaster from '../images/program-certificate-micromasters.gif';
import progCertProfessionalCert from '../images/program-certificate-professional-certificate.gif';
import progCertXSeries from '../images/program-certificate-xseries.gif';
import { PROGRAM_TYPE_MAP } from '../../program/data/constants';

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

export function getLastEndingCourseDate(courses) {
  let courseRuns = [];
  courseRuns = courses.map((course) => (
    course?.courseRuns.map((cRun) => (cRun
    ))
  ));
  // combine all the course runs in the program which are not started by learner.
  const concatenatedCourseRuns = [].concat(...courseRuns);
  return concatenatedCourseRuns?.sort(
    (a, b) => (moment(a.end) < moment(b.end) ? 1 : -1),
  )[0].end;
}

export function isCourseRunEnded(run) {
  return !run.isEnrollmentOpen
    && run.isCourseEnded
    && run.status !== 'published';
}

export function getEnrolledCourseRunDetails(courses) {
  const enrolledCourseRunDetails = [];
  courses.map((course) => (
    course?.courseRuns.map((cRun) => (cRun.isEnrolled && (enrolledCourseRunDetails.push({
      start: cRun.start ? cRun.start : cRun.advertisedStart,
      title: cRun.title,
      key: course?.key,
      pacingType: cRun?.pacingType,
      certificateUrl: cRun?.certificateUrl,
      isEnded: isCourseRunEnded(cRun),
    }))
    ))
  ));
  return enrolledCourseRunDetails;
}

export function isCourseRunEnrollable(run) {
  return run.isEnrollmentOpen
  && !run.isEnrolled
  && !run.isCourseEnded
  && run.status === 'published';
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
        let courseRunDate = `${moment(startDate).format('MMMM Do, YYYY')}`;
        courseRunDate = cRun?.end ? `${courseRunDate} - ${moment(cRun.end).format('MMMM Do, YYYY')}`
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
