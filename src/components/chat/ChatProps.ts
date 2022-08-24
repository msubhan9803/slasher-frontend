export interface ChatProps {
  messages?: MessageProps[];
}
interface MessageProps {
  id: number
  participant: string;
  message: string;
  time: string;
}
