import { ChangeEvent } from 'react';
import { User } from '../../types';

export interface ChatProps {
  userData?: User
  messages?: MessageProps[];
  sendMessageClick?: () => void;
  setMessage?: (value: string) => void;
  message?: string;
  handleFileChange?: (value: ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile?: (value: File, index: number) => void;
  imageArray?: any[];
  messageLoading?: boolean;
  descriptionArray?: string[];
  setDescriptionArray?: (value: string[]) => void;
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
