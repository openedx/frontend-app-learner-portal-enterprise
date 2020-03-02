import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { Breadcrumb, breakpoints, Button } from '@edx/paragon';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import {
  faTachometerAlt,
  faTag,
  faRocket,
  faRoad,
  faUniversity,
  faGraduationCap,
  faCertificate,
} from '@fortawesome/free-solid-svg-icons';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout, MainContent, Sidebar } from '../layout';
import { useCourseDetails, useSelectCourseRun } from './data/hooks';

export default function CoursePage() {
  const { courseKey } = useParams();
  const [course, activeCourseRun] = useCourseDetails(courseKey);
  // const course = {
  //   title: 'Demonstration Course',
  //   key: courseKey,
  //   imageUrl: `${process.env.LMS_BASE_URL}/asset-v1:edX+DemoX+Demo_Course+type@asset+block@images_course_image.jpg`,
  //   shortDescription: '<p>Explore how entrepreneurship and innovation tackle complex social problems in emerging economies.</p>',
  //   fullDescription: '<p>This business and management course, taught by Harvard Business School professor Tarun Khanna, takes an inter-disciplinary approach to understanding and solving complex social problems. You will learn about prior attempts to address these problems, identify points of opportunity for smart entrepreneurial efforts, and propose and develop your own creative solutions.</p><p>The focus of this course is on individual agency—what can you do to address a defined problem? While we will use the lens of health to explore entrepreneurial opportunities, you will learn how both problems and solutions are inevitably of a multi-disciplinary nature, and we will draw on a range of sectors and fields of study.</p>',
  //   outcome: '<ul>\r\n<li>Fundamental concepts from probability, statistics, stochastic modeling, and optimization to develop systematic frameworks for decision-making in a dynamic setting</li>\r\n<li>How to use historical data to learn the underlying model and pattern</li>\r\n<li>Optimization methods and software to solve decision problems under uncertainty in business applications</li>\r\n</ul>',
  //   prerequisites: '<p>Undergraduate probability, statistics and linear algebra. Students should have working knowledge of Python and familiarity with basic programming concepts in some procedural programming language.</p>',
  //   syllabus: '<ul>\r\n<li>Introduction to Probability: Random variables; Normal, Binomial, Exponential distributions; applications</li>\r\n<li>Estimation: sampling; confidence intervals; hypothesis testing</li>\r\n<li>Regression: linear regression; dummy variables; applications</li>\r\n<li>Linear Optimization; Non-linear optimization; Discrete Optimization; applications</li>\r\n<li>Dynamic Optimization; decision trees</li>\r\n</ul>',
  // };

  if (!course || !activeCourseRun) {
    return null;
  }

  console.log(course);
  console.log(activeCourseRun);

  return (
    <EnterprisePage>
      {(enterpriseConfig) => (
        <Layout>
          <Helmet title={`${course.title} - ${enterpriseConfig.name}`} />
          <EnterpriseBanner />
          <div>
            <div className="container" style={{ boxShadow: '0 8px 16px 0 rgba(0,0,0,.15)' }}>
              <div className="row py-4">
                <div className="col-12 col-lg-7">
                  <Breadcrumb
                    links={[
                      { label: 'Catalog', url: process.env.CATALOG_BASE_URL },
                      { label: 'Test Subject 1', url: `${process.env.LMS_BASE_URL}/subject/test-subject-1` },
                    ]}
                    spacer={<span>/</span>}
                  />
                  <h2>{course.title}</h2>
                  {course.shortDescription && (
                    <div
                      className="lead font-weight-normal"
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: course.shortDescription }}
                    />
                  )}
                  <div className="enroll" style={{ width: 270 }}>
                    <Button className="btn-success btn-block rounded-0 py-2">
                      <span className="d-block font-weight-bold">Enroll</span>
                      <small className="d-block">Started Aug 6, 2019</small>
                    </Button>
                  </div>
                </div>
                <div className="col-8 col-lg-4 offset-lg-1 mt-3 mt-lg-0">
                  <img src={course.image.src} alt="course preview" className="w-100" />
                </div>
              </div>
            </div>
          </div>
          <div className="container py-5">
            <div className="row">
              <MainContent>
                {course.fullDescription && (
                  <div className="mb-5">
                    <h3>About this course</h3>
                    {/* eslint-disable-next-line react/no-danger */}
                    <div dangerouslySetInnerHTML={{ __html: course.fullDescription }} />
                  </div>
                )}
                {course.outcome && (
                  <div className="mb-5">
                    <h3>What you&apos;ll learn</h3>
                    {/* eslint-disable-next-line react/no-danger */}
                    <div dangerouslySetInnerHTML={{ __html: course.outcome }} />
                  </div>
                )}
                <div className="mb-5">
                  <h3>Meet your instructors</h3>
                  {/* eslint-disable-next-line react/no-danger */}
                  <div dangerouslySetInnerHTML={{ __html: course.outcome }} />
                </div>
                {course.syllabusRaw && (
                  <div className="mb-5">
                    <h3>Syllabus</h3>
                    {/* eslint-disable-next-line react/no-danger */}
                    <div dangerouslySetInnerHTML={{ __html: course.syllabusRaw }} />
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="mb-4">
                    Pursue a Verified Certificate to highlight the knowledge and skills you gain
                  </h3>
                  <ul className="pl-0" style={{ listStyleType: 'none' }}>
                    <li className="d-flex pb-2">
                      <div
                        className="d-flex bg-primary p-2 align-items-center justify-content-center mr-3"
                        style={{ borderRadius: '50%', height: 44, width: 44 }}
                      >
                        <FontAwesomeIcon className="text-white" icon={faRocket} />
                      </div>
                      <div>
                        <h4 className="h5">Official and Verified</h4>
                        <p>
                          Receive an instructor-signed certificate with the institution&apos;s
                          logo to verify your achievement
                        </p>
                      </div>
                    </li>
                    <li className="d-flex pb-2">
                      <div
                        className="d-flex bg-primary p-2 align-items-center justify-content-center mr-3"
                        style={{ borderRadius: '50%', height: 44, width: 44 }}
                      >
                        <FontAwesomeIcon className="text-white" icon={faRoad} />
                      </div>
                      <div>
                        <h4 className="h5">Easily Shareable</h4>
                        <p>
                          Add the certificate to your CV or resume, or post it
                          directly on LinkedIn
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </MainContent>
              <MediaQuery minWidth={breakpoints.large.minWidth}>
                {matches => matches && (
                  <Sidebar>
                    <ul className="pl-0 mb-5">
                      {activeCourseRun.weeksToComplete && (
                        <li className="row d-flex border-bottom no-gutters py-3">
                          <div className="col d-flex align-items-center">
                            <FontAwesomeIcon className="mr-3" icon={faClock} />
                            <span>Length:</span>
                          </div>
                          <div className="col">
                            <span>{activeCourseRun.weeksToComplete} weeks</span>
                          </div>
                        </li>
                      )}
                      {activeCourseRun.minEffort && activeCourseRun.maxEffort && (
                        <li className="row d-flex border-bottom no-gutters py-3">
                          <div className="col d-flex align-items-center">
                            <FontAwesomeIcon className="mr-3" icon={faTachometerAlt} />
                            <span>Effort:</span>
                          </div>
                          <div className="col">
                            <span>
                              {activeCourseRun.minEffort}-{activeCourseRun.maxEffort}
                              {' '}
                              hours per week
                            </span>
                          </div>
                        </li>
                      )}
                      <li className="row d-flex border-bottom no-gutters py-3">
                        <div className="col d-flex align-items-center">
                          <FontAwesomeIcon className="mr-3" icon={faTag} />
                          <span>Price:</span>
                        </div>
                        <div className="col">
                          <span>FREE</span>
                        </div>
                      </li>
                      <li className="row d-flex border-bottom no-gutters py-3">
                        <div className="col d-flex align-items-center">
                          <FontAwesomeIcon className="mr-3" icon={faUniversity} />
                          <span>Institution:</span>
                        </div>
                        <div className="col">
                          <span>HarvardX</span>
                        </div>
                      </li>
                      <li className="row d-flex border-bottom no-gutters py-3">
                        <div className="col d-flex align-items-center">
                          <FontAwesomeIcon className="mr-3" icon={faGraduationCap} />
                          <span>Subject:</span>
                        </div>
                        <div className="col">
                          <span>Business &amp; Management</span>
                        </div>
                      </li>
                      {activeCourseRun.levelType && (
                        <li className="row d-flex border-bottom no-gutters py-3">
                          <div className="col d-flex align-items-center">
                            <FontAwesomeIcon className="mr-3" icon={faCertificate} />
                            <span>Level:</span>
                          </div>
                          <div className="col">
                            <span>{course.levelType}</span>
                          </div>
                        </li>
                      )}
                      <li className="row d-flex no-gutters py-3">
                        <div className="col d-flex align-items-center">
                          <FontAwesomeIcon className="mr-3" icon={faUniversity} />
                          <span>Language:</span>
                        </div>
                        <div className="col">
                          <span>English</span>
                        </div>
                      </li>
                    </ul>
                    <div className="prerequisites">
                      <h3>Prerequisites</h3>
                      {/* eslint-disable-next-line react/no-danger */}
                      <div dangerouslySetInnerHTML={{ __html: course.prerequisitesRaw }} />
                    </div>
                  </Sidebar>
                )}
              </MediaQuery>
            </div>
          </div>
        </Layout>
      )}
    </EnterprisePage>
  );
}
