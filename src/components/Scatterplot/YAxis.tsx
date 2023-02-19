import { Axis, Orient } from 'd3-axis-for-react';
import { useResizeDetector } from 'react-resize-detector';
import useAxisScales from './use-axis-scales';

type Props = {
  featureName: string;
  gridArea: string;
  tickFormat?: (d: number) => string;
};

const YAxis = ({ featureName, gridArea, tickFormat }: Props) => {
  const { width: width = 0, height: height = 0, ref } = useResizeDetector();
  const { yScale } = useAxisScales();

  return (
    <div ref={ref} className="relative" style={{ gridArea }}>
      <svg
        className="absolute"
        viewBox={`0 0 ${width} ${height + 10}`}
        transform={`translate(1, 0)`}
      >
        <text
          textAnchor="middle"
          x="0"
          y="0"
          transform={`translate(${width / 4}, ${height / 2}) rotate(-90)`}
        >
          {featureName}
        </text>
        {yScale && (
          <g transform={`translate(${width - 1}, 0)`}>
            <Axis scale={yScale} orient={Orient.left} tickFormat={tickFormat} />
          </g>
        )}
      </svg>
    </div>
  );
};
export default YAxis;
