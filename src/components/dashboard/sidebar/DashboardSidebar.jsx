import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { isFeatureEnabled } from '@edx/frontend-learner-portal-base/src/features';
import { AppContext } from '@edx/frontend-learner-portal-base/src/components/app-context';
import { SidebarBlock } from '@edx/frontend-learner-portal-base/src/components/layout';
import { LoadingSpinner } from '@edx/frontend-learner-portal-base/src/components/loading-spinner';

import { fetchOffers, Offer } from './offers';

class DashboardSidebar extends React.Component {
  static contextType = AppContext;

  componentDidMount() {
    this.props.fetchOffers();
  }

  renderOffers(offers) {
    const hasOffers = offers && offers.length > 0;
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
        {this.renderLearningCoordinatorHelpText()}.
      </p>
    );
  }

  renderLearningCoordinatorHelpText() {
    const { pageContext: { enterpriseName, enterpriseEmail } } = this.context;
    if (enterpriseEmail) {
      return (
        <a className="text-underline" href={`mailto:${enterpriseEmail}`}>
          contact your {enterpriseName} learning coordinator
        </a>
      );
    }
    return `contact your ${enterpriseName} learning coordinator`;
  }

  render() {
    const { pageContext: { enterpriseName } } = this.context;
    const {
      offers,
      isOffersLoading,
    } = this.props;
    return (
      <>
        {isFeatureEnabled('enterprise_offers') && (
          <SidebarBlock title={`Learning Benefits from ${enterpriseName}`} className="mb-5">
            {isOffersLoading && (
              <div className="mb-5">
                <LoadingSpinner screenReaderText={`loading learning benefits for ${enterpriseName}`} />
              </div>
            )}
            {this.renderOffers(offers)}
          </SidebarBlock>
        )}
        <SidebarBlock title="Need help?" className="mb-5">
          <p>
            For technical support, visit the
            {' '}
            <a className="text-underline" href="https://support.edx.org/hc/en-us">edX Help Center</a>.
          </p>
          <p>
            To request more benefits or specific courses,
            {' '}
            {this.renderLearningCoordinatorHelpText()}.
          </p>
        </SidebarBlock>
      </>
    );
  }
}

DashboardSidebar.defaultProps = {
  fetchOffers: null,
  isOffersLoading: false,
  offers: [],
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
};

const mapStateToProps = state => ({
  isOffersLoading: state.offers.loading,
  offers: state.offers.offers,
});

const mapDispatchToProps = dispatch => ({
  fetchOffers: () => dispatch(fetchOffers()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardSidebar);
