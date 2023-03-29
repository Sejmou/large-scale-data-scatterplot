import React, { useCallback, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import Scatterplot, {
  AxisConfig,
  ScatterplotProps,
  VertexColorEncodingConfig,
  SingleVertexColorConfig,
} from '../src';
import '../tailwind.css';

const defaultXAxisConfig: AxisConfig = {
  data: [3, 1, 2, 4, 5, 8, 9, 10],
  featureName: 'Blub',
};

const defaultYAxisConfig: AxisConfig = {
  data: [5, 15, 25, 3, 12, 16, 18, 7],
  featureName: 'Bla',
};

const meta: Meta = {
  title: 'Scatterplot',
  component: Scatterplot,
  argTypes: {
    xAxis: {
      defaultValue: defaultXAxisConfig,
    },
    yAxis: {
      defaultValue: defaultYAxisConfig,
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<ScatterplotProps> = args => (
  <div className="w-[600px] h-[400px]">
    <Scatterplot {...args} />
  </div>
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

export const WithCustomColor = Template.bind({});
const customColor: SingleVertexColorConfig = {
  mode: 'same-for-all',
  value: '#00ffff',
};
WithCustomColor.args = {
  color: customColor,
};

Default.args = {};

export const WithColorEncodings = Template.bind({});
const customColorEncodings: VertexColorEncodingConfig = {
  mode: 'color-encodings',
  encodings: [
    ['A', '#00ffff'],
    ['B', '#ff00ff'],
    ['C', '#0000ff'],
  ],
  featureName: 'Some categorical feature',
  data: ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'B'],
};
WithColorEncodings.args = {
  color: customColorEncodings,
};

const PointerEventsTemplate: Story<ScatterplotProps> = args => {
  const [tooltipContent, setTooltipContent] = useState<React.ReactNode>(null);

  const handlePointHoverStart = useCallback((pointIndex: number) => {
    const pointMetadata = {
      x: defaultXAxisConfig.data[pointIndex],
      y: defaultYAxisConfig.data[pointIndex],
      category: customColorEncodings.data[pointIndex],
    };
    const xFeatureName = defaultXAxisConfig.featureName;
    const yFeatureName = defaultYAxisConfig.featureName;
    const categoryFeatureName = customColorEncodings.featureName;
    setTooltipContent(
      <div>
        <div className="font-bold">Point at index {pointIndex}</div>
        <div>
          {xFeatureName}: {pointMetadata.x}
        </div>
        <div>
          {yFeatureName}: {pointMetadata.y}
        </div>
        <div>
          {categoryFeatureName}: {pointMetadata.category}
        </div>
      </div>
    );
  }, []);

  const handlePointHoverEnd = useCallback(() => {
    setTooltipContent(null);
  }, []);

  console.log(tooltipContent);

  console.log({ args });

  return (
    <div className="w-[600px] h-[400px]">
      <Scatterplot
        {...args}
        onPointHoverStart={handlePointHoverStart}
        onPointHoverEnd={handlePointHoverEnd}
        tooltipContent={tooltipContent ?? undefined}
      />
    </div>
  );
};

const pointerEventExampleProps: ScatterplotProps = {
  xAxis: defaultXAxisConfig,
  yAxis: defaultYAxisConfig,
  color: customColorEncodings,
  onPointClick: pointIndex => {
    const pointMetadata = {
      x: defaultXAxisConfig.data[pointIndex],
      y: defaultYAxisConfig.data[pointIndex],
      category: customColorEncodings.data[pointIndex],
    };
    const xFeatureName = defaultXAxisConfig.featureName;
    const yFeatureName = defaultYAxisConfig.featureName;
    const categoryFeatureName = customColorEncodings.featureName;
    alert(
      `Clicked point at index ${pointIndex}\n${xFeatureName}: ${pointMetadata.x}\n${yFeatureName}: ${pointMetadata.y}\n${categoryFeatureName}: ${pointMetadata.category}`
    );
  },
};

export const PointerEventsAndTooltip = PointerEventsTemplate.bind({});
PointerEventsAndTooltip.args = pointerEventExampleProps;
