import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean, IsOptional, validateSync,
} from 'class-validator';

class EnvironmentVariables {
  // We only need to specify parameters in this class that we want to transform

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  CRON_ENABLED: boolean;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config);
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
