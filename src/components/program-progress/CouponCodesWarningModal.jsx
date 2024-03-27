import {
  ActionRow, Button, MailtoLink, StandardModal,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { useEnterpriseCustomer } from '../app/data';

const CouponCodesWarningModal = ({ isCouponCodeWarningModalOpen, onCouponCodeWarningModalClose, couponCodesCount }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  if (isCouponCodeWarningModalOpen === false) { return null; }
  const renderTitle = () => (
    <h3>
      <FormattedMessage
        id="enterprise.coupon.codes.warning.modal.title"
        defaultMessage="You do not have enough codes to complete the program"
        description="Title for the coupon codes warning modal."
      />
    </h3>
  );

  return (
    <StandardModal
      title={renderTitle()}
      isOpen={isCouponCodeWarningModalOpen}
      onClose={onCouponCodeWarningModalClose}
      hasCloseButton={false}
      footerNode={(
        <ActionRow>
          <Button onClick={onCouponCodeWarningModalClose}>OK</Button>
        </ActionRow>
      )}
    >
      <FormattedMessage
        id="enterprise.coupon.codes.warning.modal.body"
        defaultMessage="<p>Our records show that you do not have enough codes assigned to you in order to complete the program. If you are not able to complete all of the courses in the program, you will not be eligible to view or share your program record.</p><p>If you plan to complete the program, please <a>contact your learning manager</a> to have additional codes assigned to you.</p><i>Codes remaining: {couponCodesCount}</i>"
        description="Body for the coupon codes warning modal."
        /* eslint-disable react/no-unstable-nested-components */
        values={{
          p: chunks => <p>{chunks}</p>,
          a: chunks => (
            enterpriseCustomer.contactEmail
              ? <MailtoLink to={enterpriseCustomer.contactEmail} className="font-weight-bold">{chunks}</MailtoLink>
              : chunks
          ),
          i: chunks => <i>{chunks}</i>,
          couponCodesCount,
        }}
        /* eslint-disable react/no-unstable-nested-components */
      />
    </StandardModal>
  );
};
CouponCodesWarningModal.propTypes = {
  isCouponCodeWarningModalOpen: PropTypes.bool.isRequired,
  onCouponCodeWarningModalClose: PropTypes.func.isRequired,
  couponCodesCount: PropTypes.number,
};

CouponCodesWarningModal.defaultProps = {
  couponCodesCount: 0,
};
export default CouponCodesWarningModal;
