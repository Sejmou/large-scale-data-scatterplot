import { scaleLinear } from 'd3';
import { Axis } from 'd3-axis-for-react';
import { useEffect, useMemo, useRef } from 'react';
import { useRefDimensions } from '../../hooks/use-ref-dimensions';
import { useScatterplotStore } from './store';

type Props = {
  featureName: string;
  gridArea: string;
};
const XAxis = ({ featureName, gridArea }: Props) => {
  const divRef = useRef<HTMLDivElement>(null);
  const { width, height } = useRefDimensions(divRef);
  const camPos = useScatterplotStore(state => state.camPos);
  const xScale = useScatterplotStore(state => state.xScaleDOMPixels);
  const far = useScatterplotStore(state => state.far);
  const near = useScatterplotStore(state => state.near);
  const zoomLevelScale = useMemo(
    () => scaleLinear().domain([far, near]).range([1, 100]),
    [near, far]
  );

  useEffect(() => {
    console.log(camPos);
    const zoomLevel = zoomLevelScale(camPos[2]);
    console.log(zoomLevel);
  }, [camPos]);

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
