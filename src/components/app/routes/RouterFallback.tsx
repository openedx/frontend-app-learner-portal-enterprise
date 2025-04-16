import { useNProgressLoader, UseNProgressLoaderOptions } from '../data';

interface RouterFallbackProps {
  loaderOptions?: UseNProgressLoaderOptions;
}

const RouterFallback = ({ loaderOptions = {} as UseNProgressLoaderOptions }: RouterFallbackProps) => {
  useNProgressLoader(loaderOptions);
  return null;
};

export default RouterFallback;
