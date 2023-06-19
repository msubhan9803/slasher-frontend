import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean, IsNumber, IsOptional, IsString, validateSync,
} from 'class-validator';
import { DEFAULT_REQUEST_TIMEOUT } from '../constants';

class EnvironmentVariables {
  // We only need to specify parameters in this class that we want to transform

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  CRON_ENABLED: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  SEND_PUSH_NOTIFICATION: boolean;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  REQUEST_TIMEOUT: number;

  @IsString()
  UPLOAD_DIR: string;

  @IsOptional()
  @IsString()
  STORAGE_LOCATION_GENERATOR_PREFIX: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config);
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  if (!validatedConfig.REQUEST_TIMEOUT) {
    validatedConfig.REQUEST_TIMEOUT = DEFAULT_REQUEST_TIMEOUT;
  }
  if (!validatedConfig.STORAGE_LOCATION_GENERATOR_PREFIX) {
    validatedConfig.STORAGE_LOCATION_GENERATOR_PREFIX = '/';
  } else {
    if (!validatedConfig.STORAGE_LOCATION_GENERATOR_PREFIX.startsWith('/')) {
      validatedConfig.STORAGE_LOCATION_GENERATOR_PREFIX = `/${validatedConfig.STORAGE_LOCATION_GENERATOR_PREFIX}`;
    }
    if (!validatedConfig.STORAGE_LOCATION_GENERATOR_PREFIX.endsWith('/')) {
      validatedConfig.STORAGE_LOCATION_GENERATOR_PREFIX = `${validatedConfig.STORAGE_LOCATION_GENERATOR_PREFIX}/`;
    }
  }
  return validatedConfig;
}
