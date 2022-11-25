import { User } from '../../types';

export interface ChatProps {
  userData?: User
  messages?: MessageProps[];
}
interface MessageProps {
  id: string;
  participant: string;
  message: string;
  time: string;
}

export interface ChatUserProps {
  userData?: User;
}
