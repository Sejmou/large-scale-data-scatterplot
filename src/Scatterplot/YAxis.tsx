import { Axis, Orient } from 'd3-axis-for-react';
import { useResizeDetector } from 'react-resize-detector';
import { useScatterplotStore } from './store';
import useAxisScales from './use-axis-scales';

type Props = {
  gridArea: string;
  tickFormat?: (d: number) => string;
};

const YAxis = ({ gridArea, tickFormat }: Props) => {
  const featureName = useScatterplotStore(
    state => state.yAxisConfig.featureName
  );

  const { width: width = 0, height: height = 0, ref } = useResizeDetector();
  const { yScale } = useAxisScales();
  const marginTop = useScatterplotStore(state => state.plotMargins.top);
  const marginBottom = useScatterplotStore(state => state.plotMargins.bottom);

  return (
    <div ref={ref} className="relative" style={{ gridArea }}>
      <svg
        className="absolute"
        viewBox={`0 0 ${width} ${height + marginTop + marginBottom}`}
        transform={`translate(1, ${-marginTop})`}
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
          <g transform={`translate(${width - 1}, ${marginTop})`}>
            <Axis scale={yScale} orient={Orient.left} tickFormat={tickFormat} />
          </g>
        )}
      </svg>
    </div>
  );
};
export default YAxis;
