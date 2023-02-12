import { useMemo } from 'react';
import { MapWithDefault } from '../utils/misc';

type Props<CategoryFeatureValue extends string> = {
  xAxis: {
    data: number[];
    featureName: string;
  };
  yAxis: {
    data: number[];
    featureName: string;
  };
  color?:
    | {
        featureName: string;
        data: CategoryFeatureValue[];
        encodings: [CategoryFeatureValue, string][];
      }
    | string;
};

const defaultColor = 'green';

const Scatterplot = <CategoryFeatureValue extends string>({
  xAxis,
  yAxis,
  color,
}: Props<CategoryFeatureValue>) => {
  console.log({ xAxis, yAxis, color });
  const { data: xData, featureName: xFeature } = xAxis;
  const { data: yData, featureName: yFeature } = yAxis;

  const fillColorMap = useMemo(
    () =>
      new MapWithDefault<CategoryFeatureValue, string>(
        typeof color == 'string' ? () => color : () => defaultColor,
        typeof color != 'string' && color?.encodings
          ? color.encodings
          : undefined
      ),
    [color]
  );

  return (
    <div className="overflow-hidden">
      <p>This will soon be the scatterplot</p>
      <p>Its input data for the x and y axes is:</p>
      <p className="text-ellipsis">{JSON.stringify(xData)}</p>
      <p className="text-ellipsis">{JSON.stringify(yData)}</p>
      <p>
        {xFeature} will be plotted on the x-axis, while {yFeature} will be
        displayed on the y-axis.
      </p>
      {!color ? (
        <div>
          The default color{' '}
          <span style={{ color: defaultColor }}>{defaultColor}</span> will be
          used for coloring the scatterplot points.
        </div>
      ) : typeof color === 'string' ? (
        <div>
          <span style={{ color }}>{color}</span> will be used as the fill color
          for the dots on the plot.
        </div>
      ) : (
        <div>
          The following color encodings will be used:
          <ul>
            {fillColorMap &&
              [...fillColorMap.entries()].map(([feature, color]) => (
                <li key={feature}>
                  {feature}: <span style={{ color }}>{color}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
      {color && typeof color === 'object' && (
        <div>Currently color-encoding {color.featureName}</div>
      )}
    </div>
  );
};
export default Scatterplot;