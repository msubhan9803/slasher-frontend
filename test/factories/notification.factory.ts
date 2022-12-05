import { Factory } from 'fishery';
import { NotificationType } from '../../src/schemas/notification/notification.enums';
import { Notification } from '../../src/schemas/notification/notification.schema';

export const notificationFactory = Factory.define<Partial<Notification>>(
  ({ sequence }) => new Notification({
    notificationMsg: `Message ${sequence}`,
    notifyType: NotificationType.Type1,
  }),
);
