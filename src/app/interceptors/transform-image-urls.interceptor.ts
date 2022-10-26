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
          // If propertyName is array notation, get key from inside brackets
          if (propertyKey.match(/\[[*\d]\]/)) {
            propertyKey = propertyKey.substring(1, propertyKey.length - 1);
            if (propertyKey !== '*') {
              propertyKey = parseInt(propertyKey, 10); // important: make this a number!
            }
          }

          for (const match of matches) {
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
