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
      return '#';
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
      return '#';
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

export function getEnrolledCourseRunDetails(courses) {
  const enrolledCourseRunDetails = [];
  courses.map((course) => (
    course?.courseRuns.map((cRun) => (cRun.isEnrolled && (enrolledCourseRunDetails.push({
      start: cRun.start,
      title: cRun.title,
      key: course?.key,
      pacingType: cRun?.pacingType,
      certificateUrl: cRun?.certificateUrl,
    }))
    ))
  ));
  return enrolledCourseRunDetails;
}

export function getNotStartedCourseDetails(courses) {
  const courseWithSingleCourseRun = [];
  const courseWithMultipleCourseRun = [];
  const multipleCourseRuns = [];

  courses.map((course) => (
    course?.courseRuns?.length && course?.courseRuns.length === 1 ? (courseWithSingleCourseRun.push({
      start: course.courseRuns[0]?.start,
      title: course.courseRuns[0].title,
      key: course?.key,
      pacingType: course.courseRuns[0]?.pacingType,
    })) : course?.courseRuns?.length && course?.courseRuns.length > 1
      // eslint-disable-next-line array-callback-return
      && course?.courseRuns.map((cRun) => {
        let courseRunDate = `${moment(cRun.start).format('MMMM Do, YYYY')}`;
        courseRunDate = cRun?.end ? `${courseRunDate} - ${moment(cRun.end).format('MMMM Do, YYYY')}`
          : courseRunDate;
        multipleCourseRuns.push({
          courseRunDate: [courseRunDate], title: course.title, key: course?.key, runType: cRun.runType,
        });
      })
  ));

  // eslint-disable-next-line array-callback-return
  multipleCourseRuns.map((e) => {
    const key = e.runType;
    const i = courseWithMultipleCourseRun.findIndex(r => r.runType === key);
    if (i >= 0) {
      courseWithMultipleCourseRun[i].courseRunDate.push(e.courseRunDate[0]);
    } else {
      courseWithMultipleCourseRun.push(e);
    }
  });
  return { courseWithSingleCourseRun, courseWithMultipleCourseRun };
}
