type Props<CategoryFeatureValue extends string> = {
  encodings: [CategoryFeatureValue, string][];
  featureNameHeading?: string;
};

const Legend = <CategoryFeatureValue extends string>({
  encodings,
  featureNameHeading,
}: Props<CategoryFeatureValue>) => {
  return (
    <div className="flex w-full justify-center">
      <div className="flex flex-col py-1 px-2 items-center border">
        {featureNameHeading && (
          <h3 className="text-sm font-medium">{featureNameHeading}</h3>
        )}
        <div className="flex items-center justify-center gap-4">
          {encodings.map(([value, color], i) => (
            <div className="flex gap-2 items-center justify-center" key={i}>
              <div className="w-4 h-4" style={{ backgroundColor: color }}></div>
              <div className="text-sm">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Legend;
