import { ExecutorContext, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { executorFactory } from '../../functions/executor-factory.function';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { envFile, ecr, port, environment = {} } = options;

  const envExpression = Object.entries(environment)
    .map(([key, value]) => `--env="${key}=${value}"`)
    .join(' ');
  const envFileExpression = envFile ? ` --env-file "${envFile}"` : '';
  const command = `open http://localhost:${port} & docker run -p ${port}:${port} --env="PORT=${port}"${envFileExpression}${envExpression?.length ? (' ' + envExpression) : ''} "${ecr}"`;

  logger.info(command);

  execSync(command);
});
