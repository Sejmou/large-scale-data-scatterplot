type Props<CategoryFeatureValue extends string> = {
  encodings: [CategoryFeatureValue, string][];
};

const Legend = <CategoryFeatureValue extends string>({
  encodings,
}: Props<CategoryFeatureValue>) => {
  return (
    <div className="flex items-center justify-center p-2 gap-4">
      {encodings.map(([value, color], i) => (
        <div className="flex gap-2 items-center justify-center">
          <div className="w-4 h-4" style={{ backgroundColor: color }}></div>
          <div className="text-sm" key={i}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
};
export default Legend;
