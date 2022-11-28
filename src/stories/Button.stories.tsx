import React from 'react';
import { ComponentStory, ComponentMeta, Story } from '@storybook/react';

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

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// TODO: Fix type here, unable to use `Story<Button>`. So fixing it as any for now.
const Template: any = (args: any) => <Button {...args} />;

export const Primary: Story = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  primary: true,
  label: 'Button',
};

export const Secondary: Story = Template.bind({});
Secondary.args = {
  label: 'Button',
};

export const Large: Story = Template.bind({});
Large.args = {
  size: 'large',
  label: 'Button',
};

export const Small: Story = Template.bind({});
Small.args = {
  size: 'small',
  label: 'Button',
};
