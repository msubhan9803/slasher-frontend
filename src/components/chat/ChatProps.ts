import { User } from '../../types';

export interface ChatProps {
  userData?: User
  messages?: MessageProps[];
  sendMessageClick?: () => void;
  setMessage?: (value: string) => void;
  message?: string;
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
