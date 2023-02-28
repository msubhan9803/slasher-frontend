import { Factory } from 'fishery';

const factoriesToRewind: Factory<any>[] = [];

export const addFactoryToRewindList = (factory: Factory<any>) => {
  factoriesToRewind.push(factory);
};

export const rewindAllFactories = () => {
  for (const factory of factoriesToRewind) {
    factory.rewindSequence();
  }
};
