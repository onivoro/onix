import { ExecutorContext, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { loadEnvFile } from '../../functions/load-env-file.function';
import { executorFactory } from '../../functions/executor-factory.function';
import { pm } from '../../functions/pm.function';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { envFile, ormConfigPath, runOrRevert } = options;

  loadEnvFile(envFile);

  logger.info(`PACKAGE.JSON SHOULD HAVE A SCRIPT NAMED "typeorm" IN ORDER TO USE THIS EXECUTOR`)

  execSync(`${pm(context).exec} run typeorm -- -d ${ormConfigPath} migration:${runOrRevert} -t=false`, { stdio: 'inherit' });
});
