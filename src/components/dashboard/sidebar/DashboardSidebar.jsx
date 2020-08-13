import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AppContext } from '@edx/frontend-platform/react';

import { SidebarBlock } from '../../layout';
import { LoadingSpinner } from '../../loading-spinner';
import { fetchOffers } from './offers';
import SidebarCard from './SidebarCard';

class DashboardSidebar extends React.Component {
  componentDidMount() {
    this.props.fetchOffers('full_discount_only=True');
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
      isOffersLoading,
    } = this.props;
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
          {isOffersLoading ? (
            <div className="mb-5">
              <LoadingSpinner screenReaderText={`loading learning benefits for ${name}`} />
            </div>
          )
            : this.renderOfferSummaryCard()}
        </SidebarBlock>
      </>
    );
  }
}

DashboardSidebar.contextType = AppContext;

DashboardSidebar.defaultProps = {
  fetchOffers: null,
  isOffersLoading: false,
  offersCount: 0,
};

DashboardSidebar.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(DashboardSidebar);
