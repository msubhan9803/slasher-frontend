import { Factory } from 'fishery';
import { Notification } from '../../src/schemas/notification.schema';

export const notificationFactory = Factory.define<Partial<Notification>>(
  ({ sequence }) => new Notification({
    notificationMsg: `Message ${sequence}`,
  }),
);
