import { useNProgressLoader } from '../data';

const RouterFallback = () => {
  useNProgressLoader();
  return null;
};

export default RouterFallback;
