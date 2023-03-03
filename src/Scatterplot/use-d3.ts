import { select } from 'd3';
import { useEffect } from 'react';

export const useD3 = (
  ref: React.RefObject<SVGElement>,
  chartRenderFn: (
    svg: d3.Selection<SVGElement, unknown, null, undefined>
  ) => void,
  dependencies: any
) => {
  useEffect(() => {
    if (ref.current) chartRenderFn(select(ref.current));
    return () => {};
  }, dependencies);
  return ref;
};
