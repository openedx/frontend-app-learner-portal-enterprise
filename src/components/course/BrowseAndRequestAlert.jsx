import { useState } from 'react';
import {
  breakpoints, Card, Button, useMediaQuery,
} from '@openedx/paragon';
import { Link } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import useBFF from '../app/data/hooks/useBFF';
import { queryDefaultEmptyFallback } from '../app/data';
import bookLoverImg from '../../assets/images/course/book-lover.svg';

const BrowseAndRequestCard = () => {
  const { data } = useBFF({
    bffQueryOptions: {},
    fallbackQueryConfig: queryDefaultEmptyFallback(),
  });
  const [isDismissed, setIsDismissed] = useState(false);
  const isSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });

  if (isDismissed || !data?.hasBnrEnabledPolicy) { return null; }

  return (
    <Card
      orientation={isSmall ? 'vertical' : 'horizontal'}
      className="my-2"
    >
      <Card.ImageCap
        src={bookLoverImg}
        srcAlt="Person reading a book"
        className="me-3"
      />
      <Card.Section className="d-flex w-100 align-items-center justify-content-between px-0 py-1">
        <div className="me-3">
          <h4>
            <FormattedMessage
              id="enterprise.course.alert.bnr.start.your.learning.journey.message"
              defaultMessage="Start your learning journey"
            />
          </h4>
          <p className="mb-0 small">
            <FormattedMessage
              id="enterprise.course.alert.bnr.organization.catalog.request.message"
              defaultMessage="You can browse your organization's catalog(s) and request content you'd like to enroll in."
            />
          </p>
        </div>
        <div className="d-flex align-items-center gap-1 flex-shrink-0">
          <Button
            variant="tertiary"
            size="sm"
            className="mr-2"
            onClick={() => setIsDismissed(true)}
          >
            <FormattedMessage
              id="enterprise.course.alert.bnr.dismiss.button.label"
              defaultMessage="Dismiss"
            />
          </Button>
          <Button
            as={Link}
            size="sm"
            to={`/${data.enterpriseCustomer.slug}/search`}
            className="btn-brand-primary d-block d-md-inline-block mr-2"
          >
            <FormattedMessage
              id="enterprise.course.alert.bnr.find.a.course.button.label"
              defaultMessage="Find a course"
            />
          </Button>
        </div>
      </Card.Section>
    </Card>
  );
};

export default BrowseAndRequestCard;
