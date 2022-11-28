import React from 'react';
import { ComponentStory, ComponentMeta, Story } from '@storybook/react';

import { Header } from './Header';

export default {
  title: 'Example/Header',
  component: Header,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} as ComponentMeta<typeof Header>;

// TODO: Fix args type
function Template(args: any) {
  return <Header {...args} />;
}

export const LoggedIn: Story = Template.bind({});
LoggedIn.args = {
  user: {
    name: 'Jane Doe',
  },
};

export const LoggedOut: Story = Template.bind({});
LoggedOut.args = {};
