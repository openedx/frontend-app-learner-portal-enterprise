import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AppContext } from '@edx/frontend-platform/react';

import { SidebarBlock } from '../../layout';
import { LoadingSpinner } from '../../loading-spinner';
import { fetchOffers, Offer } from './offers';
import { isFeatureEnabled } from '../../../features';
import SidebarCard from './SidebarCard';

class DashboardSidebar extends React.Component {
  componentDidMount() {
    if (isFeatureEnabled('enterprise_offers')) {
      this.props.fetchOffers();
    }
    if (isFeatureEnabled('offer_summary_card')) {
      this.props.fetchOffers('full_discount_only=True');
    }
  }

  renderOffers(offers) {
    const hasOffers = isFeatureEnabled('enterprise_offers') && offers && offers.length > 0;
    if (hasOffers) {
      return offers.map(({
        usageType,
        benefitValue,
        redemptionsRemaining,
        code,
        couponEndDate,
      }) => (
        <Offer
          usageType={usageType}
          benefitValue={benefitValue}
          redemptionsRemaining={redemptionsRemaining}
          code={code}
          couponEndDate={couponEndDate}
        />
      ));
    }
    return (
      <p>
        To request more benefits,
        {' '}
        {this.renderContactHelpText()}.
      </p>
    );
  }

  renderContactHelpText() {
    const { enterpriseConfig: { contactEmail } } = this.context;

    const message = 'contact your organization\'s edX administrator';

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
    const { offersCount } = this.props;
    return (
      <SidebarCard
        title="Assigned courses left to redeem"
        buttonText="Find a course in the catalog"
        textClassNames={offersCount ? 'big-number' : ''}
        buttonLink="/search"
        linkIsLocal
      >
        {offersCount || 'You currently have no coupons to redeem.'}
      </SidebarCard>
    );
  }

  render() {
    const { enterpriseConfig: { name } } = this.context;
    const {
      offers,
      isOffersLoading,
    } = this.props;
    return (
      <>
        {isFeatureEnabled('enterprise_offers') && (
          <SidebarBlock
            title={`Learning Benefits from ${name}`}
            titleOptions={{ tag: 'h3', className: 'h4' }}
            className="mb-5"
          >
            {isOffersLoading && (
              <div className="mb-5">
                <LoadingSpinner screenReaderText={`loading learning benefits for ${name}`} />
              </div>
            )}
            {this.renderOffers(offers)}
          </SidebarBlock>
        )}
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
        {isFeatureEnabled('offer_summary_card') && (
          <SidebarBlock>
            {isOffersLoading ? (
              <div className="mb-5">
                <LoadingSpinner screenReaderText={`loading learning benefits for ${name}`} />
              </div>
            )
              : this.renderOfferSummaryCard()}
          </SidebarBlock>
        )}
      </>
    );
  }
}

DashboardSidebar.contextType = AppContext;

DashboardSidebar.defaultProps = {
  fetchOffers: null,
  isOffersLoading: false,
  offers: [],
  offersCount: 0,
};

DashboardSidebar.propTypes = {
  fetchOffers: PropTypes.func,
  isOffersLoading: PropTypes.bool,
  offers: PropTypes.arrayOf(PropTypes.shape({
    usageType: PropTypes.string,
    benefitValue: PropTypes.number,
    redemptionsRemaining: PropTypes.number,
    code: PropTypes.string,
    couponEndDate: PropTypes.string,
  })),
  offersCount: PropTypes.number,
};

const mapStateToProps = state => ({
  isOffersLoading: state.offers.loading,
  offers: state.offers.offers,
  offersCount: state.offers.offersCount,
});

const mapDispatchToProps = dispatch => ({
  fetchOffers: (query) => (query ? dispatch(fetchOffers(query)) : dispatch(fetchOffers())),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardSidebar);
