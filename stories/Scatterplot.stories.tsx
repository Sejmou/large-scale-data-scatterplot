import React, { useCallback, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import Scatterplot, {
  ScatterplotProps,
  VertexColorEncodingConfig,
  SingleVertexColorConfig,
} from '../src';
import { AxisConfig } from '../src';
import { Tooltip } from 'react-tooltip';

import 'react-tooltip/dist/react-tooltip.css'; // required for tooltip story (need to import as otherwise no tooltip is shown)
import '../tailwind.css'; // TODO: figure out how to prevent having to import this in every story

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

export const WithColorEncodingsNoHeading = Template.bind({});
const customColorEncodingsNoHeading: VertexColorEncodingConfig = {
  mode: 'color-encodings',
  encodings: [
    ['A', '#00ffff'],
    ['B', '#ff00ff'],
    ['C', '#0000ff'],
  ],
  data: ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'B'],
};
WithColorEncodingsNoHeading.args = {
  color: customColorEncodingsNoHeading,
};

export const WithColorEncodingsAndHeading = Template.bind({});
const customColorEncodings: VertexColorEncodingConfig = {
  mode: 'color-encodings',
  encodings: [
    ['A', '#00ffff'],
    ['B', '#ff00ff'],
    ['C', '#0000ff'],
  ],
  featureNameHeading: 'Some categorical feature',
  data: ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'B'],
};
WithColorEncodingsAndHeading.args = {
  color: customColorEncodings,
};

export const TickFormat = Template.bind({});
const xAxisWithTickFormat: AxisConfig = {
  data: [
    2015, 2016, 2017, 2018, 2019, 2020, 2016, 2018, 2019, 2020, 2015, 2015,
    2020, 2019, 2019,
  ],
  featureName: 'Year',
  tickFormat: (tickValue: number) =>
    `${tickValue === Math.round(tickValue) ? tickValue : ''}`,
};

const yAxisWithTickFormat: AxisConfig = {
  featureName: 'Cost',
  data: [
    900, 1000, 2000, 1300, 1500, 1600, 1700, 1800, 1900, 1000, 1100, 1200, 1300,
    1400, 1500,
  ],
  tickFormat: (tickValue: number) => `$${tickValue}`,
};
TickFormat.args = {
  xAxis: xAxisWithTickFormat,
  yAxis: yAxisWithTickFormat,
};

const DarkModeTemplate: Story<ScatterplotProps> = args => (
  <div className="w-[600px] h-[400px] bg-gray-800">
    <Scatterplot {...args} darkMode />
  </div>
);

export const DarkMode = DarkModeTemplate.bind({});

const PointInteractionTemplate: Story<ScatterplotProps> = args => {
  const [tooltipContent, setTooltipContent] = useState<React.ReactNode>(null);

  const handlePointHoverStart = useCallback((pointIndex: number) => {
    const pointMetadata = {
      x: defaultXAxisConfig.data[pointIndex],
      y: defaultYAxisConfig.data[pointIndex],
      category: customColorEncodings.data[pointIndex],
    };
    const xFeatureName = defaultXAxisConfig.featureName;
    const yFeatureName = defaultYAxisConfig.featureName;
    const categoryFeatureName = customColorEncodings.featureNameHeading;
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

  return (
    <div className="w-[600px] h-[400px]">
      <Scatterplot
        {...args}
        onPointHoverStart={handlePointHoverStart}
        onPointHoverEnd={handlePointHoverEnd}
        canvasId={'scatterplot-canvas'}
      />
      <Tooltip float anchorSelect="#scatterplot-canvas">
        {tooltipContent}
      </Tooltip>
    </div>
  );
};

const pointInteractionProps: ScatterplotProps = {
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
    const categoryFeatureName = customColorEncodings.featureNameHeading;
    alert(
      `Clicked point at index ${pointIndex}\n${xFeatureName}: ${pointMetadata.x}\n${yFeatureName}: ${pointMetadata.y}\n${categoryFeatureName}: ${pointMetadata.category}`
    );
  },
  onPointTap: pointIndex => {
    const pointMetadata = {
      x: defaultXAxisConfig.data[pointIndex],
      y: defaultYAxisConfig.data[pointIndex],
      category: customColorEncodings.data[pointIndex],
    };
    const xFeatureName = defaultXAxisConfig.featureName;
    const yFeatureName = defaultYAxisConfig.featureName;
    const categoryFeatureName = customColorEncodings.featureNameHeading;
    alert(
      `Tapped point at index ${pointIndex}\n${xFeatureName}: ${pointMetadata.x}\n${yFeatureName}: ${pointMetadata.y}\n${categoryFeatureName}: ${pointMetadata.category}`
    );
  },
};

export const PointInteractionAndTooltip = PointInteractionTemplate.bind({});
PointInteractionAndTooltip.args = pointInteractionProps;
