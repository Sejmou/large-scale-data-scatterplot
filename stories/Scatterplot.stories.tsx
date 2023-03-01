import React from 'react';
import { Meta, Story } from '@storybook/react';
import ScatterplotChild, {
  AxisConfig,
  Props,
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
  component: ScatterplotChild,
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

const Template: Story<Props> = args => (
  <div className="w-96 h-128">
    <ScatterplotChild {...args} />
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
