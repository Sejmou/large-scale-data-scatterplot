import { Axis } from 'd3-axis-for-react';
import { useResizeDetector } from 'react-resize-detector';
import useAxisScales from './use-axis-scales';

type Props = {
  featureName: string;
  gridArea: string;
};
const XAxis = ({ featureName, gridArea }: Props) => {
  const { xScale } = useAxisScales();
  const { width: width = 0, height: height = 0, ref } = useResizeDetector();

  return (
    <div ref={ref} className="relative" style={{ gridArea }}>
      <svg className="absolute" viewBox={`0 0 ${width} ${height}`}>
        <text
          textAnchor="middle"
          x="0"
          y="0"
          transform={`translate(${width / 2}, ${7 * (height / 8)})`}
        >
          {featureName}
        </text>
        {xScale && <Axis scale={xScale} />}
      </svg>
    </div>
  );
};
export default XAxis;
