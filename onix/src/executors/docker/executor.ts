import { ExecutorContext, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { executorFactory } from 'onix/src/functions/executor-factory.function';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { envFile, ecr, port } = options;
  const localPort = (Number(port) + 2000);

  const command = `open http://localhost:${localPort} & docker run -p ${localPort}:${port} --env="PORT=${port}" --env-file "${envFile}" "${ecr}"`;

  logger.info(command);

  execSync(command);
});
