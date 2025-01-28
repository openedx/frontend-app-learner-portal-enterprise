import { useNProgressLoader, UseNProgressLoaderOptions } from '../data';

interface RouterFallbackProps {
  loaderOptions: UseNProgressLoaderOptions;
}

const RouterFallback = ({ loaderOptions }: RouterFallbackProps) => {
  useNProgressLoader(loaderOptions);
  return null;
};

export default RouterFallback;
