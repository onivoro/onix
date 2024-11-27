import { PromiseExecutor, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { getProjectPathFromName } from '../../utils/get-project-path-from-name.function';

const runExecutor: PromiseExecutor<ExecutorSchema> = async (options, context) => {
  try {
    const command = `playwright test -c ${getProjectPathFromName(context.projectName!)}/playwright.config.ts`;

    logger.info(command);

    execSync(command, { stdio: 'inherit' });

    return {
      success: true,
    };
  } catch (error) {
    return { success: false };
  }
};

export default runExecutor;
