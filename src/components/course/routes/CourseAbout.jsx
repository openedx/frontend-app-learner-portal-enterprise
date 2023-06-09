import React, { useContext } from 'react';
import {
  Container, MediaQuery, Row, breakpoints,
} from '@edx/paragon';

import { MainContent, Sidebar } from '../../layout';
import CourseHeader from '../course-header/CourseHeader';
import CourseMainContent from '../CourseMainContent';
import CourseSidebar from '../CourseSidebar';
import CourseRecommendations from '../CourseRecommendations';
import { CourseContext } from '../CourseContextProvider';

const CourseAbout = () => {
  const { canOnlyViewHighlightSets } = useContext(CourseContext);
  return (
    <>
      <CourseHeader />
      <Container size="lg" className="py-5">
        <Row>
          <MainContent>
            <CourseMainContent />
          </MainContent>
          <MediaQuery minWidth={breakpoints.large.minWidth}>
            {matches => matches && (
              <Sidebar>
                <CourseSidebar />
              </Sidebar>
            )}
          </MediaQuery>
          {canOnlyViewHighlightSets === false && <CourseRecommendations />}
        </Row>
      </Container>
    </>
  );
};

export default CourseAbout;
