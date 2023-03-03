import { axisBottom, axisLeft } from 'd3';
import { useResizeDetector } from 'react-resize-detector';
import useAxisScales from './use-axis-scales';
import { useD3 } from './use-d3';

type Props = {
  gridArea: string;
};
const GridLines = ({ gridArea }: Props) => {
  const { xScale, yScale } = useAxisScales();
  const { width, height, ref } = useResizeDetector();
  useD3(
    ref,
    svg => {
      if (!xScale || !yScale || !width || !height) return;
      const xAxis = axisBottom(xScale).tickSize(height);
      const yAxis = axisLeft(yScale).tickSize(-width);
      svg.select('.x').call(xAxis as any);
      svg.select('.y').call(yAxis as any);

      svg.selectAll('line').attr('opacity', '0.1');
    },
    [xScale, yScale, width, height]
  );
  console.log({ width, height, xScale, yScale });
  return (
    <div
      className="w-full h-full relative -z-10"
      ref={ref}
      style={{ gridArea }}
    >
      <svg className="absolute" viewBox={`0 0 ${width} ${height}`}>
        <g className="x"></g>
        <g className="y"></g>
      </svg>
    </div>
  );
};
export default GridLines;
