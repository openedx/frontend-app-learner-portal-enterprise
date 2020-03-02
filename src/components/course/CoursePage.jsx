import React from 'react';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { Breadcrumb, breakpoints, Button } from '@edx/paragon';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import {
  faTachometerAlt, faTag, faRocket, faRoad, faUniversity, faGraduationCap, faCertificate,
} from '@fortawesome/free-solid-svg-icons';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout, MainContent, Sidebar } from '../layout';

export default function CoursePage() {
  const { courseKey } = useParams();
  const course = {
    title: 'Demonstration Course',
    key: courseKey,
    imageUrl: `${process.env.LMS_BASE_URL}/asset-v1:edX+DemoX+Demo_Course+type@asset+block@images_course_image.jpg`,
    shortDescription: '<p>Explore how entrepreneurship and innovation tackle complex social problems in emerging economies.</p>',
    fullDescription: '<p>This business and management course, taught by Harvard Business School professor Tarun Khanna, takes an inter-disciplinary approach to understanding and solving complex social problems. You will learn about prior attempts to address these problems, identify points of opportunity for smart entrepreneurial efforts, and propose and develop your own creative solutions.</p><p>The focus of this course is on individual agency—what can you do to address a defined problem? While we will use the lens of health to explore entrepreneurial opportunities, you will learn how both problems and solutions are inevitably of a multi-disciplinary nature, and we will draw on a range of sectors and fields of study.</p>',
    outcome: '<ul><li>An awareness of the opportunities for entrepreneurship in fast-growing emerging markets</li><li>An understanding of a conceptual framework for evaluating such opportunities</li><li>An appreciation of the types of problems that lend themselves to entrepreneurial solutions</li></ul>',
  };

  return (
    <EnterprisePage>
      {(enterpriseConfig) => (
        <Layout>
          <Helmet title={`${course.title} - ${enterpriseConfig.name}`} />
          <EnterpriseBanner />
          <div>
            <div className="container" style={{ boxShadow: '0 8px 16px 0 rgba(0,0,0,.15)' }}>
              <div className="row pt-4 pb-4">
                <div className="col-12 col-lg-7">
                  <Breadcrumb
                    links={[
                      { label: 'Catalog', url: process.env.CATALOG_BASE_URL },
                      { label: 'Test Subject 1', url: `${process.env.LMS_BASE_URL}/subject/test-subject-1` },
                    ]}
                    spacer="/"
                  />
                  <h2>{course.title}</h2>
                  {/* eslint-disable react/no-danger */}
                  <div
                    className="lead font-weight-normal"
                    dangerouslySetInnerHTML={{ __html: course.shortDescription }}
                  />
                  {/* eslint-enable react/no-danger */}
                  <div className="enroll" style={{ width: 270 }}>
                    <Button className="btn-success btn-block rounded-0 py-2">
                      <span className="d-block font-weight-bold">Enroll</span>
                      <small className="d-block">Started Aug 6, 2019</small>
                    </Button>
                  </div>
                </div>
                <div className="col-8 col-lg-4 offset-lg-1 mt-3 mt-lg-0">
                  <img src={course.imageUrl} alt="course preview" className="w-100" />
                </div>
              </div>
            </div>
          </div>
          <div className="container py-5">
            <div className="row">
              <MainContent>
                <div className="mb-5">
                  <h3>About this course</h3>
                  {/* eslint-disable-next-line react/no-danger */}
                  <div dangerouslySetInnerHTML={{ __html: course.fullDescription }} />
                </div>
                <div className="mb-5">
                  <h3>What you&apos;ll learn</h3>
                  {/* eslint-disable-next-line react/no-danger */}
                  <div dangerouslySetInnerHTML={{ __html: course.outcome }} />
                </div>
                <div className="mb-5">
                  <h3>Meet your instructors</h3>
                  {/* eslint-disable-next-line react/no-danger */}
                  <div dangerouslySetInnerHTML={{ __html: course.outcome }} />
                </div>
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
                      <li className="row d-flex border-bottom no-gutters py-3">
                        <div className="col d-flex align-items-center">
                          <FontAwesomeIcon className="mr-3" icon={faClock} />
                          <span>Length:</span>
                        </div>
                        <div className="col">
                          <span>6 weeks</span>
                        </div>
                      </li>
                      <li className="row d-flex border-bottom no-gutters py-3">
                        <div className="col d-flex align-items-center">
                          <FontAwesomeIcon className="mr-3" icon={faTachometerAlt} />
                          <span>Effort:</span>
                        </div>
                        <div className="col">
                          <span>3-5 hours per week</span>
                        </div>
                      </li>
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
                      <li className="row d-flex border-bottom no-gutters py-3">
                        <div className="col d-flex align-items-center">
                          <FontAwesomeIcon className="mr-3" icon={faCertificate} />
                          <span>Level:</span>
                        </div>
                        <div className="col">
                          <span>Introductory</span>
                        </div>
                      </li>
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
                      <p>None</p>
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
