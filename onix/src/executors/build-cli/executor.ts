import { PromiseExecutor, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';

const runExecutor: PromiseExecutor<ExecutorSchema> = async ({ moniker }) => {
  try {
    const command = `nx build app-cli-${moniker} --skip-nx-cache && echo '#! /usr/bin/env node' >> dist/temp && cat dist/apps/cli/${moniker}/main.js >> dist/temp && mv dist/temp dist/apps/cli/${moniker}/main.js && chmod +x dist/apps/cli/${moniker}/main.js && npm link`;

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
