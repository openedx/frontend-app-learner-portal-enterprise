import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Row, Col } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

export default function Community() {
  const { enterpriseConfig } = useContext(AppContext);

  const PAGE_TITLE = `My Community - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Container className="py-5" fluid>
        <Row>
          <Col>
            <h1>My Community</h1>
            <p className="lead">
              Coming soon! <span role="img" aria-label="rocket icon">🚀</span>
            </p>
          </Col>
        </Row>
      </Container>
    </>
  );
}
