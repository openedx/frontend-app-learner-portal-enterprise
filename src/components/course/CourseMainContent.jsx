import React, { useContext } from 'react';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';

import { PreviewExpand } from '../preview-expand';
import CourseContext from './CourseContext';
import CourseSidebar from './CourseSidebar';
import CreatedBy from './CreatedBy';
import VerifiedCertPitch from './VerifiedCertPitch';

export default function CourseMainContent() {
  const { course, activeCourseRun } = useContext(CourseContext);

  return (
    <>
      {course.fullDescription && (
        <PreviewExpand>
          <div className="mb-5">
            <h3>About this course</h3>
            {/* eslint-disable-next-line react/no-danger */}
            <div dangerouslySetInnerHTML={{ __html: course.fullDescription }} />
          </div>
        </PreviewExpand>
      )}
      {course.outcome && (
        <PreviewExpand>
          <div className="mb-5">
            <h3>What you&apos;ll learn</h3>
            {/* eslint-disable-next-line react/no-danger */}
            <div dangerouslySetInnerHTML={{ __html: course.outcome }} />
          </div>
        </PreviewExpand>
      )}
      {course.syllabusRaw && (
        <PreviewExpand>
          <div className="mb-5">
            <h3>Syllabus</h3>
            {/* eslint-disable-next-line react/no-danger */}
            <div dangerouslySetInnerHTML={{ __html: course.syllabusRaw }} />
          </div>
        </PreviewExpand>
      )}
      <CreatedBy />
      {activeCourseRun.type === 'verified' && <VerifiedCertPitch />}
      {course.learnerTestimonials && (
        <div className="mb-5">
          <h3>Learner testimonials</h3>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: course.learnerTestimonials }} />
        </div>
      )}
      {course.faq && (
        <div className="mb-5">
          <h3>Frequently asked questions</h3>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: course.faq }} />
        </div>
      )}
      {course.additionalInformation && (
        <div className="mb-5">
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: course.additionalInformation }} />
        </div>
      )}
      {activeCourseRun.hasOfacRestrictions && (
        <div className="mb-5">
          <h3>Who can take this course?</h3>
          <p>
            Unfortunately, learners from one or more of the following countries or regions will not
            be able to register for this course: Iran, Cuba and the Crimea region of Ukraine.
            While edX has sought licenses from the U.S. Office of Foreign Assets Control (OFAC) to
            offer our courses to learners in these countries and regions, the licenses we have
            truly regrets that U.S. sanctions prevent us from offering all of our courses to
            received are not broad enough to allow us to offer this course in all locations. EdX
            everyone, no matter where they live.
          </p>
        </div>
      )}
      <MediaQuery minWidth={breakpoints.large.minWidth}>
        {matches => !matches && (
        <div className="mb-5">
          <CourseSidebar />
        </div>
        )}
      </MediaQuery>
    </>
  );
}
