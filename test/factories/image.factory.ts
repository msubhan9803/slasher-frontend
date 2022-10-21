import { Factory } from 'fishery';

type Image = {
  image_path: string;
};

export const imageFactory = Factory.define<Partial<Image[]>>(() => (
  [
    {
      image_path: '/feed/feed_sample1.jpg',
    },
    {
      image_path: '/feed/feed_sample2.jpg',
    },
  ]
));
