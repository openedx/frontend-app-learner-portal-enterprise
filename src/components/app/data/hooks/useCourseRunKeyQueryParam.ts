import { useSearchParams } from 'react-router-dom';
import { extractCourseRunKeyFromSearchParams } from '../utils';

function useCourseRunKeyQueryParam() {
  const [searchParams] = useSearchParams();
  return extractCourseRunKeyFromSearchParams(searchParams);
}

export default useCourseRunKeyQueryParam;
