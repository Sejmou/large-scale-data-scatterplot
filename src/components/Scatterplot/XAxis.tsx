import { Axis } from 'd3-axis-for-react';
import { useRef } from 'react';
import { useRefDimensions } from '../../hooks/use-ref-dimensions';
import { useScatterplotStore } from './store';

type Props = {
  featureName: string;
  gridArea: string;
};
const XAxis = ({ featureName, gridArea }: Props) => {
  const divRef = useRef<HTMLDivElement>(null);
  const { width, height } = useRefDimensions(divRef);
  const camera = useScatterplotStore(state => state.camera);
  const xScale = useScatterplotStore(state => state.xScaleDOMPixels);

  return (
    <div ref={divRef} className="relative" style={{ gridArea }}>
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
