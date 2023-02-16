import { Axis, Orient } from 'd3-axis-for-react';
import { useRef } from 'react';
import { useRefDimensions } from '../../hooks/use-ref-dimensions';
import { useScatterplotStore } from './store';

type Props = {
  featureName: string;
  gridArea: string;
};
const YAxis = ({ featureName, gridArea }: Props) => {
  const divRef = useRef<HTMLDivElement>(null);
  const { width, height } = useRefDimensions(divRef);
  const yScale = useScatterplotStore(state => state.yScaleDOMPixels);

  return (
    <div ref={divRef} className="relative" style={{ gridArea }}>
      <svg className="absolute" viewBox={`0 0 ${width} ${height + 10}`}>
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
            <Axis scale={yScale} orient={Orient.left} />
          </g>
        )}
      </svg>
    </div>
  );
};
export default YAxis;
