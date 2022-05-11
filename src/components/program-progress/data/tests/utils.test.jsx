import { camelCaseObject } from '@edx/frontend-platform/utils';
import {
  getCoursesEnrolledInAuditMode,
  getProgramIcon,
  isCourseRunEnrollable,
} from '../utils';

import { PROGRAM_TYPE_MAP } from '../../../program/data/constants';
import MicroMastersProgramDetailsSvgIcon from '../../../../assets/icons/micromasters-program-details.svg';
import ProfCertProgramDetailsSvgIcon from '../../../../assets/icons/professional-certificate-program-details.svg';
import XSeriesProgramDetailsSvgIcon from '../../../../assets/icons/xseries-program-details.svg';

describe('getProgramIcon', () => {
  it('returns logo when program type is micromasters', () => {
    const icon = getProgramIcon(PROGRAM_TYPE_MAP.MICROMASTERS);
    expect(icon).toEqual(MicroMastersProgramDetailsSvgIcon);
  });

  it('returns logo when program type is xseries', () => {
    const icon = getProgramIcon(PROGRAM_TYPE_MAP.XSERIES);
    expect(icon).toEqual(XSeriesProgramDetailsSvgIcon);
  });

  it('returns logo when program type is professional certificate', () => {
    const icon = getProgramIcon(PROGRAM_TYPE_MAP.PROFESSIONAL_CERTIFICATE);
    expect(icon).toEqual(ProfCertProgramDetailsSvgIcon);
  });

  it('returns empty string when program type is not from the PROGRAM_TYPE_MAP', () => {
    const icon = getProgramIcon('test');
    expect(icon).toEqual('');
  });
});

const enrolledCourses = {
  completed: [
    {
      key: 'HarvardX+CS50x',
      uuid: 'da1b2400-322b-459b-97b0-0c557f05d017',
      title: 'completed 1',
      course_runs: [
        {
          title: "Enrolled completed Completed CS50's Introduction to Computer Science",
          marketing_url: 'https://www.edx.org/course/introduction-computer-science-harvardx-cs50x',
          start: '2016-02-17T00:00:00Z',
          end: '2022-12-31T23:59:00Z',
          pacing_type: 'instructor_paced',
          run_type: 'df9c20c1-9b54-40a5-bae3-7fda48d84141',
          certificate_url: null,
          course_url: '/courses/course-v1:HarvardX+CS50+X/',
          is_enrolled: true,
        },
      ],
    },
  ],
  in_progress: [
    {
      title: 'In Progress 2',
      key: '0322x',
      course_runs: [
        {
          title: 'Not Enrolled In Progress 2.1',
          marketing_url: 'https://www.edx.org/course/introduction-computer-science-harvardx-cs50x',
          upgrade_url: 'https://www.edx.org/course/introduction-computer-science-harvardx-cs50x',
          start: '2012-10-15T00:00:00Z',
          end: null,
          expired: false,
          pacing_type: 'instructor_paced',
          run_type: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
          is_enrollable: true,
          availability: 'Current',
        },
        {
          title: 'EnrolledIn Progress 2.3',
          start: '2018-02-17T00:00:00Z',
          end: '2023-12-31T23:59:00Z',
          pacing_type: 'self_paced',
          run_type: 'df9c20c1-9b54-40a5-bae3-7fda48d84141',
          certificate_url: '',
          upgrade_url: 'https://www.edx.org/course/introduction-computer-science-harvardx-cs50x',
          course_url: '/courses/course-v1:HarvardX+CS50+X/',
          is_enrolled: true,
          is_enrollment_open: true,
          is_course_ended: true,
          expired: false,
          status: 'published',
          seats: [
            {
              type: 'verified',
              price: '149.00',
              currency: 'USD',
              upgrade_deadline: '2022-04-06T06:36:26.667883Z',
              upgrade_deadline_override: null,
              credit_provider: null,
              credit_hours: null,
              sku: '8CF08E5',
              bulk_sku: 'A5B6DBE',
            },
            {
              type: 'audit',
              price: '0.00',
              currency: 'USD',
              upgrade_deadline: null,
              upgrade_deadline_override: null,
              credit_provider: null,
              credit_hours: null,
              sku: '68EFFFF',
              bulk_sku: null,
            },
          ],
        },
      ],
    },
  ],
};

describe('getCoursesEnrolledInAuditMode', () => {
  it('returns end date of courses enrolled in Audit mode', () => {
    const enrolledCoursesEndDate = getCoursesEnrolledInAuditMode(
      camelCaseObject([...enrolledCourses.completed, ...enrolledCourses.in_progress]),
    );
    expect(enrolledCoursesEndDate).toEqual([{ end: '2023-12-31T23:59:00Z' }]);
  });

  it('returns empty array if not courses enrolled', () => {
    const enrolledCoursesEndDate = getCoursesEnrolledInAuditMode([]);
    expect(enrolledCoursesEndDate).toEqual([]);
  });
});

describe('isCourseRunEnrollable', () => {
  const enrollableCourseRun = {
    title: 'Not Enrolled In Progress 2.1',
    is_enrollable: true,
    is_enrolled: false,
    is_course_ended: false,
    is_enrollment_open: true,
    status: 'published',
  };
  const notEnrollableCourseRun = {
    title: 'Not Enrolled In Progress 2.1',
    is_enrollable: false,
    is_enrolled: false,
    is_course_ended: false,
    is_enrollment_open: false,
    status: 'published',
  };
  it('returns false for course not enrollable', () => {
    const isRunEnrollable = isCourseRunEnrollable(camelCaseObject(notEnrollableCourseRun));
    expect(isRunEnrollable).toEqual(false);
  });

  it('returns true for course enrollable', () => {
    const isRunEnrollable = isCourseRunEnrollable(camelCaseObject(enrollableCourseRun));
    expect(isRunEnrollable).toEqual(true);
  });
});
