import { axisBottom, axisLeft, BaseType, Selection } from 'd3';
import { useRef } from 'react';
import { useScatterplotStore } from './store';
import useAxisScales from './use-axis-scales';
import { useD3 } from './use-d3';

type Props = {
  color?: string;
};
const PlotSVGContent = ({ color = '#e0e0e0' }: Props) => {
  const { xScale, yScale } = useAxisScales();
  const canvasWidth = useScatterplotStore(
    state => state.plotCanvasDimensionsDOM?.width ?? 0
  );
  const canvasHeight = useScatterplotStore(
    state => state.plotCanvasDimensionsDOM?.height ?? 0
  );
  const marginTop = useScatterplotStore(state => state.plotMargins.top);
  const marginRight = useScatterplotStore(state => state.plotMargins.right);
  const marginBottom = useScatterplotStore(state => state.plotMargins.bottom);
  const marginLeft = useScatterplotStore(state => state.plotMargins.left);

  const ref = useRef<SVGSVGElement>(null);

  useD3(
    ref,
    svg => {
      if (!xScale || !yScale || !canvasWidth || !canvasHeight) return;
      console.log(ref.current);
      const xAxis = axisBottom(xScale).tickSize(canvasHeight);
      const yAxis = axisLeft(yScale).tickSize(-canvasWidth);

      const xAxisSvg = svg.select('.x').call(xAxis as any);
      svg.select('.y').call(yAxis as any);

      applyRightPlotWindowBorderWorkaround(xAxisSvg);

      svg.selectAll('.tick line').attr('stroke', color);
    },
    [xScale, yScale, canvasWidth, canvasHeight]
  );

  const plotAreaWidth = canvasWidth + marginLeft + marginRight;
  const plotAreaHeight = canvasHeight + marginTop + marginBottom;

  return (
    <div className="w-full h-full absolute -z-10">
      <svg
        viewBox={`0 0 ${plotAreaWidth} ${plotAreaHeight}`}
        width={plotAreaWidth}
        height={plotAreaHeight}
        ref={ref}
        id="plot-content-svg"
      >
        <XAxisLabel />
        <YAxisLabel />
        <g transform={`translate(${marginLeft}, ${marginTop})`}>
          <g className="x"></g>
          <g className="y"></g>
        </g>
      </svg>
    </div>
  );
};
export default PlotSVGContent;

function applyRightPlotWindowBorderWorkaround(
  xAxisSvg: Selection<BaseType, unknown, null, undefined>
) {
  // this is only necessary as for some reason outer border of domain path is not rendered when the scatterplot is completely zoomed out
  const lastXGridLine = xAxisSvg.select('.tick:last-of-type line').node() as
    | SVGLineElement
    | undefined;
  const domainPath = xAxisSvg.select('.domain').node() as
    | SVGPathElement
    | undefined;

  if (lastXGridLine && domainPath) {
    const deltaX = Math.abs(
      domainPath.getBoundingClientRect().right -
        lastXGridLine.getBoundingClientRect().right
    );
    if (deltaX < 1) {
      lastXGridLine.style.opacity = '0';
    } else {
      lastXGridLine.style.opacity = '1';
    }
  }
}

const XAxisLabel = () => {
  const featureName = useScatterplotStore(
    state => state.xAxisConfig.featureName
  );
  const x = useScatterplotStore(
    state =>
      state.plotMargins.left + (state.plotCanvasDimensionsDOM?.width ?? 0) * 0.5
  );
  const y = useScatterplotStore(
    state =>
      state.plotMargins.top +
      (state.plotCanvasDimensionsDOM?.height ?? 0) +
      state.plotMargins.bottom * 0.56
  );

  return (
    <text
      textAnchor="middle"
      transform={`translate(${x}, ${y})`}
      fontSize="0.9rem"
    >
      {featureName}
    </text>
  );
};

const YAxisLabel = () => {
  const featureName = useScatterplotStore(
    state => state.yAxisConfig.featureName
  );
  const x = useScatterplotStore(state => state.plotMargins.left * 0.5);
  const y = useScatterplotStore(
    state =>
      state.plotMargins.top + (state.plotCanvasDimensionsDOM?.height ?? 0) * 0.5
  );

  return (
    <text
      textAnchor="middle"
      transform={`translate(${x}, ${y}) rotate(-90)`}
      fontSize="0.9rem"
    >
      {featureName}
    </text>
  );
};
