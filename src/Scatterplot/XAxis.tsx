import { Axis } from 'd3-axis-for-react';
import { useResizeDetector } from 'react-resize-detector';
import { useScatterplotStore } from './store';
import useAxisScales from './use-axis-scales';

type Props = {
  gridArea: string;
  tickFormat?: (d: number) => string;
};
const XAxis = ({ gridArea, tickFormat }: Props) => {
  const featureName = useScatterplotStore(
    state => state.xAxisConfig.featureName
  );
  const marginLeft = useScatterplotStore(state => state.plotMargins.left);
  const marginRight = useScatterplotStore(state => state.plotMargins.right);
  const { xScale } = useAxisScales();
  const { width: width = 0, height: height = 0, ref } = useResizeDetector();

  return (
    <div ref={ref} className="relative" style={{ gridArea }}>
      <svg
        className="absolute"
        viewBox={`0 0 ${width + marginLeft + marginRight} ${height}`}
        transform={`translate(${-marginLeft}, 0)`}
        width={width + marginLeft + marginRight}
      >
        <text
          textAnchor="middle"
          x="0"
          y="0"
          transform={`translate(${width / 2}, ${7 * (height / 8)})`}
        >
          {featureName}
        </text>
        {xScale && (
          <g transform={`translate(${marginLeft}, 0)`}>
            <Axis scale={xScale} tickFormat={tickFormat} />
          </g>
        )}
      </svg>
    </div>
  );
};
export default XAxis;
