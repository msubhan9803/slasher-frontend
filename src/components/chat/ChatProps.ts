export interface ChatProps {
  messages?: MessageProps[];
  showCamera?: boolean;
  inputClassName?: string;
  conversationType?: string;
}

interface MessageProps {
  id: number
  participant: string;
  message: string;
  time: string;
}
