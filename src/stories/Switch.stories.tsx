import React from 'react';
import { ComponentStory, ComponentMeta, Story } from '@storybook/react';

import Switch from '../components/ui/Switch';

export default {
  title: 'Slasher/Switch',
  component: Switch,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} as ComponentMeta<typeof Switch>;

// TODO: Fix typing of args
function Template(args: any) {
  return <Switch {...args} />;
}

export const Checked: Story = Template.bind({});
Checked.args = {
  isChecked: false,
};
export const UnChecked: Story = Template.bind({});
Checked.args = {
  isChecked: true,
};
