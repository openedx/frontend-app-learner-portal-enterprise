import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Col,
  Collapsible,
  Container,
  Icon,
  Image,
  MarketingModal,
  ModalDialog,
  Row,
  Skeleton,
} from '@openedx/paragon';
import { Assignment, BookOpen, VerifiedBadge } from '@openedx/paragon/icons';
import DOMPurify from 'dompurify';
import { useLearnerPathwayData } from './data/hooks';
import coursesAndProgramsText from './data/utils';
import defaultBannerImage from '../../assets/images/pathway/default-back-up-image.png';
import { linkToCourse } from '../course/data/utils';
import { useEnterpriseCustomer } from "../hooks";

const renderStepNodes = (step, slug) => [].concat(step.courses, step.programs).map((node, index) => {
  const nodePageLink = node.contentType === 'course' ? linkToCourse(node, slug) : `/${slug}/program/${node.uuid}`;
  const buttonText = node.contentType === 'course' ? 'Course Details' : 'Program Details';
  const rowKey = node.contentType === 'course' ? node.key : node.uuid;

  return (
    <Row className="mb-3 pt-2" key={rowKey}>
      <Col xs={12} lg={3}>
        <Image
          className="mr-2 node-image"
          data-testid={`card-image-${step.uuid}-${index}`}
          src={node.cardImageUrl}
          rounded
          fluid
        />
      </Col>
      <Col className="mt-md-2 mt-lg-0">
        <h3>
          {node.title}
        </h3>
        {/* eslint-disable react/no-danger */}
        <div dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(
            node.shortDescription,
            { USE_PROFILES: { html: true } },
          ),
        }}
        />
      </Col>
      <Col className="mt-md-2 mt-lg-0" md="auto">
        <Button
          as={Link}
          to={nodePageLink}
          variant="outline-primary"
          target="_blank"
        > {buttonText}
        </Button>
      </Col>
    </Row>
  );
});

const PathwayModal = ({ learnerPathwayUuid, isOpen, onClose }) => {
  const intl = useIntl();
  const { slug } = useEnterpriseCustomer();
  // const { enterpriseConfig: { slug } } = useContext(AppContext);
  const pathwayUuid = isOpen ? learnerPathwayUuid : null;
  const [pathway, isLoading] = useLearnerPathwayData({ learnerPathwayUuid: pathwayUuid });

  if (isOpen === false) { return null; }

  const getPathwayStepsTitle = (step, index) => {
    const totalCoursesAndPrograms = (step?.courses?.length || 0) + (step?.programs?.length || 0);

    const requirementsTitleWithSingleStep = intl.formatMessage(
      {
        id: 'enterprise.dashboard.pathways.progress.page.pathway.requirements.step.title',
        defaultMessage: 'Requirement {index}',
        description: 'Title indicating a single requirement step for a pathway on the pathway progress page.',
      },
      {
        index: index + 1,
      },
    );

    const requirementsTitleWithMultipleSteps = intl.formatMessage(
      {
        id: 'enterprise.dashboard.pathways.progress.page.pathway.requirements.step.title',
        defaultMessage: 'Requirement {index}: Choose any {count} of the following',
        description: 'Title indicating multiple requirements steps for a pathway on the pathway progress page.',
      },
      {
        index: index + 1,
        count: totalCoursesAndPrograms,
      },
    );

    return totalCoursesAndPrograms > 1 ? requirementsTitleWithMultipleSteps : requirementsTitleWithSingleStep;
  };

  return (
    <MarketingModal
      className="learner-pathway-modal"
      title={isLoading ? '' : (pathway.name || pathway.title)}
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      heroNode={isLoading ? <Skeleton height={120} data-testid="pathway-banner-loading" /> : (
        <ModalDialog.Hero>
          <ModalDialog.Hero.Background
            className="pathway-bg-img"
            data-testid="modal-hero"
            backgroundSrc={pathway.bannerImage || defaultBannerImage}
          />
        </ModalDialog.Hero>
      )}
    >

      {isLoading ? (
        <Skeleton
          height={40}
          className="mb-4"
          data-testid="pathway-name-loading"
        />
      ) : (
        <ModalDialog.Title as="h2" className="mb-4">
          {pathway.title}
        </ModalDialog.Title>
      )}

      <Container>
        <Row className="mb-md-4.5 mb-3">
          <Col xs={12} md={4} className="mb-2">
            {isLoading ? <Skeleton height={30} data-testid="pathway-badge-loading" /> : (
              <div className="d-flex">
                <Icon src={VerifiedBadge} className="mr-1" />
                <div>
                  <h4 className="mb-0">
                    <FormattedMessage
                      id="enterprise.pathway.modal.verified.label"
                      defaultMessage="Verified"
                      description="Verified label displayed on the pathway modal."
                    />
                  </h4>
                  <span className="font-weight-light" style={{ fontSize: '16px' }}>
                    <FormattedMessage
                      id="enterprise.pathway.modal.curated.by.professionals.label"
                      defaultMessage="Curated by learning professionals"
                      description="Label displayed on the pathway modal indicating that the pathway is curated by learning professionals."
                    />
                  </span>
                </div>
              </div>
            )}
          </Col>
          <Col xs={12} md={4} className="mb-2">
            {isLoading ? <Skeleton height={30} data-testid="pathway-nodes-count-loading" /> : (
              <div className="d-flex">
                <Icon src={Assignment} className="mr-1" />
                <div>
                  <h4 className="mb-0">
                    {coursesAndProgramsText(pathway)}
                  </h4>
                  <span className="font-weight-light" style={{ fontSize: '16px' }}>
                    <FormattedMessage
                      id="enterprise.pathway.modal.course.and.programs.requirements.count.label"
                      defaultMessage="Across {pathwayStepsCount} requirements"
                      description="Label displayed on the pathway modal indicating the number of requirements for programs and courses."
                      values={{
                        pathwayStepsCount: pathway.steps.length,
                      }}
                    />
                  </span>
                </div>
              </div>
            )}
          </Col>
          <Col xs={12} md={4}>
            {isLoading ? <Skeleton height={30} data-testid="pathway-catalog-info-loading" /> : (
              <div className="d-flex">
                <Icon src={BookOpen} className="mr-1" />
                <div>
                  <h4 className="mb-0">
                    <FormattedMessage
                      id="enterprise.pathway.modal.catalog.label"
                      defaultMessage="Included with catalog"
                      description="Label displayed on the pathway modal indicating the pathway is included with catalog."
                    />
                  </h4>
                  <span className="font-weight-light" style={{ fontSize: '16px' }}>
                    <FormattedMessage
                      id="enterprise.pathway.modal.learn.at.zero.cost.label"
                      defaultMessage="Learn at zero cost to you"
                      description="Label displayed on the pathway modal describing that the learner can learn at zero cost."
                    />
                  </span>
                </div>
              </div>
            )}
          </Col>
        </Row>

        {isLoading ? <Skeleton height={40} className="mb-4" data-testid="pathway-overview-loading" /> : (
          <Row className="mb-4">
            {/* eslint-disable react/no-danger */}
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pathway.overview, { USE_PROFILES: { html: true } }) }} className="pl-3 pr-3" />
          </Row>
        )}

        {isLoading ? (
          <Skeleton
            height={100}
            className="mb-4"
            data-testid="pathway-collapsibles-loading"
          />
        ) : pathway.steps.map((step, index) => (
          <Collapsible
            styling="card"
            title={getPathwayStepsTitle(step, index)}
            className="mb-4"
            key={step.uuid}
          >
            {renderStepNodes(step, slug)}
          </Collapsible>
        ))}
      </Container>

    </MarketingModal>
  );
};

const SkeletonPathwayModal = (props) => (
  <PathwayModal {...props} isLoading />
);

PathwayModal.propTypes = {
  learnerPathwayUuid: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

PathwayModal.defaultProps = {
  learnerPathwayUuid: undefined,
};

PathwayModal.Skeleton = SkeletonPathwayModal;

export default PathwayModal;
