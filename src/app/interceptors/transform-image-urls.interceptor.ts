/* eslint-disable no-param-reassign */
import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { relativeToFullImagePath } from '../../utils/image-utils';
import { simpleJsonPath } from '../../utils/simple-path-utils';

/**
 * Runs the relativeToFullImagePath function for the properties specified by JSONPath.
 * Usage examples:
 * @TransformImageUrls('$[*].profilePic')
 * @TransformImageUrls('$.profilePic', '$.coverPhoto')
 */
@Injectable()
export class TransformImageUrlsInterceptor implements NestInterceptor {
  constructor(private readonly config: ConfigService, private readonly reflector: Reflector) { }

  // eslint-disable-next-line class-methods-use-this
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const jsonPathsToTransform = this.reflector.get<string[]>('jsonPathsToTransform', context.getHandler());
    return next
      .handle()
      .pipe(map((value) => {
        for (const jsonPathToField of jsonPathsToTransform) {
          const lastIndexOfPeriod = jsonPathToField.lastIndexOf('.');
          const lastIndexOfLeftBracket = jsonPathToField.lastIndexOf('[');

          // eslint-disable-next-line no-continue
          if (lastIndexOfPeriod === -1 && lastIndexOfLeftBracket === -1) { continue; }

          let jsonPathToObject;
          let propertyKey;

          if (lastIndexOfPeriod > lastIndexOfLeftBracket) {
            jsonPathToObject = jsonPathToField.substring(0, lastIndexOfPeriod);
            propertyKey = jsonPathToField.substring(lastIndexOfPeriod + 1);
          } else {
            jsonPathToObject = jsonPathToField.substring(0, lastIndexOfLeftBracket);
            propertyKey = jsonPathToField.substring(lastIndexOfLeftBracket);
          }

          const matches = simpleJsonPath(jsonPathToObject, value);
          // Sometimes, due to the way that the value is constructed, it will have multiple
          // references to the same object instance, so we'll deduplicate by convertingt he array
          // of matches to a Set (which will only allow one instance of a partiuclar object
          // instance to be present).
          const deduplicatedMatches = new Set(matches);

          // If propertyName is array notation, get key from inside brackets
          if (propertyKey.match(/\[[*\d]\]/)) {
            propertyKey = propertyKey.substring(1, propertyKey.length - 1);
            if (propertyKey !== '*') {
              propertyKey = parseInt(propertyKey, 10); // Parse as number for array index access
            }
          }

          for (const match of deduplicatedMatches) {
            if (propertyKey === '*') {
              if (match instanceof Array) {
                // Transform every element in this array
                for (let i = 0; i < match.length; i += 1) {
                  match[i] = relativeToFullImagePath(this.config, match[i]);
                }
              }
              // NOTE: We are NOT supporing the transformation of all keys within an object.
              // This won't work because Mongoose object properties can't be easily iterated over,
              // since they aren't returned by hasOwnProperty.
            } else if (match[propertyKey]) {
              match[propertyKey] = relativeToFullImagePath(this.config, match[propertyKey]);
            }
          }
        }

        return value;
      }));
  }
}
