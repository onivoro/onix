import { ExecutorContext, PromiseExecutor, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { exec, execSync, spawn } from 'child_process';

const executor: PromiseExecutor<ExecutorSchema> = async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { envPath, ecr, port } = options;
  const localPort = (Number(port) + 2000);
  try {
    const command = `open http://localhost:${localPort} & docker run -p ${localPort}:${port} --env="PORT=${port}" --env-file "${envPath}" "${ecr}"`;

    logger.info(command);

    execSync(command);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
};

export default executor;
