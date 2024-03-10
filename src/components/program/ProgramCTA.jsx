import React, { useContext, useMemo } from 'react';
import { defineMessages, useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import { Dropdown } from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useParams } from 'react-router-dom';
import { ProgramContext } from './ProgramContextProvider';
import { getProgramDuration } from './data/utils';
import { linkToCourse } from '../course/data/utils';
import { useEnterpriseCustomer } from '../app/data';

const ProgramCTA = () => {
  const intl = useIntl();
  const { program } = useContext(ProgramContext);
  const { courses, subjects } = program;
  const { authenticatedUser: { userId } } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { programUuid } = useParams();

  const { courseCount, availableCourseCount } = useMemo(() => (
    {
      courseCount: courses.length,
      availableCourseCount: courses.filter(course => course.enterpriseHasCourse).length,
    }
  ), [courses]);

  // Use the first subject as the primary subject
  const primarySubject = subjects?.length > 0 ? subjects[0] : '';
  const subjectSlug = primarySubject?.slug ? primarySubject?.slug.toLowerCase() : '';

  const getAvailableCourses = () => {
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

  const programDuration = getProgramDuration(program);
  const availableCourses = getAvailableCourses();

  const getEnrollButtonText = () => {
    const messages = defineMessages({
      'enterprise.program.main.enroll.context.singularCourseWithDuration': {
        id: 'enterprise.program.main.enroll.context.singularCourseWithDuration',
        description: 'Context for the enroll button stating the singular course and estimated duration.',
        defaultMessage: '1 course in {estimatedDuration}',
      },
      'enterprise.program.main.enroll.context.pluralCourseWithDuration': {
        id: 'enterprise.program.main.enroll.context.pluralCourseWithDuration',
        description: 'Context for the enroll button stating the 0 or multiple courses and estimated duration.',
        defaultMessage: '{courseCount} courses in {estimatedDuration}',
      },
      'enterprise.program.main.enroll.context.singularCourse': {
        id: 'enterprise.program.main.enroll.context.singularCourse',
        description: 'Context for the enroll button stating the singular course.',
        defaultMessage: '1 course present in this program',
      },
      'enterprise.program.main.enroll.context.pluralCourses': {
        id: 'enterprise.program.main.enroll.context.pluralCourses',
        description: 'Context for the enroll button stating the 0 or multiple courses.',
        defaultMessage: '{courseCount} courses present in this program',
      },
    });

    if (courseCount === 1) {
      if (programDuration) {
        return intl.formatMessage(
          messages['enterprise.program.main.enroll.context.singularCourseWithDuration'],
          {
            estimatedDuration: programDuration,
          },
        );
      }

      return intl.formatMessage(
        messages['enterprise.program.main.enroll.context.singularCourse'],
        {
          estimatedDuration: programDuration,
        },
      );
    }

    if (programDuration) {
      return intl.formatMessage(
        messages['enterprise.program.main.enroll.context.pluralCourseWithDuration'],
        {
          courseCount,
          estimatedDuration: programDuration,
        },
      );
    }
    return intl.formatMessage(
      messages['enterprise.program.main.enroll.context.pluralCourses'],
      {
        courseCount,
        estimatedDuration: programDuration,
      },
    );
  };

  return (
    <div className={
      classNames(
        'container mw-lg',
        'program-section',
        'd-flex',
        'align-items-center',
        'flex-column',
        'mb-3',
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
      <div className="enroll-context">{getEnrollButtonText()}</div>

      <div className="program-details-btn">
        <Dropdown className="enroll-btn btn btn-brand w-100">
          <Dropdown.Toggle
            variant="inverse-primary"
            as="div"
            id="program-details-dropdown"
            style={{ cursor: 'pointer' }}
          >
            View Course Details
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {courses?.map(course => (
              course.enterpriseHasCourse ? (
                <Dropdown.Item
                  key={course.title}
                  as="a"
                  href={linkToCourse(course, enterpriseCustomer.slug)}
                  className="wrap-word"
                  onClick={() => {
                    sendEnterpriseTrackEvent(
                      enterpriseCustomer.uuid,
                      'edx.ui.enterprise.learner_portal.program.cta.course.clicked',
                      {
                        userId,
                        programUuid,
                        courseKey: course.key,
                      },
                    );
                  }}
                >
                  {course.title}
                </Dropdown.Item>
              ) : (
                <Dropdown.Item key={course.title} className="wrap-word">{course.title}</Dropdown.Item>
              )
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default ProgramCTA;
