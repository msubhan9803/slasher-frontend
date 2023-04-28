import { Factory } from 'fishery';
import { BetaTester } from '../../src/schemas/betaTester/betaTester.schema';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

export const betaTesterFactory = Factory.define<Partial<BetaTester>>(
  ({ sequence }) => new BetaTester({
    name: `BetaTester ${sequence}`,
    email: `BetaTester${sequence}@Example.com`,
  }),
);

addFactoryToRewindList(betaTesterFactory);
