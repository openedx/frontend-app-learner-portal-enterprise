import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import {
  Badge, Card, Icon, Truncate,
} from '@openedx/paragon';
import { Program } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { useIntl } from '@edx/frontend-platform/i18n';
import { getPrimaryPartnerLogo, isDefinedAndNotNull } from '../../utils/common';
import { useEnterpriseCustomer } from '../app/data';

export const ProgramType = ({ type }) => {
  let programTypeToDisplay = type;

  switch (type) {
    case 'MicroBachelors':
    case 'MicroMasters':
      programTypeToDisplay = <>{type}<sup className="superscript">®</sup> Program</>;
      break;
    case 'XSeries':
      programTypeToDisplay = <>{type} Program</>;
      break;
    case 'Masters':
      programTypeToDisplay = <>Master&apos;s Degree Program</>;
      break;
    case 'Professional Certificate':
      programTypeToDisplay = type;
      break;
    default:
      programTypeToDisplay = type;
  }

  return programTypeToDisplay;
};

const SearchProgramCard = ({ hit, isLoading, ...rest }) => {
  const { authenticatedUser: { userId } } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const intl = useIntl();
  const program = useMemo(() => {
    if (!hit) {
      return {};
    }
    return camelCaseObject(hit);
  }, [hit]);

  const programUuid = program?.aggregationKey?.split(':').pop();

  const linkToProgram = useMemo(
    () => {
      if (!programUuid) {
        return '#';
      }
      return `/${enterpriseCustomer.slug}/program/${programUuid}`;
    },
    [programUuid, enterpriseCustomer.slug],
  );

  const partnerDetails = useMemo(
    () => {
      if (!Object.keys(program).length || !isDefinedAndNotNull(program.authoringOrganizations)) {
        return {};
      }
      return {
        primaryPartner: program.authoringOrganizations?.length > 0 ? program.authoringOrganizations[0] : undefined,
        showPartnerLogo: program.authoringOrganizations?.length === 1,
      };
    },
    [program],
  );

  const getProgramCourseCount = () => {
    const numCourses = program.courseKeys?.length || 0;
    if (!numCourses) {
      return undefined;
    }
    return intl.formatMessage({
      id: 'enterprise.search.program.card.course.count',
      defaultMessage: '{numCourses, plural, one {# Course} other {# Courses}}',
      description: 'Footer text for the program card showing the number of courses in the program',
    }, { numCourses });
  };

  const primaryPartnerLogo = getPrimaryPartnerLogo(partnerDetails);

  const handleCardClick = () => {
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.search.program.card.clicked',
      {
        userId,
        programUuid,
      },
    );
  };

  return (
    <Card
      isLoading={isLoading}
      as={Link}
      to={linkToProgram}
      onClick={handleCardClick}
      isClickable
      variant="dark"
      data-testid="search-program-card"
      {...rest}
    >
      <Card.ImageCap
        src={program.cardImageUrl || cardFallbackImg}
        fallbackSrc={cardFallbackImg}
        alt=""
        logoSrc={primaryPartnerLogo?.src}
        logoAlt={primaryPartnerLogo?.alt}
      />
      <Card.Header
        title={(
          <Truncate lines={3}>{program.title}</Truncate>
        )}
        subtitle={
          program.authoringOrganizations?.length > 0 && (
            <Truncate lines={2}>
              {program.authoringOrganizations.map(org => org.key).join(', ')}
            </Truncate>
          )
        }
      />
      <Card.Section>
        <Badge
          variant="light"
          className="text-primary-500"
          data-testid="program-type-badge"
        >
          <div className="d-flex align-items-center">
            <Icon src={Program} className="mr-1" />
            <ProgramType type={program.type || null} />
          </div>
        </Badge>
      </Card.Section>
      <Card.Footer textElement={getProgramCourseCount()} />
    </Card>
  );
};

const SkeletonProgramCard = (props) => (
  <SearchProgramCard {...props} isLoading />
);

SearchProgramCard.propTypes = {
  hit: PropTypes.shape({
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    aggregation_key: PropTypes.string.isRequired,
    authoring_organizations: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      logo_image_url: PropTypes.string.isRequired,
    })).isRequired,
    card_image_url: PropTypes.string.isRequired,
    course_keys: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
  isLoading: PropTypes.bool,
};

SearchProgramCard.defaultProps = {
  hit: undefined,
  isLoading: false,
};

SearchProgramCard.Skeleton = SkeletonProgramCard;

export default SearchProgramCard;
