import React from 'react';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';
import { useParams } from 'react-router-dom';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout, MainContent, Sidebar } from '../layout';
import CourseContext from './CourseContext';
import CourseHeader from './CourseHeader';
import CourseMainContent from './CourseMainContent';
import CourseSidebar from './CourseSidebar';

import {
  useCourseDetails,
  useUserEnrollments,
  useUserEntitlements,
} from './data/hooks';

export default function CoursePage() {
  const { courseKey } = useParams();
  const [course, activeCourseRun] = useCourseDetails(courseKey);
  const [userEnrollments] = useUserEnrollments();
  const [userEntitlements] = useUserEntitlements();

  if (!course || !activeCourseRun || !userEnrollments) {
    return null;
  }

  return (
    <EnterprisePage>
      {(enterpriseConfig) => (
        <Layout>
          <Helmet title={`${course.title} - ${enterpriseConfig.name}`} />
          <EnterpriseBanner />
          <CourseContext.Provider
            value={{
              course, activeCourseRun, userEnrollments, userEntitlements,
            }}
          >
            <CourseHeader />
            <div className="container-fluid py-5">
              <div className="row">
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
              </div>
            </div>
          </CourseContext.Provider>
        </Layout>
      )}
    </EnterprisePage>
  );
}
