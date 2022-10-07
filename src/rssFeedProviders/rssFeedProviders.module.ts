import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RssFeedProvider, RssFeedProviderSchema } from '../schemas/rssFeedProvider/rssFeedProvider.schema';
import { addPrePostHooks } from '../schemas/rssFeedProvider/rssFeedProvider.pre-post-hooks';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: RssFeedProvider.name,
        useFactory: () => {
          const schema = RssFeedProviderSchema;
          addPrePostHooks(schema);
          return schema;
        },
      },
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class RssFeedProvidersModule { }
