import { useContext, useState } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import {
  Container, Alert, Row, Col, Card, MailtoLink, Button, Image, Stack,
} from '@openedx/paragon';

import { getContactEmail } from '../../utils/common';
import returnToDashboardIllustration from './data/illustrations/assignments-only-return-to-dashboard.svg';

const AssignmentsOnlyEmptyState = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const [isAlertVisible, setIsAlertVisible] = useState(true);

  const adminContactEmail = getContactEmail(enterpriseConfig);

  return (
    <Container size="lg" className="py-4">
      <Alert
        show={isAlertVisible}
        variant="info"
        actions={[
          <Button
            as={MailtoLink}
            className="flex-shrink-0"
            to={adminContactEmail}
          >
            Contact administrator
          </Button>,
        ]}
        onClose={() => setIsAlertVisible(false)}
        dismissible
      >
        <Stack gap={2}>
          <Alert.Heading>Course discovery is not currently available</Alert.Heading>
          <span>
            Your organization has chosen to share courses with you by assignment only. To request access
            to additional content, contact your administrator.
          </span>
        </Stack>
      </Alert>
      <Row>
        <Col xs={12} lg={8}>
          <Card>
            <Card.Section className="d-flex justify-content-center">
              <h3 className="mb-0">Your next course, found!</h3>
            </Card.Section>
            <Card.Section className="d-flex justify-content-center" muted>
              <Image src={returnToDashboardIllustration} />
            </Card.Section>
            <Card.Section className="text-center">
              <p>Start learning with courses assigned to you by your organization.</p>
              <Button
                as={Link}
                to={generatePath('/:enterpriseSlug', { enterpriseSlug: enterpriseConfig.slug })}
              >
                Back to dashboard
              </Button>
            </Card.Section>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AssignmentsOnlyEmptyState;
