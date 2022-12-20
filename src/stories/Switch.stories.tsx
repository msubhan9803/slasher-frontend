import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Switch from '../components/ui/Switch';

export default {
  title: 'Slasher/Switch',
  component: Switch,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} as ComponentMeta<typeof Switch>;

type SwitchStory = ComponentStory<typeof Switch>;

const Template: SwitchStory = (args) => <Switch {...args} />;

export const Checked: SwitchStory = Template.bind({});
Checked.args = {
  isChecked: false,
};
export const UnChecked: SwitchStory = Template.bind({});
Checked.args = {
  isChecked: true,
};
