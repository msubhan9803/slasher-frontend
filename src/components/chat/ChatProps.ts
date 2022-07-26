export interface ChatProps {
  messages?: MessageProps[];
  showCamera?: boolean;
  inputClassName?: string;
  conversationType?: 'dating' | 'standard';
}

interface MessageProps {
  id: number
  participant: string;
  message: string;
  time: string;
}
