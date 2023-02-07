type PlottableFeatures<T extends string> = {
  [key in T]: number;
};

const testFeatures: PlottableFeatures<'bla' | 'blub'> = {
  bla: 1,
  blub: 2,
};

type Props<T extends string> = {
  data: PlottableFeatures<T>[];
  xFeature: T;
  yFeature: T;
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
