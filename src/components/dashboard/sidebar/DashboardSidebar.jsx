import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AppContext } from '@edx/frontend-platform/react';

import { SidebarBlock } from '../../layout';
import { LoadingSpinner } from '../../loading-spinner';
import { fetchOffers, Offer } from './offers';
import { isFeatureEnabled } from '../../../features';

class DashboardSidebar extends React.Component {
  componentDidMount() {
    if (isFeatureEnabled('enterprise_offers')) {
      this.props.fetchOffers();
    }
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
      </>
    );
  }
}

DashboardSidebar.contextType = AppContext;

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
