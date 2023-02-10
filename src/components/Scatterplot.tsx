type ScatterplotXYData<T extends string> = {
  [key in T]: number;
};

type ScatterplotCategoricalData<T extends string> = {
  [key in T]: string;
};

type Props<XYFeature extends string, CategoricalFeatureName extends string> = {
  axes: {
    data: ScatterplotXYData<XYFeature>[];
    xFeature: XYFeature;
    yFeature: XYFeature;
  };
  color?:
    | {
        data: ScatterplotCategoricalData<CategoricalFeatureName>[];
        currentFeature: CategoricalFeatureName; // TODO: think about better name
        encodings: {
          [key in CategoricalFeatureName]: { [value: string]: number };
        };
      }
    | string;
};

const Scatterplot = <
  XYFeature extends string,
  CategoricalFeatureName extends string
>({
  axes,
  color,
}: Props<XYFeature, CategoricalFeatureName>) => {
  const { data: xyData, xFeature, yFeature } = axes;

  const fillColor =
    typeof color === 'string'
      ? color
      : !color
      ? 'green'
      : color.encodings[color.currentFeature];

  return (
    <div>
      <p>This will soon be the scatterplot</p>
      <p>Its input data for the x and y axes is: {JSON.stringify(xyData)}</p>
      <p>
        {xFeature} will be plotted on the x-axis, while {yFeature} will be
        displayed on the y-axis.
      </p>
      {!color ? (
        <div>
          The default color{' '}
          <span style={{ color: fillColor }}>{fillColor}</span> will be used for
          coloring the scatterplot points.
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
            {Object.entries(color.encodings).map(
              ([featureName, colorUnknown], j) => {
                const color = colorUnknown as string;
                return (
                  <li key={j}>
                    {featureName}: <span style={{ color }}>{color}</span>
                  </li>
                );
              }
            )}
          </ul>
        </div>
      )}
      {color && typeof color === 'object' && (
        <div>Currently color-encoding {color.currentFeature}</div>
      )}
    </div>
  );
};
export default Scatterplot;
