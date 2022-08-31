import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Container, Row, Col, Pagination, TransitionReplace,
} from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import PropTypes from 'prop-types';
import { CourseCard } from '@reustleco/dojo-frontend-common';

import emptyStateImage from '../../assets/images/empty-state.svg';
import DashboardPanel from './DashboardPanel';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { Filter, ActiveFilter } from '../filter/Filter';

function EmptyState({ title, text }) {
  return (
    <div className="dashboard-empty-state">
      <img src={emptyStateImage} alt="" />
      {title && (
        <h3 className="dashboard-empty-state-title">
          {title}
        </h3>
      )}
      {text && (
        <p className="dashboard-empty-state-text">
          {text}
        </p>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string,
  text: PropTypes.node,
};

EmptyState.defaultProps = {
  title: '',
  text: null,
};

const COURSES_PER_CATALOG_PAGE = 12;

export default function Dashboard() {
  const {
    enterpriseConfig: {
      name,
    },
    authenticatedUser,
  } = useContext(AppContext);
  const { state } = useLocation();
  const history = useHistory();
  const {
    learningPathData: { learning_path_name: learningPathName, courses, count = 0 },
    catalog: { data: { courses_metadata: catalogCourses }, filter },
  } = useContext(UserSubsidyContext);

  const catalogPageCount = Math.ceil(catalogCourses.length / COURSES_PER_CATALOG_PAGE);
  const [activeCatalogPage, setActiveCatalogPage] = useState(1);
  const catalogCoursesOnActivePage = catalogCourses?.slice(
    (activeCatalogPage - 1) * COURSES_PER_CATALOG_PAGE,
    (activeCatalogPage - 1) * COURSES_PER_CATALOG_PAGE + COURSES_PER_CATALOG_PAGE,
  ) ?? [];

  useEffect(() => {
    if (state?.activationSuccess) {
      const updatedLocationState = { ...state };
      delete updatedLocationState.activationSuccess;
      history.replace({
        ...history.location,
        state: updatedLocationState,
      });
    }
  }, []);

  const userFirstName = authenticatedUser?.name.split(' ').shift();

  return (
    <>
      <Helmet title={`Dashboard - ${name}`} />

      <Container size="lg" className="py-5">
        <h2 className="h2">
          {userFirstName ? `Welcome, ${userFirstName}!` : 'Welcome!'}
        </h2>
        <p className="mb-5 small">Today is a great day for education.</p>
        <DashboardPanel
          title={learningPathName}
          headerAside={(
            <div>
              <div className="small text-dark-400">
                Available for kick-off
              </div>
              <div className="h4">
                {count} {count === 1 ? 'course' : 'courses'}
              </div>
            </div>
          )}
        >
          {count === 0
            ? (
              <EmptyState
                title="You don't have a course in Learning path yet"
                text="Check out our complete course catalog for courses that might interest you"
              />
            )
            : (
              <Row>
                {courses?.map((course) => (
                  <Col xs={12} md={6} lg={4} key={course.id} className="mb-4">
                    <CourseCard
                      title={course.title}
                      hours={course.hours_required}
                      languages={[course.primary_language]}
                      skills={[course.difficulty_level]}
                      bgKey={course.id % 10}
                    />
                  </Col>
                ))}
              </Row>
            )}
        </DashboardPanel>
        <DashboardPanel
          title="Course catalog"
        >
          <hr />
          <Row>
            <Col lg={8}>
              <ActiveFilter filter={filter} />
              {catalogCoursesOnActivePage.length === 0 && (
                <EmptyState
                  title="Can't find what you're looking for?"
                  text={<>Get in touch with us at #dojo-help or <a href="mailto:dojo@woven-planet.global">dojo@woven-planet.global</a></>}
                />
              )}
              <div className="dashboard-catalog-wrap">
                <TransitionReplace>
                  <Row key={activeCatalogPage} className="dashboard-catalog-page">
                    {catalogCoursesOnActivePage.map((course) => (
                      <Col xs={12} md={6} key={course.id} className="mb-4">
                        <CourseCard
                          key={course.id}
                          title={course.title}
                          hours={course.hours_required}
                          languages={[course.primary_language]}
                          skills={[course.difficulty_level]}
                          bgKey={course.id % 10}
                        />
                      </Col>
                    ))}
                  </Row>
                </TransitionReplace>
                {catalogPageCount > 1 && (
                  <Row>
                    <Col className="d-flex justify-content-center">
                      <Pagination
                        paginationLabel={`Page ${activeCatalogPage} of ${catalogPageCount}`}
                        pageCount={catalogPageCount}
                        currentPage={activeCatalogPage}
                        onPageSelect={(pageNumber) => setActiveCatalogPage(pageNumber)}
                      />
                    </Col>
                  </Row>
                )}
              </div>
            </Col>
            <Col lg={4}>
              <Filter filter={filter} />
            </Col>
          </Row>
        </DashboardPanel>
      </Container>
    </>
  );
}
