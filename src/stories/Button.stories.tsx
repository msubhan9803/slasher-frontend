import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Button } from './Button';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Button>;

type ButtonStory = ComponentStory<typeof Button>;

const Template:ButtonStory = (args) => <Button {...args} />;

export const Primary:ButtonStory = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  primary: true,
  label: 'Button',
};

export const Secondary:ButtonStory = Template.bind({});
Secondary.args = {
  label: 'Button',
};

export const Large:ButtonStory = Template.bind({});
Large.args = {
  size: 'large',
  label: 'Button',
};

export const Small:ButtonStory = Template.bind({});
Small.args = {
  size: 'small',
  label: 'Button',
};
