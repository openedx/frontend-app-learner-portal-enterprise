import { useLocation } from 'react-router-dom';
import { resolveBFFQuery } from '../queries';

export default function useIsBFFEnabled() {
  const location = useLocation();
  return !!resolveBFFQuery(location.pathname);
}
