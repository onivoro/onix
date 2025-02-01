import { ExecutorContext } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { loadEnvFile } from '../../functions/load-env-file.function';
import { executorFactory } from '../../functions/executor-factory.function';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { envFile, ormConfigPath, runOrRevert } = options;

  loadEnvFile(envFile);

  execSync(`npm run typeorm -- -d ${ormConfigPath} migration:${runOrRevert} -t=false`, { stdio: 'inherit' });
});
