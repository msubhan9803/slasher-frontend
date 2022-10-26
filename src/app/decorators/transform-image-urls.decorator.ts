import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { TransformImageUrlsInterceptor } from '../interceptors/transform-image-urls.interceptor';

export function TransformImageUrls(...jsonPaths: string[]) {
  return applyDecorators(
    SetMetadata('jsonPathsToTransform', jsonPaths),
    UseInterceptors(TransformImageUrlsInterceptor),
  );
}
