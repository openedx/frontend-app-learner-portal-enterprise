import { useState } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Container, Alert, Row, Col, Card, MailtoLink, Button, Image, Stack,
} from '@openedx/paragon';

import { getContactEmail } from '../../utils/common';
import returnToDashboardIllustration from './data/illustrations/assignments-only-return-to-dashboard.svg';
import { useEnterpriseCustomer } from '../app/data';

const AssignmentsOnlyEmptyState = () => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const [isAlertVisible, setIsAlertVisible] = useState(true);
  const intl = useIntl();

  const adminContactEmail = getContactEmail(enterpriseCustomer);

  return (
    <Container size="lg" className="py-4">
      <Alert
        show={isAlertVisible}
        variant="info"
        closeLabel={intl.formatMessage({
          id: 'enterprise.assignment.only.empty.state.alert.dismiss',
          defaultMessage: 'Dismiss',
          description: 'Dismiss button text for the assignments only empty state alert.',
        })}
        actions={[
          <Button
            as={MailtoLink}
            className="flex-shrink-0"
            to={adminContactEmail}
          >
            <FormattedMessage
              id="enterprise.assignment.only.empty.state.alert.contact.admin.button"
              defaultMessage="Contact administrator"
              description="Button text for contacting the administrator on the assignments only empty state alert."
            />
          </Button>,
        ]}
        onClose={() => setIsAlertVisible(false)}
        dismissible
      >
        <Stack gap={2}>
          <Alert.Heading>
            <FormattedMessage
              id="enterprise.assignment.only.empty.state.alert.title"
              defaultMessage="Course discovery is not currently available"
              description="Title for the assignments only empty state alert."
            />
          </Alert.Heading>
          <span>
            <FormattedMessage
              id="enterprise.assignment.only.empty.state.alert.description"
              defaultMessage="Your organization has chosen to share courses with you by assignment only. To request access to additional content, contact your administrator."
              description="Description for the assignments only empty state alert"
            />
          </span>
        </Stack>
      </Alert>
      <Row>
        <Col xs={12} lg={8}>
          <Card>
            <Card.Section className="d-flex justify-content-center">
              <h3 className="mb-0">
                <FormattedMessage
                  id="enterprise.assignment.only.empty.state.card.title"
                  defaultMessage="Your next course, found!"
                  description="Title for the assignments only empty state card."
                />
              </h3>
            </Card.Section>
            <Card.Section className="d-flex justify-content-center" muted>
              <Image src={returnToDashboardIllustration} />
            </Card.Section>
            <Card.Section className="text-center">
              <p>
                <FormattedMessage
                  id="enterprise.assignment.only.empty.state.card.description"
                  defaultMessage="Start learning with courses assigned to you by your organization."
                  description="Description for the assignments only empty state card"
                />
              </p>
              <Button
                as={Link}
                to={generatePath('/:enterpriseSlug', { enterpriseSlug: enterpriseCustomer.slug })}
              >
                <FormattedMessage
                  id="enterprise.assignment.only.empty.state.card.button"
                  defaultMessage="Back to dashboard"
                  description="Button text for returning to the dashboard on the assignments only empty state card."
                />
              </Button>
            </Card.Section>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AssignmentsOnlyEmptyState;
