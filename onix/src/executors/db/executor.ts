import { ExecutorContext, PromiseExecutor, runExecutor } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { checkForBastion } from '../../utils/check-for-bastion.function';

const executor: PromiseExecutor<ExecutorSchema> = async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { envKey, envPath, ormConfigPath, requireBastion, runOrRevert } = options;


  try {
    checkForBastion(requireBastion);

    execSync(`export ${envKey}=${envPath} && npm run typeorm -- -d ${ormConfigPath} migration:${runOrRevert} -t=false`, { stdio: 'inherit' });

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
