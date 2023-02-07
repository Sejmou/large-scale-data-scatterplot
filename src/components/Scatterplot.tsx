type ScatterplotData<T extends string> = {
  [key in T]: number;
};

type Props<T extends string> = {
  data: ScatterplotData<T>[];
  xFeature: T;
  yFeature: T;
  categoricalFeatures?: {
    featureName: string;
    colorEncodings: { value: string; color: string }[];
  }[];
};

const Scatterplot = <T extends string>({
  data,
  xFeature,
  yFeature,
}: Props<T>) => {
  return (
    <div>
      <p>This will soon be the scatterplot</p>
      <p>Its input data is: {JSON.stringify(data)}</p>
      <p>
        {xFeature} will be plotted on the x-axis, while {yFeature} will be
        displayed on the y-axis.
      </p>
    </div>
  );
};
export default Scatterplot;
