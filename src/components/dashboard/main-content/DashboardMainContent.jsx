import React, { useContext, useMemo } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Button, breakpoints, Collapsible, MediaQuery } from '@edx/paragon';

import { CourseEnrollments } from './course-enrollments';
import { HighlightedCourseCard } from './course-enrollments/course-cards';

import SupportInformation from '../sidebar/SupportInformation';
import SubsidiesSummary from '../sidebar/SubsidiesSummary';

const DashboardMainContent = () => {
  const {
    enterpriseConfig: {
      name,
      slug,
      disableSearch,
    },
    authenticatedUser,
  } = useContext(AppContext);

  const userFirstName = useMemo(() => authenticatedUser?.name.split(' ').shift(), [authenticatedUser?.name]);

  return (
    <>
      <h2 className="h1 mb-4">
        {userFirstName ? `Welcome, ${userFirstName}!` : 'Welcome!'}
      </h2>
      <MediaQuery maxWidth={breakpoints.medium.maxWidth}>
        {matches => (matches ? (
          <SubsidiesSummary />
        ) : null)}
      </MediaQuery>
      <CourseEnrollments>
        {/* The children below will only be rendered if there are no course enrollments. */}
        {disableSearch ? (
          <p>
            You are not enrolled in any courses sponsored by {name}.
            Reach out to your administrator for instructions on how to start learning learning with edX!
          </p>
        ) : (
          <>
            <p>
              Getting started with edX is easy. Simply find a course from your
              catalog, request enrollment, and get started on your learning journey.
            </p>
            <Button
              as={Link}
              to={`/${slug}/search`}
              className="btn-brand-primary d-block d-md-inline-block"
            >
              Find a course
            </Button>
          </>
        )}
      </CourseEnrollments>

      <div className="highlight-section mb-4">
        <Collapsible
          styling="card"
          title={<h3>Highlighted Courses</h3>}
          defaultOpen
        >
          <Carousel
            nextIcon={
              <span
                aria-hidden="true"
                className="carousel-control-next-icon"
                style={{
                  backgroundColor: "black",
                }}
              />
            }
            prevIcon={
              <span
                aria-hidden="true"
                className="carousel-control-prev-icon"
                style={{
                  backgroundColor: "black",
                }}
              />
            }
          >
            <Carousel.Item>
              <Container>
                <Row>
                  <Col>
                    <HighlightedCourseCard
                      hit={{
                        "aggregation_key": "course:HarvardX+CS50x",
                        "availability": "[\"Available Now\"]",
                        "card_image_url": "https://prod-discovery.edx-cdn.org/media/course/image/da1b2400-322b-459b-97b0-0c557f05d017-3b9fb73b5d5d.small.jpg",
                        "content_type": "course",
                        "key": "HarvardX+CS50x",
                        "title": "CS50's Introduction to Computer Science",
                        "partners": [{
                          "logo_image_url": "https://prod-discovery.edx-cdn.org/organization/logos/44022f13-20df-4666-9111-cede3e5dc5b6-2cc39992c67a.png",
                          "name": "Harvard University",
                        }],
                        "original_image_url": "https://prod-discovery.edx-cdn.org/media/course/image/da1b2400-322b-459b-97b0-0c557f05d017-a3d1899c3344.png",
                        "marketing_url": "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x?utm_source=enterprise_catalog_worker&utm_medium=affiliate_partner",
                      }}
                    />
                  </Col>
                  <Col>
                    <HighlightedCourseCard
                      hit={{
                        "aggregation_key": "course:UQx+IELTSx",
                        "availability": "[\"Available Now\"]",
                        "card_image_url": "https://prod-discovery.edx-cdn.org/media/course/image/d61d7a1f-3333-4169-a786-92e2bf690c6f-fa8a6909baec.small.jpg",
                        "content_type": "course",
                        "key": "UQx+IELTSx",
                        "partners": [{
                          "logo_image_url": "https://prod-discovery.edx-cdn.org/organization/logos/8554749f-b920-4d7f-8986-af6bb95290aa-f336c6a2ca11.png",
                          "name": "The University of Queensland",
                        }],
                        "title": "IELTS Academic Test Preparation",
                        "original_image_url": "https://prod-discovery.edx-cdn.org/media/course/image/d61d7a1f-3333-4169-a786-92e2bf690c6f-fa8a6909baec.jpg",
                        "marketing_url": "https://www.edx.org/course/ielts-academic-test-preparation?utm_source=enterprise_catalog_worker&utm_medium=affiliate_partner",
                      }}
                    />
                  </Col>
                </Row>
              </Container>
            </Carousel.Item>
            <Carousel.Item>
              <Container>
                <Row>
                  <Col>
                    <HighlightedCourseCard
                      hit={{
                        "aggregation_key": "course:MITx+6.00.1x",
                        "card_image_url": "https://prod-discovery.edx-cdn.org/media/course/image/956319ec-8665-4039-8bc6-32c9a9aea5e9-885268c71902.small.jpg",
                        "content_type": "course",
                        "key": "MITx+6.00.1x",
                        "partners": [{
                          "logo_image_url": "https://prod-discovery.edx-cdn.org/organization/logos/2a73d2ce-c34a-4e08-8223-83bca9d2f01d-2cc8854c6fee.png",
                          "name": "Massachusetts Institute of Technology",
                        }],
                        "title": "Introduction to Computer Science and Programming Using Python",
                        "original_image_url": "https://prod-discovery.edx-cdn.org/media/course/image/956319ec-8665-4039-8bc6-32c9a9aea5e9-885268c71902.jpg",
                        "marketing_url": "https://www.edx.org/course/introduction-to-computer-science-and-programming-7?utm_source=enterprise_catalog_worker&utm_medium=affiliate_partner",
                      }}
                    />
                  </Col>
                  <Col> 
                    <HighlightedCourseCard
                      hit={{
                        "aggregation_key": "course:BerkeleyX+CS198.1x",
                        "card_image_url": "https://prod-discovery.edx-cdn.org/media/course/image/ec5e106e-18be-4bf3-8721-58950b7da1d4-167d9da4dc5b.small.jpg",
                        "content_type": "course",
                        "key": "BerkeleyX+CS198.1x",
                        "partners": [{
                          "logo_image_url": "https://prod-discovery.edx-cdn.org/organization/logos/54bc81cb-b736-4505-aa51-dd2b18c61d84-2082c7ba1024.png",
                          "name": "University of California, Berkeley",
                        }],
                        "title": "Bitcoin and Cryptocurrencies",
                        "original_image_url": "https://prod-discovery.edx-cdn.org/media/course/image/ec5e106e-18be-4bf3-8721-58950b7da1d4-09a0431a0e5d.jpg",
                        "marketing_url": "https://www.edx.org/course/bitcoin-and-cryptocurrencies?utm_source=enterprise_catalog_worker&utm_medium=affiliate_partner",
                      }}
                    />
                  </Col>
                </Row>
              </Container>
            </Carousel.Item>
          </Carousel>
        </Collapsible>
      </div>

      <MediaQuery maxWidth={breakpoints.medium.maxWidth}>
        {matches => (matches ? <SupportInformation className="mt-5" /> : null)}
      </MediaQuery>
    </>
  );
};

export default DashboardMainContent;
