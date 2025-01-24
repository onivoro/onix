import { ExecutorContext, logger, PromiseExecutor } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { loadEnvFile } from 'process';

const executor: PromiseExecutor<ExecutorSchema> = async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { envPath, ormConfigPath, runOrRevert } = options;


  try {
    if(envPath) {
      logger.info(`using "${envPath}"`);
      loadEnvFile(envPath);
    }

    execSync(`npm run typeorm -- -d ${ormConfigPath} migration:${runOrRevert} -t=false`, { stdio: 'inherit' });

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
