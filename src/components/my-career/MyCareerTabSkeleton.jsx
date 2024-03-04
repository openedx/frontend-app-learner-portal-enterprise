import {
  Card,
  Col,
  Row,
  Skeleton,
} from '@openedx/paragon';
import React from 'react';

const MyCareerTabSkeleton = () => (
  <div className="py-4.5">
    <Row>
      <Col lg={8}>
        <h2>
          <Skeleton width={200} />
        </h2>
        <Skeleton count={5} />
      </Col>
      <Col as="aside">
        <Card>
          <Card.Section>
            <Skeleton count={3} />
          </Card.Section>
        </Card>
      </Col>
    </Row>
  </div>
);

export default MyCareerTabSkeleton;
