import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Header } from './Header';

export default {
  title: 'Example/Header',
  component: Header,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} as ComponentMeta<typeof Header>;

type HeaderStory = ComponentStory<typeof Header>;

const Template: HeaderStory = (args) => <Header {...args} />;

export const LoggedIn: HeaderStory = Template.bind({});
LoggedIn.args = {
  user: {
    name: 'Jane Doe',
  },
};

export const LoggedOut: HeaderStory = Template.bind({});
LoggedOut.args = {};
