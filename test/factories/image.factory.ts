import { Factory } from 'fishery';

type Image = {
  image_path: string;
};

export const imageFactory = Factory.define<Partial<Image[]>>(() => (
  [
    {
      image_path: 'https://source.unsplash.com/random/200x200?sig=1',
    },
    {
      image_path: 'https://source.unsplash.com/random/200x200?sig=2',
    },
  ]
));
