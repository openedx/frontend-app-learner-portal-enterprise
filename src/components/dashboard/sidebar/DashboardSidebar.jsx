import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AppContext } from '@edx/frontend-platform/react';

import { SidebarBlock } from '../../layout';
import { LoadingSpinner } from '../../loading-spinner';
import { fetchOffers } from './offers';
import SidebarCard from './SidebarCard';

export const EMAIL_MESSAGE = 'contact your organization\'s edX administrator';
export const getLoaderAltText = (enterpriseName) => `loading learning benefits for ${enterpriseName}`;
export const OFFER_SUMMARY_TITLE = 'Assigned courses left to redeem';

export class BaseDashboardSidebar extends React.Component {
  componentDidMount() {
    const { isOffersLoading } = this.props;
    if (!isOffersLoading) {
      this.props.fetchOffers('full_discount_only=True');
    }
  }

  renderContactHelpText() {
    const { enterpriseConfig: { contactEmail } } = this.context;

    const message = EMAIL_MESSAGE;

    if (contactEmail) {
      return (
        <a className="text-underline" href={`mailto:${contactEmail}`}>
          {message}
        </a>
      );
    }
    return message;
  }

  renderOfferSummaryCard() {
    const { enterpriseConfig: { name } } = this.context;
    const { offersCount, isOffersLoading } = this.props;
    if (isOffersLoading) {
      return (
        <div className="mb-5">
          <LoadingSpinner screenReaderText={getLoaderAltText(name)} />
        </div>
      );
    }
    if (offersCount > 0) {
      return (
        <SidebarCard
          title={OFFER_SUMMARY_TITLE}
          buttonText="Find a course in the catalog"
          textClassNames={offersCount ? 'big-number' : ''}
          buttonLink="/search"
          linkIsLocal
        >
          {offersCount}
        </SidebarCard>
      );
    }
    return null;
  }

  render() {
    return (
      <>
        <SidebarBlock
          title="Need help?"
          titleOptions={{ tag: 'h3', className: 'h4' }}
          className="mb-5"
        >
          <p>
            For technical support, visit the{' '}
            <a className="text-underline" href="https://support.edx.org/hc/en-us">edX Help Center</a>.
          </p>
          <p>
            To request more benefits or specific courses, {this.renderContactHelpText()}.
          </p>
        </SidebarBlock>
        <SidebarBlock>
          {this.renderOfferSummaryCard()}
        </SidebarBlock>
      </>
    );
  }
}

BaseDashboardSidebar.contextType = AppContext;

BaseDashboardSidebar.defaultProps = {
  fetchOffers: null,
  isOffersLoading: false,
  offersCount: 0,
};

BaseDashboardSidebar.propTypes = {
  fetchOffers: PropTypes.func,
  isOffersLoading: PropTypes.bool,
  offersCount: PropTypes.number,
};

const mapStateToProps = state => ({
  isOffersLoading: state.offers.loading,
  offersCount: state.offers.offersCount,
});

const mapDispatchToProps = dispatch => ({
  fetchOffers: (query) => (query ? dispatch(fetchOffers(query)) : dispatch(fetchOffers())),
});

export default connect(mapStateToProps, mapDispatchToProps)(BaseDashboardSidebar);
