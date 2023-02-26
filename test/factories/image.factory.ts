import { Factory } from 'fishery';
import { Image } from '../../src/schemas/shared/image.schema';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

export const imageFactory = Factory.define<Image>(() => (
  {
    image_path: '/feed/feed_sample1.jpg',
  }
));

addFactoryToRewindList(imageFactory);
