import React, { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router-dom';
import { Container, Row, Col } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import PropTypes from 'prop-types';

import emptyStateImage from '../../assets/images/empty-state.svg';
import DashboardPanel from './DashboardPanel';
import SearchCourseCard from '../search/SearchCourseCard';

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

export default function Dashboard() {
  const {
    enterpriseConfig: {
      name,
    },
    authenticatedUser,
  } = useContext(AppContext);
  const { state } = useLocation();
  const history = useHistory();

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
  // TODO(DP-307): Connect the `courses` to the learning path API.
  const courses = [];
  const catalogCourses = [1, 2, 3, 4, 5, 6, 7];

  return (
    <>
      <Helmet title={`Dashboard - ${name}`} />

      <Container size="lg" className="py-5">
        <h2 className="h2">
          {userFirstName ? `Welcome, ${userFirstName}!` : 'Welcome!'}
        </h2>
        <p className="mb-5 small">Today is a great day for education.</p>
        <DashboardPanel
          title="My learning path"
          subtitle="Software development"
          headerAside={(
            <div>
              <div className="small text-dark-400">
                Available for kick-off
              </div>
              <div className="h4">
                {courses.length} {courses.length === 1 ? 'course' : 'courses'}
              </div>
            </div>
          )}
        >
          {courses.length === 0
            ? (
              <EmptyState
                title="You don't have a course in Learning path yet."
                text={<>Check out our <a href="/lms/search">complete course catalog</a> for courses that might interest you</>}
              />
            )
            : (
              <Row>
                {courses.map(card => (
                  <Col xs={12} md={6} lg={4} key={card}>
                    {/* TODO(DP-306): Replace with finalised card component from frontend-common. */}
                    <SearchCourseCard />
                  </Col>
                ))}
              </Row>
            )}
        </DashboardPanel>
        <DashboardPanel
          title="Course catalog"
          subtitle="Let's find a useful course for you"
        >
          <Row>
            {catalogCourses.map(card => (
              <Col xs={12} md={6} lg={4} key={card}>
                {/* TODO(DP-306): Replace with finalised card component from frontend-common. */}
                <SearchCourseCard />
              </Col>
            ))}
          </Row>
        </DashboardPanel>
      </Container>
    </>
  );
}
