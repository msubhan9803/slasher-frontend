import { Factory } from 'fishery';
import { Image } from '../../src/schemas/shared/image.schema';

export const imageFactory = Factory.define<Image>(() => (
  {
    image_path: '/feed/feed_sample1.jpg',
  }
));
