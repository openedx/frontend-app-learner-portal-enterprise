import { useCourseMetadata, useCourseRedemptionEligibility } from '../../../app/data';
import { getCoursePrice } from '../utils';

export default function useCourseListPrice() {
  const courseRedemptionEligibilityResult = useCourseRedemptionEligibility();

  const resolveListPrice = ({ transformed }) => {
    const defaultPrice = getCoursePrice(transformed);
    const { isPending, data } = courseRedemptionEligibilityResult;
    if (isPending) {
      return defaultPrice;
    }
    const listPriceFromCanRedeem = data?.listPrice;
    if (listPriceFromCanRedeem?.length > 0) {
      return listPriceFromCanRedeem;
    }
    return defaultPrice;
  };

  return useCourseMetadata({
    select: resolveListPrice,
  });
}
