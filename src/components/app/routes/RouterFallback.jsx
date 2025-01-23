import { useNProgressLoader } from '../data';

const RouterFallback = () => {
  const queryOptions = {
    useNotices: {
      suspense: false,
    },
  };
  useNProgressLoader(queryOptions);
  return null;
};

export default RouterFallback;
