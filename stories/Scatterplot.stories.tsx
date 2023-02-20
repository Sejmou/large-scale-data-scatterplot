import React from 'react';
import { Meta, Story } from '@storybook/react';
import Scatterplot, { AxisConfig, Props } from '../src';

const defaultXAxisConfig: AxisConfig = {
  data: [3, 1, 2, 4, 5, 8, 9, 10],
  featureName: 'Blub',
};

const defaultYAxisConfig: AxisConfig = {
  data: [5, 15, 25, 3, 12, 16, 18, 7, 2],
  featureName: 'Bla',
};

const meta: Meta = {
  title: 'Welcome',
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

const Template: Story<Props> = args => <Scatterplot {...args} />;

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
