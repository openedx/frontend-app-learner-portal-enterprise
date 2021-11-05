import React, { useContext, useMemo } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Dropdown } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { ProgramContext } from './ProgramContextProvider';

function ProgramCTA() {
  const { program: { courses, subjects } } = useContext(ProgramContext);
  const { enterpriseConfig: { slug } } = useContext(AppContext);

  const { courseCount, availableCourseCount } = useMemo(() => (
    {
      courseCount: courses.length,
      availableCourseCount: courses.filter(course => course.enterpriseHasCourse).length,
    }
  ), [courses]);

  // Use the first subject as the primary subject
  const primarySubject = subjects?.length > 0 ? subjects[0] : '';
  const subjectSlug = primarySubject?.slug ? primarySubject?.slug.toLowerCase() : '';

  const getTotalWeeks = () => {
    const reducer = (totalWeeks, course) => {
      let additionalWeeks = 0;
      if (course.activeCourseRun) {
        additionalWeeks = Number.parseInt(course.activeCourseRun.weeksToComplete, 10);
      }

      return totalWeeks + additionalWeeks;
    };

    return Number.parseInt(courses.reduce(reducer, 0), 10);
  };

  const getProgramDuration = () => {
    const intl = useIntl();

    const totalWeeks = getTotalWeeks();
    const totalMonths = Math.round(totalWeeks / 4);

    const messages = defineMessages({
      'enterprise.program.main.statistic.duration.months': {
        id: 'enterprise.program.main.statistic.duration.months',
        description: 'Describe estimated duration of the program in months',
        defaultMessage: '{totalMonths, plural, '
          + 'one {# month} '
          + 'other {# months}}',
      },
      'enterprise.program.main.statistic.duration.years': {
        id: 'enterprise.program.main.statistic.duration.years',
        description: 'Describe estimated duration of the program in years',
        defaultMessage: '{totalYears, plural, '
          + 'one {# year} '
          + 'other {# years}}',
      },
      'enterprise.program.main.statistic.duration.yearAndMonth': {
        id: 'enterprise.program.main.statistic.duration.yearAndMonth',
        description: 'Describe estimated duration of the program in year and month',
        defaultMessage: '1 year 1 month',
      },
      'enterprise.program.main.statistic.duration.yearAndMonths': {
        id: 'enterprise.program.main.statistic.duration.yearAndMonths',
        description: 'Describe estimated duration of the program in year and months',
        defaultMessage: '1 year {monthCount} months',
      },
      'enterprise.program.main.statistic.duration.yearsAndMonth': {
        id: 'enterprise.program.main.statistic.duration.yearsAndMonth',
        description: 'Describe estimated duration of the program in years and month',
        defaultMessage: '{yearCount} years 1 month',
      },
      'enterprise.program.main.statistic.duration.yearsAndMonths': {
        id: 'enterprise.program.main.statistic.duration.yearsAndMonths',
        description: 'Describe estimated duration of the program in years and months',
        defaultMessage: '{yearCount} years {monthCount} months',
      },
    });

    if (totalMonths < 12) {
      return intl.formatMessage(
        messages['enterprise.program.main.statistic.duration.months'],
        {
          totalMonths,
        },
      );
    }

    const totalYears = Math.floor(totalMonths / 12);
    const totalRemainderMonths = Math.round(totalMonths % 12);

    if (totalRemainderMonths === 0) {
      return intl.formatMessage(
        messages['enterprise.program.main.statistic.duration.years'],
        {
          totalYears,
        },
      );
    } if (totalYears === 1 && totalRemainderMonths === 1) {
      return intl.formatMessage(messages['enterprise.program.main.statistic.duration.yearAndMonth']);
    } if (totalYears === 1) {
      return intl.formatMessage(
        messages['enterprise.program.main.statistic.duration.yearAndMonths'],
        {
          monthCount: totalRemainderMonths,
        },
      );
    } if (totalRemainderMonths === 1) {
      return intl.formatMessage(
        messages['enterprise.program.main.statistic.duration.yearsAndMonth'],
        {
          yearCount: totalYears,
        },
      );
    }

    return intl.formatMessage(
      messages['enterprise.program.main.statistic.duration.yearsAndMonths'],
      {
        yearCount: totalYears,
        monthCount: totalRemainderMonths,
      },
    );
  };

  const getAvailableCourses = () => {
    const intl = useIntl();

    const messages = defineMessages({
      'enterprise.program.courses.allCoursesAvailable': {
        id: 'enterprise.program.courses.allCoursesAvailable',
        description: 'Describe all courses are available in the catalog',
        defaultMessage: 'All courses included in your enterprise catalog',
      },
      'enterprise.program.courses.someCoursesAvailable': {
        id: 'enterprise.program.courses.someCoursesAvailable',
        description: 'Describe some courses are available in the catalog',
        defaultMessage: '{courseCount} courses included in your enterprise catalog',
      },
      'enterprise.program.courses.noCourseAvailable': {
        id: 'enterprise.program.courses.noCourseAvailable',
        description: 'Describe no course is available in the catalog',
        defaultMessage: 'These courses are not included in your enterprise catalog',
      },
    });

    if (availableCourseCount === 0) {
      return intl.formatMessage(
        messages['enterprise.program.courses.noCourseAvailable'],
      );
    } if (courseCount > availableCourseCount) {
      return intl.formatMessage(messages['enterprise.program.courses.someCoursesAvailable'], {
        courseCount: availableCourseCount,
      });
    }
    return intl.formatMessage(messages['enterprise.program.courses.allCoursesAvailable']);
  };

  const totalEstimatedDuration = getProgramDuration();
  const availableCourses = getAvailableCourses();

  return (
    <div className={
      classNames(
        'container mw-lg',
        'program-section',
        'd-flex',
        'align-items-center',
        'flex-column',
        'mb-0',
        'program-enroll-wrapper',
        subjectSlug,
      )
    }
    >
      <FormattedMessage
        id="enterprise.program.main.heading.enroll"
        defaultMessage="Enrolling Now"
        description="Heading for the program bundle enroll section."
      >{text => <h2 className="h2 section-title">{text}</h2>}
      </FormattedMessage>
      <div className="program-price d-flex flex-wrap">
        <div className="font-weight-normal">
          <span className="ml-1">
            {availableCourses}
          </span>
        </div>
      </div>
      <FormattedMessage
        id="enterprise.program.main.enroll.context"
        description="Context for the enroll button stating the number of courses and estimated duration."
        defaultMessage={`{courseCount} ${courseCount > 1 ? 'courses' : 'course' } in {estimatedDuration}`}
        values={{
          courseCount,
          estimatedDuration: totalEstimatedDuration,
        }}
      >{text => <div className="enroll-context">{text}</div>}
      </FormattedMessage>

      <div className="program-details-btn">
        <Dropdown className="enroll-btn btn btn-brand w-100">
          <Dropdown.Toggle variant="inverse-primary" as="div" id="dropdown-basic" style={{ cursor: 'pointer' }}>
            View Course Details
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {courses?.map(course => (
              course.enterpriseHasCourse ? (
                <Dropdown.Item key={course.title} as="a" href={`/${slug}/course/${course.key}`}>
                  {course.title}
                </Dropdown.Item>
              ) : (
                <Dropdown.Item key={course.title}>{course.title}</Dropdown.Item>
              )
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
}

export default ProgramCTA;
