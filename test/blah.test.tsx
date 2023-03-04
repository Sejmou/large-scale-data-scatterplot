import React from 'react';
import ReactDOM from 'react-dom';
import { Default as Scatterplot } from '../stories/Scatterplot.stories';

//TODO: some day add actual tests lol

describe('Scatterplot', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Scatterplot />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
